# Rate Limiter Bug Fixes — Deep Dive

> **Module:** `com.medcore.common.ratelimit`
> **Files touched:** `RateLimitFilter.java`, `RateLimitService.java`
> **Branch:** `fix/rate-limiter-bugs-1-2`
> **Date:** November 2026

---

## 📑 Table of Contents

1. Context — Why Rate Limiting Matters
2. Problem 1: Cross-Endpoint Counter Pollution
3. Problem 2: Non-Atomic INCR + EXPIRE
4. Key Terms Explained (Glossary)
5. Reference: Redis Commands Used
6. Rate Limiting Algorithms Comparison
7. Common Pitfalls & Future Improvements
8. Interview Prep Questions

---

## 1. Context — Why Rate Limiting Matters

### What is Rate Limiting?

Rate limiting is the practice of **restricting how many requests a client can make to a resource in a given time window**.

### Why do we need it in MedCore HMS?

| Threat | Without Rate Limiting | With Rate Limiting |
|--------|----------------------|-------------------|
| **Brute force login** | Attacker tries 1M passwords/hour | Blocked after 10 attempts/min |
| **Spam registration** | Bots create thousands of fake accounts | Blocked after 5 attempts/min |
| **Token refresh abuse** | Stolen token used to DDoS backend | Blocked after 20 attempts/min |
| **Resource exhaustion** | API/DB overwhelmed | System stays up |

### Our Design Choices

- **Where it runs:** `RateLimitFilter` — a Servlet filter that runs **before** Spring Security's auth filter. This means rate limiting applies even to unauthenticated requests (login attempts).
- **Storage:** Redis — a shared, fast, in-memory data store. All app instances check the same counter.
- **Algorithm:** **Fixed Window Counter** — count requests per minute per `(clientIp, action)` pair.
- **Threshold:** Different per endpoint (login=10, register=5, refresh=20 per minute).

### Request Flow

```
Client → RateLimitFilter → JwtAuthenticationFilter → Controller → Service → DB
              ↓
          Redis (counter)
```

**Critical:** If rate limiter says "too many requests", it returns 429 immediately. **No** auth, no DB, no business logic runs. Cheapest possible rejection.

---

## 2. Problem 1: Cross-Endpoint Counter Pollution

### 2.1 The Original Code

```java
// RateLimitService.java (BEFORE FIX)
public boolean isAllowed(String clientKey, int maxRequests) {
    String key = "rate_limit:" + clientKey;   // ⚠️ Only client key
    Long count = redisTemplate.opsForValue().increment(key);
    if (count != null && count == 1) {
        redisTemplate.expire(key, WINDOW);
    }
    return count != null && count <= maxRequests;
}
```

```java
// RateLimitFilter.java (BEFORE FIX)
if (path.equals("/api/v1/auth/login")) {
    maxRequests = 10;
} else if (path.equals("/api/v1/auth/register")) {
    maxRequests = 5;
} else if (path.equals("/api/v1/auth/refresh")) {
    maxRequests = 20;
}
// ...
boolean allowed = rateLimitService.isAllowed(clientIp, maxRequests);
```

### 2.2 The Bug — Cross-Endpoint Counter Pollution

**Root cause:** The Redis key is `rate_limit:{clientIp}` — the **endpoint/action is NOT part of the key**.

**Result:** All three endpoints (login, register, refresh) share **one Redis counter** per IP. Their individual limits (10/5/20) are meaningless because they're counting against the **same counter**.

#### Failure Scenario

| Time | Request | Redis Counter | Limit for endpoint | Result |
|------|---------|---------------|---------------------|--------|
| T+0s | POST /login | 1 | 10 | ✅ Allowed |
| T+2s | POST /login | 2 | 10 | ✅ Allowed |
| T+5s | POST /register | 3 | 5 | ✅ Allowed (but wrong!) |
| T+8s | POST /refresh | 4 | 20 | ✅ Allowed (but wrong!) |
| T+10s | POST /login | 5 | 10 | ✅ Allowed |
| ... | POST /login x6 more | 11 | 10 | ❌ **BLOCKED** |

**At T+20s**, the user sends login request #11. Since the counter is already at 11 (cumulative across all endpoints), the user is blocked **even though they only tried login 8 times** — under the 10-limit.

### 2.3 Real-World Consequences

#### A) Legitimate Users Get Blocked
A user who logs in, registers a different account, and refreshes their token within a minute will hit the shared counter. They get blocked without understanding why.

#### B) DoS via Endpoint Weaponization
An attacker sends 5 requests to `/register` (hits limit, gets 429). But those 5 requests **incremented the shared counter to 5**. Then 5 more requests to `/login` → counter = 10 → **legitimate users can't log in**.

Even worse: an attacker who can trigger `/register` 10 times a minute **permanently blocks all logins** from their IP.

#### C) Refresh Endpoint is Useless
Refresh limit is 20, but login counter shares it. If login is already 10 (limit hit), the shared counter = 10. Refresh has 10 remaining "budget" — but they're **login's requests**, not refresh's. Refresh effectively has a limit of `20 - (login usage)`.

#### D) Debugging Nightmare
Logs say "rate limit exceeded" but Redis has one shared key. You can't tell which endpoint actually caused the block without adding more instrumentation.

### 2.4 The Fix

```java
// RateLimitService.java (AFTER FIX)
public boolean isAllowed(String clientKey, String action, int maxRequests) {
    String key = "rate_limit:" + action + ":" + clientKey;   // ✅ Action in key
    Long count = redisTemplate.opsForValue().increment(key);
    if (count != null && count == 1) {
        redisTemplate.expire(key, WINDOW);
    }
    return count != null && count <= maxRequests;
}
```

```java
// RateLimitFilter.java (AFTER FIX)
private String resolveAction(String path) {
    String normalized = (path.length() > 1 && path.endsWith("/"))
            ? path.substring(0, path.length() - 1)  // ✅ Trailing slash normalized
            : path;

    return switch (normalized) {
        case "/api/v1/auth/login"    -> "login";
        case "/api/v1/auth/register" -> "register";
        case "/api/v1/auth/refresh"  -> "refresh";
        default -> null;
    };
}
```

**New Redis key structure:**
```
rate_limit:login:203.0.113.5      → login counter for this IP
rate_limit:register:203.0.113.5   → register counter for this IP
rate_limit:refresh:203.0.113.5    → refresh counter for this IP
```

Each endpoint gets its own **independent bucket**. One endpoint's traffic can no longer consume another's budget.

### 2.5 Design Decisions in the Fix

#### Decision A: `action` as a parameter, not concatenated at call site

```java
// ✅ BETTER — service knows about the concept of "action"
isAllowed(clientIp, "login", 10);

// ❌ WORSE — caller builds the key
isAllowed(clientIp + ":login", 10);
```

**Why:** The service owns its own key-building logic. Callers shouldn't need to know Redis key structure. And future changes (adding tenant id, user id) stay inside the service.

#### Decision B: Logical action name, not raw URI

```java
// ✅ BETTER
rate_limit:login:203.0.113.5

// ❌ WORSE — raw URI in key
rate_limit:/api/v1/auth/login:203.0.113.5
```

**Why:**
1. **Stable over time** — if we rename `/auth/login` → `/auth/sign-in`, logical action `login` stays the same, counter history survives.
2. **Debug-friendly** — `KEYS rate_limit:*` shows semantic names in Redis CLI.
3. **Tamper-proof** — raw URIs are an attack surface (see next decision).

#### Decision C: Trailing slash normalization

Without this, the following paths get rate-limited **differently**:
- `/api/v1/auth/login` (matched → rate limited)
- `/api/v1/auth/login/` (unmatched → **bypasses rate limit entirely!**)
- `//api/v1/auth/login` (unmatched → bypasses)
- `/api/v1/auth/Login` (case sensitivity → bypasses)

**Fix:** Normalize before comparison. Strips trailing slashes, and the `switch` handles exact matches.

**Note:** Our Spring Security `requestMatchers` uses trailing-slash tolerant patterns, but the servlet `getRequestURI()` doesn't. So the fix must normalize both sides consistently.

#### Decision D: `switch` expression (Java 17+)

```java
// OLD — if-else chain
if (path.equals("/api/v1/auth/login")) { ... }
else if (path.equals("/api/v1/auth/register")) { ... }
else if (path.equals("/api/v1/auth/refresh")) { ... }

// NEW — switch expression
return switch (normalized) {
    case "/api/v1/auth/login"    -> "login";
    case "/api/v1/auth/register" -> "register";
    case "/api/v1/auth/refresh"  -> "refresh";
    default -> null;
};
```

**Why:** More readable, exhaustiveness-checked, easier to extend.

### 2.6 Verification

```bash
# 1. Clean state
docker exec medcore-redis redis-cli FLUSHDB

# 2. Hit login 10 times
# Output: 401 401 401 401 401 401 401 401 401 401

# 3. Hit login 11th time → 429
# 4. Hit register 1st time → should succeed (rate limit not hit)
```

**Check Redis keys:**
```
127.0.0.1:6379> KEYS rate_limit:*
1) "rate_limit:login:0:0:0:0:0:0:0:1"
2) "rate_limit:register:0:0:0:0:0:0:0:1"
```

**Expected:** Two separate keys, separate counters. ✅

### 2.7 Key Lessons

- **Rate limit key = `(identity, resource)`** — always two dimensions.
- **Never** key on identity alone unless you have exactly one protected endpoint.
- **Normalize inputs** (paths, IPs, headers) before using them in keys.
- **Logical action names** > raw URIs for stability.

---

## 3. Problem 2: Non-Atomic INCR + EXPIRE

### 3.1 The Original Code

```java
// RateLimitService.java (BEFORE FIX)
Long count = redisTemplate.opsForValue().increment(key);   // Command 1
if (count != null && count == 1) {
    redisTemplate.expire(key, WINDOW);                     // Command 2
}
```

### 3.2 The Bug — Two Separate Network Round Trips

**Root cause:** `INCR` and `EXPIRE` are **two separate Redis commands** with **two separate network round-trips**. Between them, anything can happen:

```
Spring Boot                          Network                    Redis Server
    │                                   │                          │
    │──── INCR key ────────────────────►│────────────────────────►│  counter = 1
    │                                   │                          │  TTL = -1 (no expiry)
    │  (crash! k8s pod killed,         │                          │
    │   deploy, OOM, network blip)     │                          │
    │                                   │                          │
    │  (EXPIRE never sent)             │                          │
    │                                   │                          │
    │                                   │                          │  ❌ ORPHAN KEY
    │                                   │                          │  TTL = -1 forever
```

**Result:** A Redis key that **never expires**. All subsequent requests from that IP keep incrementing it, eventually exceeding `maxRequests` and **permanently blocking the IP** — until someone manually runs `DEL`.

### 3.3 Real-World Consequences

#### A) Permanent IP Block
Once the orphan key is created, the counter grows monotonically. If a user hits 10 requests (limit), they stay blocked forever. Only a manual `DEL` in Redis unblocks them.

#### B) Silent & Delayed
- **Silent:** no error, no log, no alert. The `INCR` succeeded. The request succeeded. The next 10 requests succeed too. Only the 11th shows the bug.
- **Delayed:** by the time users complain, the bug has been active for hours. Redis has hundreds of orphan keys. **Which ones are legit?** You can't tell.

#### C) Widespread During Deploys
Kubernetes rolling deploys, pod evictions, OOM kills, and Redis failovers all increase the crash window. Rate of orphan keys spikes during deploys — the worst time.

#### D) Cache Growth / Memory Bloat
Orphan keys **never** expire. In a high-traffic system, orphan keys accumulate. Redis memory fills up, evictions start kicking out legitimate keys (LRU). Cascading failures.

#### E) DoS via Crash Prediction
A sophisticated attacker who can trigger Redis failover (e.g., via `CLIENT KILL`) can deliberately cause orphan keys — **permanently blocking large IP ranges** from your service.

### 3.4 Why Does This Happen? — Redis Atomicity Model

Redis is **single-threaded** for command execution. Each command is atomic. **But** — a sequence of commands is NOT atomic unless explicitly grouped:

| Approach | Atomic? | Round trips |
|----------|---------|-------------|
| `INCR` then `EXPIRE` (original) | ❌ No | 2 |
| `MULTI` / `EXEC` | ✅ Yes | 3 (MULTI, commands, EXEC) |
| **Lua script** (our choice) | ✅ Yes | 1 |
| `SET NX EX` + `INCR` | ⚠️ Partial | 2 |

**Lua script** is the best choice because:
- **Atomic** — runs in Redis's single-threaded loop
- **1 round-trip** — fast
- **Read-modify-write** logic supported (unlike `SET NX`)

### 3.5 The Fix — Lua Script

```java
// RateLimitService.java (AFTER FIX)
private static final RedisScript<Long> RATE_LIMIT_SCRIPT =
        new DefaultRedisScript<>(
                """
                local current = redis.call('INCR', KEYS[1])
                if current == 1 then
                    redis.call('EXPIRE', KEYS[1], ARGV[1])
                end
                return current
                """,
                Long.class
        );

public boolean isAllowed(String clientKey, String action, int maxRequests) {
    String key = "rate_limit:" + action + ":" + clientKey;

    Long count = redisTemplate.execute(
            RATE_LIMIT_SCRIPT,
            List.of(key),                           // KEYS
            String.valueOf(WINDOW.getSeconds())     // ARGV
    );

    return count != null && count <= maxRequests;
}
```

### 3.6 How the Lua Script Works — Line by Line

```lua
local current = redis.call('INCR', KEYS[1])
```
- `redis.call(...)` — invokes a Redis command **from within the Lua interpreter**
- `INCR KEYS[1]` — increments the counter key
- `local current =` — stores the returned count in a Lua local variable

```lua
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
```
- **First request** (`current == 1`) → set TTL to 60 seconds
- **Subsequent requests** (`current > 1`) → **do not** reset TTL
- This is **Fixed Window** semantics: TTL is set once, window is 60 seconds from first request

```lua
return current
```
- Returns the counter value to Java

**Critically:** All three steps run **atomically inside Redis**. From the outside, it looks like one indivisible operation. No crash window.

### 3.7 What is Lua and Why Use It in Redis?

#### Lua — The Language

**Lua** is a lightweight, embeddable scripting language. It's:
- **Fast** — the interpreter is ~150KB
- **Simple** — no classes, no modules, just functions and tables
- **Sandboxed** — Redis runs it in a restricted environment (no file I/O, no network)

Redis supports Lua **natively** since Redis 2.6 (2012). It's the **standard way** to make multi-command atomic operations.

#### Redis + Lua = Atomicity

Redis executes Lua scripts in its **single-threaded command loop**. While a Lua script is running:
- No other client command can interleave
- No crash can occur mid-script (either all runs, or none)
- The script sees a **consistent snapshot** of the data

This gives us **ACID-like atomicity** for our counter operation, at low cost.

#### `KEYS` and `ARGV`

Inside Lua scripts:
- `KEYS[1]`, `KEYS[2]`, ... — the Redis **key names** passed as arguments
- `ARGV[1]`, `ARGV[2]`, ... — other **parameters** (like our TTL value)

**Why the split?**
- **Redis Cluster** needs to know which keys a script touches **before** running it, to route to the right node. So keys must be passed separately as `KEYS[]`.
- This is why `rate_limit:login:...` uses **one key only** — it's cluster-safe.

**In Java:**
```java
redisTemplate.execute(
    RATE_LIMIT_SCRIPT,
    List.of(key),                        // → KEYS[1]
    String.valueOf(WINDOW.getSeconds())  // → ARGV[1]
);
```

### 3.8 EVAL vs EVALSHA — How Spring Optimizes Script Execution

#### The Two Commands

| Command | What it does | Bandwidth |
|---------|--------------|-----------|
| `EVAL` | Send full script text + args → Redis parses & runs | High (script text) |
| `EVALSHA` | Send SHA1 hash of script + args → Redis looks up cached script & runs | Low (just hash) |

#### SCRIPT LOAD

Before `EVALSHA` can be used, the script must be cached in Redis:
```bash
SCRIPT LOAD "local current = ..." 
# → "0531d39439bba052cb463d090a7c9c12cbca5de7"   (SHA1 hash)
```

#### Spring's `DefaultRedisScript` Behavior

When you call `redisTemplate.execute(script, ...)`:

```
1. Compute SHA1 of script text (or use cached)
2. Try EVALSHA <sha> <keys> <args>
3. If Redis returns NOSCRIPT error (script not cached):
   → Retry with EVAL (full script text)
   → Redis caches it under SHA
4. Return result
```

**Result:** First call uses `EVAL` (full script), subsequent calls use `EVALSHA` (just hash). **Massive bandwidth savings** on a per-request path.

#### Evidence from Our Verification

`MONITOR` output showed:

```
Line 1: EVALSHA "0531..." → NOSCRIPT (cache miss)
Line 2: EVAL "local current..." → ✅ ran successfully, cached
Line 3: [0 lua] INCR ...
Line 4: [0 lua] EXPIRE ...
Line 5: EVALSHA "0531..." → ✅ cache hit, no need to re-send script
Line 6: [0 lua] INCR ... (EXPIRE skipped because counter > 1)
```

This is **exactly** the expected Spring behavior. Confirms the fix works.

### 3.9 The `[0 lua]` Prefix — How to Read MONITOR Output

When Redis runs a Lua script, **commands executed inside it** appear in `MONITOR` with a special prefix:

```
[0 172.18.0.1:54692] "EVALSHA" "0531..." "1" "rate_limit:login:..." "60"
    │
    └── Client prefix — the client (Spring app) sent this command

[0 lua] "INCR" "rate_limit:login:..."
    │
    └── Lua prefix — this command ran INSIDE the Lua script
```

**Without Lua (old code) — 2 client commands:**
```
[0 172.18.0.1:54692] "INCR" "rate_limit:login:..."
[0 172.18.0.1:54692] "EXPIRE" "rate_limit:login:..." "60"
      ↑ BOTH are client commands = 2 round trips = crash window exists
```

**With Lua (new code) — 1 client command, N inner:**
```
[0 172.18.0.1:54692] "EVALSHA" "0531..." "1" "rate_limit:login:..." "60"
[0 lua] "INCR" "rate_limit:login:..."
[0 lua] "EXPIRE" "rate_limit:login:..." "60"
      ↑ Inner commands = atomic = no crash window
```

**This is the "proof" that atomicity is achieved.** If you only see one client command and multiple `[lua]` commands → atomicity confirmed.

### 3.10 Verification

```bash
# 1. Fire a login request
# 2. IMMEDIATELY (within 60s) check TTL
docker exec medcore-redis redis-cli TTL rate_limit:login:0:0:0:0:0:0:0:1
# Expected: 59 (positive number)

# 3. After 60s
docker exec medcore-redis redis-cli TTL rate_limit:login:0:0:0:0:0:0:0:1
# Expected: -2 (key expired/deleted)
```

**Crash test (conceptual):**
```
1. FLUSHDB
2. Send 1 request → counter = 1, TTL = 60
3. Kill the app: docker stop medcore-app
4. Check TTL: still positive (e.g., 58)
   → Key has TTL, will expire naturally
   → ❌ Old code: TTL would be -1 (orphan)
```

**TTL values — what they mean:**

| TTL value | Meaning |
|-----------|---------|
| Positive (e.g., 59) | Key exists, expires in 59s ✅ |
| `-1` | Key exists, **no expiry set** — ❌ ORPHAN KEY BUG |
| `-2` | Key does **not exist** (expired or never set) ✅ if window passed |

### 3.11 Design Decisions in the Fix

#### Decision A: Lua script, not MULTI/EXEC

**MULTI/EXEC alternative:**
```java
redisTemplate.execute(new SessionCallback<>() {
    public Object execute(RedisOperations ops) {
        ops.multi();
        ops.opsForValue().increment(key);
        ops.expire(key, WINDOW);
        return ops.exec();
    }
});
```

**Why Lua is better:**
- MULTI/EXEC still uses **multiple round trips** (MULTI, queued commands, EXEC = 3)
- Lua is **1 round trip** (EVALSHA)
- Lua supports **read-modify-write logic** (the `if current == 1` check)
- MULTI/EXEC can't conditionally execute based on a prior command's result

#### Decision B: `DefaultRedisScript<Long>` (typed)

```java
new DefaultRedisScript<>(script, Long.class)
```

**Why:**
- Type-safe return (`Long`, not `Object`)
- Spring automatically handles SHA1 caching
- Automatic `EVALSHA → EVAL` fallback

#### Decision C: `if current == 1 then EXPIRE`

**This is Fixed Window semantics.** The TTL is set **only on the first request** of the window. Subsequent requests increment the counter but do NOT reset the TTL.

```
T+0s:  INCR → 1  → EXPIRE 60 → window starts
T+5s:  INCR → 2  (no EXPIRE reset)
T+30s: INCR → 3  (no EXPIRE reset)
T+60s: key expires → window resets
T+61s: INCR → 1  → new window
```

**Alternative (sliding window) — NOT what we do:**
```lua
INCR key
EXPIRE key 60   -- reset TTL every request → sliding window
```
Sliding window is smoother but harder to reason about. Fixed window is standard for auth endpoints.

#### Decision D: `ARGV[1]` for TTL, not hardcoded

```lua
redis.call('EXPIRE', KEYS[1], ARGV[1])  -- TTL comes from Java
```

**Why:**
- **Testable:** test can pass `1` second instead of `60`
- **Configurable:** different endpoints could use different windows
- **Reusable:** script can be shared across services

#### Decision E: No try-catch around `redisTemplate.execute`

Current behavior: if Redis is down, exception propagates → request fails (500).

**This is a known tradeoff** — see Future Improvements section.

---

## 4. Key Terms Explained (Glossary)

### Redis Commands

| Command | Purpose | Example |
|---------|---------|---------|
| **`INCR key`** | Increment integer value by 1. Creates key with value 1 if missing. Returns new value. | `INCR rate_limit:login:1.2.3.4` → `1` |
| **`EXPIRE key seconds`** | Set TTL (time-to-live). Key auto-deletes after `seconds`. | `EXPIRE rate_limit:login:1.2.3.4 60` → `1` (success) |
| **`TTL key`** | Get remaining TTL in seconds. | `TTL rate_limit:login:1.2.3.4` → `59` |
| **`DEL key`** | Delete a key immediately. | `DEL rate_limit:login:1.2.3.4` → `1` |
| **`KEYS pattern`** | Find keys matching pattern. ⚠️ **Blocks Redis — DO NOT use in production!** | `KEYS rate_limit:*` |
| **`SCAN cursor MATCH pattern`** | Non-blocking key iterator. ✅ Safe for production. | `SCAN 0 MATCH rate_limit:* COUNT 100` |
| **`FLUSHDB`** | Delete all keys in current DB. ⚠️ **Dangerous — dev only.** | `FLUSHDB` |

### Redis Scripting

| Term | Meaning |
|------|---------|
| **Lua** | Lightweight scripting language embedded in Redis |
| **`EVAL`** | Execute Lua script (sends full script text) |
| **`EVALSHA`** | Execute cached Lua script (sends only SHA1 hash — faster) |
| **`SCRIPT LOAD`** | Pre-cache a script in Redis memory |
| **`SHA1`** | Hash used by Redis to identify cached scripts |
| **`KEYS[]`** | Array of key names passed to Lua script |
| **`ARGV[]`** | Array of non-key arguments passed to Lua script |
| **`redis.call(...)`** | Invoke a Redis command from within Lua |
| **`NOSCRIPT`** | Redis error — script not in cache (triggers EVAL fallback) |

### Rate Limiting Concepts

| Term | Meaning |
|------|---------|
| **Fixed Window** | Time divided into fixed intervals (e.g., 60s). Counter per interval. Simple, cheap. |
| **Sliding Window** | Window moves with each request. Smoother but more state. |
| **Token Bucket** | Bucket fills at constant rate. Each request consumes a token. Allows bursts. |
| **Leaky Bucket** | Requests queue and drip out at constant rate. Smooths traffic. |
| **Boundary Burst** | Fixed window flaw — burst at end + burst at start of next window = 2x allowed. |
| **Rate Limit Key** | Redis key structure: `{prefix}:{action}:{identity}` |
| **Identity** | Who is being rate-limited: IP, user ID, API key |
| **Action** | What resource is being protected: login, register, refresh |

### System Concepts

| Term | Meaning |
|------|---------|
| **Atomicity** | Operation completes fully or not at all — no partial state |
| **Orphan Key** | Redis key with `TTL = -1` (no expiry) — lives forever until manually deleted |
| **Round Trip** | One request-response cycle between client and server |
| **Race Condition** | Bug that occurs when timing between operations varies |
| **Fail-open** | If rate limiter fails, allow the request (prioritize availability) |
| **Fail-closed** | If rate limiter fails, block the request (prioritize safety) |

### Jargon

| Term | Meaning |
|------|---------|
| **Counter pollution** | Multiple resources sharing one counter — one's traffic affects another |
| **Boundary burst** | Exploit fixed window boundaries to get 2x the limit |
| **Cache stampede** | Many requests miss cache simultaneously and hit DB |
| **Silent failure** | Bug that produces no error/log — only wrong behavior |

---

## 5. Reference: Redis Commands Used

### Our Two Fixes — Command Comparison

| | Old (buggy) | New (fixed) |
|--|-------------|-------------|
| **Commands per request** | `INCR`, `EXPIRE` | `EVALSHA` (with `INCR`+`EXPIRE` inside) |
| **Round trips to Redis** | 2 | 1 |
| **Atomic?** | ❌ No | ✅ Yes |
| **Crash-safe?** | ❌ No | ✅ Yes |
| **Key design** | `rate_limit:{ip}` | `rate_limit:{action}:{ip}` |
| **Cross-endpoint isolated?** | ❌ No | ✅ Yes |

### Redis TTL Values Cheat Sheet

| `TTL` output | Meaning | Good/Bad |
|--------------|---------|----------|
| Positive number | Key alive, expires in N seconds | ✅ Normal |
| `-1` | Key has no expiry — will live forever | ❌ Orphan key bug |
| `-2` | Key does not exist (expired or never created) | ✅ Fine if window passed |

### Verification Commands

```bash
# Inside Redis CLI
FLUSHDB                                          # Clear all keys (dev only)
MONITOR                                          # Live command stream (Ctrl+C to stop)
KEYS rate_limit:*                                # ⚠️ Blocking — dev only
SCAN 0 MATCH rate_limit:* COUNT 100              # ✅ Production-safe
TTL rate_limit:login:1.2.3.4                     # Check TTL
GET rate_limit:login:1.2.3.4                     # Check counter
TYPE rate_limit:login:1.2.3.4                    # Should be "string"
```

---

## 6. Rate Limiting Algorithms Comparison

| Algorithm | Pros | Cons | When to Use |
|-----------|------|------|-------------|
| **Fixed Window** (our choice) | Simple, O(1) memory, cheap | Boundary burst | Simple auth endpoints |
| **Sliding Window** (sorted sets) | Smooth, no boundary burst | O(N) memory per client | APIs with strict fairness |
| **Sliding Window Counter** | Approximate sliding with O(1) | Slight inaccuracy | High-throughput APIs |
| **Token Bucket** | Allows controlled bursts, smooth rate | More complex, more state | Public APIs |
| **Leaky Bucket** | Constant outflow rate | No burst allowance | Streaming, queue servers |

**Why we chose Fixed Window:**
- **Simplicity** — one key, one counter, one Lua script
- **Low memory** — O(1) per client
- **Good enough** for login/register — these are naturally bursty
- **Boundary burst** is a theoretical concern for auth endpoints (an attacker 2x-ing 10 attempts = 20 attempts is still manageable)

**If we needed smooth limiting** (e.g., a public API), we'd switch to **Sliding Window Counter** — near-identical memory, removes boundary burst.

---

## 7. Common Pitfalls & Future Improvements

### ⚠️ Pitfalls We Avoided

1. **Key without action** — Bug #1 ✅ Fixed
2. **Non-atomic INCR+EXPIRE** — Bug #2 ✅ Fixed
3. **`KEYS *` in production** — Not used in production path (only dev verification)
4. **Hardcoded limits in `if-else`** — Partially addressed (switch expression), but limits are still in code

### 🔧 Known Limitations (Not Yet Fixed)

#### A) Proxy IP Problem
`getRemoteAddr()` returns the proxy's IP behind nginx/LB, not the real client. **Fix needed:** `server.forward-headers-strategy=framework` + `X-Forwarded-For` handling. (This is Bug #3, separate PR.)

#### B) Fail-Open vs Fail-Closed
If Redis is down, `redisTemplate.execute` throws → 500 → request fails. **Ideal:** catch exception, log, **fail-open** (allow request) — availability > safety for rate limiting.

```java
// Suggested future fix
try {
    Long count = redisTemplate.execute(...);
    return count != null && count <= maxRequests;
} catch (RedisException e) {
    log.warn("Rate limiter unavailable, failing open: {}", e.getMessage());
    return true;  // fail-open
}
```

#### C) Hardcoded Limits
`maxRequestsFor(action)` still has `10/5/20` in code. **Future:** move to `@ConfigurationProperties` or `application.yml`:

```yaml
rate-limit:
  endpoints:
    login: { max: 10, window: 60s }
    register: { max: 5, window: 60s }
    refresh: { max: 20, window: 60s }
```

#### D) `Retry-After` Header Missing
429 response should include `Retry-After: <seconds>`. **Why:** HTTP spec compliance; clients can auto-retry.

```java
// Suggested
response.setHeader("Retry-After", String.valueOf(remainingTtl));
```

#### E) 429 Body Uses Raw JSON String
```java
response.getWriter().write("{\"success\":false,\"message\":\"...\"}");
```
**Better:** use `ErrorResponse` + `ObjectMapper` (consistent with `SecurityConfig`).

#### F) IPv6 vs IPv4 Mixed Counters
`0:0:0:0:0:0:0:1` and `127.0.0.1` are the **same client** but different keys. **Fix:** normalize IPs (in a real deployment, `X-Forwarded-For` handles this).

#### G) Redis Cluster Key Distribution
Single-key Lua script works in a cluster, but if we extend to multi-key (e.g., `user:42 + ip:1.2.3.4`), all keys must be in the **same hash slot**. Use `{user:42}` hash tags.

-----
**End of Document**
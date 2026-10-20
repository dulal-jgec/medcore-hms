# Redis Caching — Learning Notes

## 1. Objective

Understand how Redis caching works in MedCore HMS and review the existing implementation before making production-oriented improvements.

## 2. Existing Implementation

MedCore currently uses:

- **Spring Cache Abstraction:** `@Cacheable` and `@CacheEvict`
- **RedisCacheManager:** Manages Spring Cache entries in Redis.
- **TenantCacheKeyGenerator:** Includes the hospital ID and method parameters in generated cache keys.
- **RedisTemplate:** Supports direct Redis operations.
- **Cache TTL:** The current default cache configuration sets an expiration time of 30 minutes.
- **Serialization:** Spring Cache values use JSON serialization through `GenericJackson2JsonRedisSerializer`.

## 3. Initial Review Findings

The existing implementation needs further verification in these areas:

1. Whether cache keys consistently isolate data between hospitals.
2. Whether cache eviction patterns match the actual Redis keys.
3. Whether direct Redis operations use compatible key serializers.
4. Whether broad cache eviction can be reduced without serving stale data.
5. How the application behaves when Redis is unavailable.

These are review items, not confirmed production bugs.

## 4. Learning Plan

- Understand cache hit, cache miss and cache-aside.
- Trace a department request from the service layer to PostgreSQL and Redis.
- Verify cache key generation and tenant isolation.
- Review TTL, serialization and invalidation.
- Test cache behaviour and measure performance improvements.

## 5. Current Status

**Status:** Initial review in progress.

No production caching behaviour was changed as part of this documentation task.

**Next step:** Trace one department-list request and verify its actual Redis cache key before changing the implementation.

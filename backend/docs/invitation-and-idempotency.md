# Reliable Invitation & Idempotent Resend System

## Overview

MedCore uses an asynchronous email invitation system for creating and inviting users such as Hospital Administrators.

Instead of sending an email directly inside the user creation request, MedCore uses an **Email Outbox Pattern** combined with:

* Retry mechanism
* Exponential backoff
* Jitter
* Invitation attempt tracking
* Invitation expiration
* Idempotency
* Manual resend
* Stale processing recovery

The goal is to make the invitation workflow reliable even when the external email service temporarily fails, the API request is repeated, or the email worker crashes.

---

# 1. Why Was This System Needed?

Initially, a simple implementation could look like this:

1. Create Hospital Admin.
2. Create User.
3. Send Email.
4. Return Response.

This looks simple, but it creates several production problems.

### Problem 1: Email service can fail

SMTP or an external email provider can temporarily fail because of:

* Network problems
* SMTP server downtime
* Connection timeout
* Authentication problems
* Provider rate limits
* Temporary infrastructure failures

If email sending is directly connected to user creation, the entire operation becomes fragile.

---

### Problem 2: Database transaction and email delivery are different systems

Creating a user happens inside the application database.

Sending an email happens through an external system.

These two operations cannot be treated as one atomic database transaction.

For example:

* Database Transaction completes.
* User Created.
* Email Sending Failed.

The user should not necessarily be deleted just because email delivery failed.

The user exists, but the invitation email needs to be retried.

---

### Problem 3: Retrying immediately is dangerous

Suppose the email server is temporarily unavailable.

If we retry continuously:

* Fail
* Retry
* Fail
* Retry
* Fail
* Retry

we can create unnecessary load on the email service.

Therefore, retries should be delayed.

---

### Problem 4: Multiple resend requests can create duplicate invitations

Suppose the frontend sends:

```http
POST /api/v1/super-admin/admins/15/resend-invitation
```

The user clicks the button twice.

Or the browser retries the request.

Without idempotency, the backend could create:

* Invitation Attempt 2
* Invitation Attempt 3

for the same user even though the user intended only one operation.

This is where **Idempotency** becomes important.

---

# 2. High-Level Flow

The invitation workflow follows this sequence:

1. A Hospital Admin is created.
2. The user is stored with `PENDING_VERIFICATION`.
3. An `email_outbox` row is created with `PENDING`.
4. The Email Outbox Processor claims the row.
5. If sending succeeds, the outbox row becomes `SENT` and the user can become `ACTIVE`.
6. If sending fails, the outbox row is retried until `EXHAUSTED`.
7. A manual resend can create the next invitation attempt.
8. After the maximum invitation attempts, the user becomes `INVITATION_EXPIRED`.

---

# 3. User Invitation Lifecycle

A newly created Hospital Admin starts with:

```text
PENDING_VERIFICATION
```

The user is not immediately considered active because the invitation email has not been successfully delivered yet.

The lifecycle is:

* `PENDING_VERIFICATION` → `ACTIVE` when the email is successfully sent.
* `PENDING_VERIFICATION` → `EXHAUSTED` after 5 delivery failures.
* `EXHAUSTED` → `INVITATION_EXPIRED` when the third invitation attempt also exhausts its retries.

This prevents the system from continuously retrying the same invitation forever.

---

# 4. Email Outbox Pattern

## What is the Outbox Pattern?

The Outbox Pattern stores an event or operation that needs to happen in a database table before an external system processes it.

For MedCore, the table is:

```text
email_outbox
```

Instead of doing:

```java
emailService.send(...);
```

directly inside the user creation flow, we create an outbox record.

Example:

```text
User
--------------------------------
id: 101
status: PENDING_VERIFICATION
email: admin@example.com
```

and:

```text
EmailOutbox
--------------------------------
user_id: 101
recipient: admin@example.com
status: PENDING
type: HOSPITAL_ADMIN_CREDENTIALS
invitation_attempt: 1
```

The transaction is responsible for creating the user and the outbox record.

The email processor is responsible for actually sending the email.

---

# 5. Why Use Email Outbox?

The main advantage is separation of responsibilities.

Business Transaction:

* Create User
* Create Outbox Record

Email Processor:

* Read Outbox
* Send Email

This means a temporary email failure does not require rolling back the user creation.

The email can be retried later.

---

# 6. Email Outbox Status

MedCore uses the following statuses:

```java
public enum EmailOutboxStatus {

    PENDING,
    PROCESSING,
    SENT,
    EXHAUSTED
}
```

## PENDING

The email is waiting to be processed.

```text
PENDING
```

---

## PROCESSING

A worker has claimed the email and is currently processing it.

```text
PROCESSING
```

---

## SENT

The email was successfully sent.

```text
SENT
```

At this point, the related pending user can become:

```text
ACTIVE
```

---

## EXHAUSTED

The maximum retry count has been reached.

```text
EXHAUSTED
```

At this point, automatic retries stop.

The system requires a manual resend operation.

---

# 7. Email Outbox Processor

The processor periodically checks for pending emails.

Conceptually:

```java
@Scheduled(fixedDelay = 10000)
public void processPendingEmails() {

    List<EmailOutbox> emails =
            stateService.claimEmails();

    for (EmailOutbox email : emails) {
        processEmail(email);
    }
}
```

The processor runs periodically instead of requiring the API request to wait for email delivery.

---

# 8. Safe Email Claiming

Multiple application instances could potentially process emails at the same time.

To avoid multiple workers processing the same record, PostgreSQL uses:

```sql
FOR UPDATE SKIP LOCKED
```

The query selects pending emails:

```sql
SELECT *
FROM email_outbox
WHERE status = 'PENDING'
  AND (
        next_attempt_at IS NULL
        OR next_attempt_at <= :now
      )
ORDER BY created_at ASC
LIMIT :limit
FOR UPDATE SKIP LOCKED
```

This allows multiple workers to safely process different records.

Conceptually:

* Worker A processes Email 1 and Email 2.
* Worker B processes Email 3 and Email 4.
* Both workers do not process the same email.

---

# 9. Retry Mechanism

If email delivery fails, the system does not immediately mark the invitation as permanently failed.

Instead, it increases the retry count.

```java
int retryCount = email.getRetryCount() + 1;
```

If the retry limit has not been reached:

* `PENDING`
* Retry later

If the maximum retry count is reached:

* `EXHAUSTED`

MedCore currently uses:

```text
Maximum retries = 5
```

---

# 10. Exponential Backoff

Retrying after the same fixed interval is not ideal.

Instead, MedCore uses exponential backoff.

The delay is calculated using:

```java
long baseDelayMinutes =
        1L << (retryCount - 1);
```

This produces:

* Retry 1 → ~1 minute
* Retry 2 → ~2 minutes
* Retry 3 → ~4 minutes
* Retry 4 → ~8 minutes
* Retry 5 → `EXHAUSTED`

This gives the external email service time to recover.

---

# 11. Jitter

If many emails fail at the same time, all of them should not retry at exactly the same moment.

For example, without jitter:

* 10:00:00 → 100 emails retry
* 10:02:00 → 100 emails retry
* 10:04:00 → 100 emails retry

This can create another traffic spike.

Therefore, a small random delay is added.

```java
long jitterSeconds =
        ThreadLocalRandom.current().nextLong(30);
```

The final retry time becomes:

```java
return LocalDateTime.now()
        .plusMinutes(baseDelayMinutes)
        .plusSeconds(jitterSeconds);
```

So instead of:

```text
Retry after exactly 1 minute
```

we get:

```text
Retry after 1 minute + random jitter
```

This helps spread retry traffic.

---

# 12. Invitation Attempts

Retry count and invitation attempt are two different concepts.

### Retry Count

Retry count belongs to one email delivery attempt.

Example:

```text
Invitation Attempt 1

Retry 1
Retry 2
Retry 3
Retry 4
Retry 5
        |
        v
    EXHAUSTED
```

### Invitation Attempt

Invitation attempt represents a new invitation generated by the user/admin.

Example:

```text
Invitation Attempt 1
        |
        v
    EXHAUSTED
        |
        v
Manual Resend
        |
        v
Invitation Attempt 2
```

Therefore:

```text
retryCount
```

and:

```text
invitationAttempt
```

have different meanings.

---

# 13. Maximum Invitation Attempts

MedCore currently allows:

```text
Maximum invitation attempts = 3
```

The lifecycle is:

* Attempt 1 retries up to 5 times.
* If exhausted, manual resend is required.
* Attempt 2 retries up to 5 times.
* If exhausted, manual resend is required.
* Attempt 3 retries up to 5 times.
* If exhausted, the user becomes `INVITATION_EXPIRED`.

This prevents unlimited invitation generation.

---

# 14. Why Invitation Expiration Is Needed

Without expiration, an invitation could theoretically be resent forever:

* Attempt 1
* Attempt 2
* Attempt 3
* Attempt 4
* Attempt 5

This is not desirable.

The system therefore limits invitation attempts.

After the third invitation is exhausted:

```java
if (email.getInvitationAttempt() >= 3
        && email.getUser() != null
        && email.getUser().getStatus()
        == UserStatus.PENDING_VERIFICATION) {

    email.getUser().setStatus(
            UserStatus.INVITATION_EXPIRED
    );
}
```

The user must then be handled through a separate business process instead of continuously generating invitations.

---

# 15. Manual Resend Flow

A resend is allowed only when the latest invitation is:

```text
EXHAUSTED
```

The backend checks:

```java
if (latestInvitation.getStatus()
        != EmailOutboxStatus.EXHAUSTED) {

    throw new BusinessException(
            "Current invitation is still being processed. Please wait."
    );
}
```

This prevents users from repeatedly clicking resend while the current invitation is still being processed.

---

# 16. Why We Check the Latest Invitation

Suppose a user has:

```text
Attempt 1 → EXHAUSTED
Attempt 2 → PENDING
```

If the backend simply checks whether any previous invitation is exhausted, it could incorrectly allow another resend.

Therefore, the backend retrieves the latest invitation:

```java
findTopByUser_IdAndTypeOrderByInvitationAttemptDescCreatedAtDesc(...)
```

Then it checks its status.

The rule is:

* Latest invitation = `EXHAUSTED` → resend allowed.
* Latest invitation = `PENDING` → resend rejected.
* Latest invitation = `PROCESSING` → resend rejected.
* Latest invitation = `SENT` → resend rejected.

---

# 17. Idempotency

## What is Idempotency?

Idempotency means:

> Repeating the same request should not create multiple effects.

For example:

```text
Request A
Idempotency-Key = abc-123
```

If the same request is sent again:

```text
Request A
Idempotency-Key = abc-123
```

the backend should recognize that it has already processed that request.

---

# 18. Why Idempotency Is Needed for Resend

Consider this situation:

1. Admin clicks "Resend Invitation".
2. Request sent.
3. Network timeout.
4. Frontend retries.

The frontend does not know whether the first request reached the server.

Without idempotency:

* Request 1 creates invitation.
* Request 2 creates another invitation.

This can cause duplicate invitation operations.

With idempotency:

* Request 1 with Key = `abc-123` is accepted.
* Request 2 with Key = `abc-123` is already processed.

Only one operation is accepted.

---

# 19. Idempotency Key

The frontend sends:

```http
Idempotency-Key: <unique-request-key>
```

Example:

```http
Idempotency-Key: 8e4d6f0a-7e0c-4b91-a2e5-123456789abc
```

The key identifies a particular operation.

It does NOT identify the user.

For example:

```text
User ID = 15
```

means:

```text
Which user?
```

While:

```text
Idempotency-Key = abc-123
```

means:

```text
Which request/operation?
```

---

# 20. Idempotency Database

MedCore stores idempotency keys in:

```text
idempotency_records
```

The table contains:

* `id`
* `created_at`
* `updated_at`
* `idempotency_key`
* `operation`

The key has a unique constraint:

```sql
CONSTRAINT uq_idempotency_records_key
UNIQUE (idempotency_key)
```

This is important because the database provides the final protection against concurrent duplicate requests.

---

# 21. Atomic Idempotency Check

The implementation uses PostgreSQL:

```sql
INSERT INTO idempotency_records
(created_at, updated_at, idempotency_key, operation)
VALUES (
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    :idempotencyKey,
    :operation
)
ON CONFLICT (idempotency_key) DO NOTHING
```

The repository returns:

* `1` → key inserted successfully.
* `0` → key already exists.

The service uses:

```java
@Transactional
public boolean create(
        String idempotencyKey,
        String operation) {

    return repository.createIfNotExists(
            idempotencyKey,
            operation
    ) == 1;
}
```

This is better than doing:

```java
if (!exists(key)) {
    create(key);
}
```

because that approach has a race condition.

---

# 22. Race Condition Without Atomic Idempotency

Imagine two requests arrive at exactly the same time.

### Request A

```text
Check key → does not exist
```

### Request B

```text
Check key → does not exist
```

Then:

* Request A creates record.
* Request B creates record.

Both requests pass the check.

This is a classic race condition.

With:

```sql
ON CONFLICT (idempotency_key) DO NOTHING
```

the database handles the concurrency safely.

Only one request can insert the unique key.

---

# 23. Complete Resend Flow

The complete flow is:

1. Frontend sends `POST /resend-invitation` with `Idempotency-Key`.
2. Backend validates Super Admin.
3. Backend tries to create an idempotency record.
4. If the key already exists, return already processed.
5. If the key is new, find Hospital Admin.
6. Validate User Status.
7. Find Latest Invitation.
8. Check if it is `EXHAUSTED`.
9. If NO, reject.
10. If YES, generate New Password.
11. Increment `invitationAttempt`.
12. Create Outbox.
13. Return Success.

---

# 24. Complete Email Processing Flow

After the invitation is queued:

```text
EmailOutbox
status = PENDING
```

The processor claims it:

```text
PENDING
   |
   v
PROCESSING
```

Then:

### If email succeeds

```text
PROCESSING
     |
     v
   SENT
     |
     v
User → ACTIVE
```

### If email fails

```text
PROCESSING
     |
     v
retryCount++
     |
     v
retry later
     |
     v
PENDING
```

After five failures:

```text
PROCESSING
     |
     v
EXHAUSTED
```

If it was invitation attempt 3:

```text
EXHAUSTED
     |
     v
INVITATION_EXPIRED
```

---

# 25. Stale Processing Recovery

Another failure scenario is:

1. Worker claims email.
2. Email becomes `PROCESSING`.
3. Worker crashes.

Now the email could remain stuck in:

```text
PROCESSING
```

forever.

To handle this, MedCore periodically checks for stale processing records.

Conceptually:

* `PROCESSING`
* `processingStartedAt` is too old
* Reset to `PENDING`

This allows another worker to process the email.

---

# 26. Important Exactly-Once Limitation

The system provides strong protection against duplicate application-level processing, but external email delivery cannot be guaranteed to be exactly-once.

For example:

1. Worker sends email.
2. SMTP server accepts email.
3. Application crashes before `markAsSent()`.

The database may still contain:

```text
PROCESSING
```

The recovery process may later retry the email.

This can potentially result in:

```text
Email sent twice
```

This is a fundamental limitation when interacting with external systems.

Therefore, the architecture aims for:

* Reliable processing
* Safe retries
* Idempotent API requests
* Bounded invitation attempts

rather than claiming impossible exactly-once external email delivery.

---

# 27. Security Considerations

The invitation system also protects temporary credentials.

When creating an invitation:

```java
String temporaryPassword =
        generateTemporaryPassword();
```

The password is stored in the database only after encoding:

```java
passwordEncoder.encode(temporaryPassword)
```

The plaintext temporary password is used only to construct the invitation email.

On resend, a new temporary password is generated:

1. Old temporary password is invalidated.
2. New temporary password is stored encoded.
3. New temporary password is sent through new invitation.

This prevents repeatedly sending the same temporary credential.

---

# 28. Database Structure

The main tables involved are:

* `users`
* `email_outbox`
* `idempotency_records`

### users

Responsible for the actual user account.

Important status values:

* `PENDING_VERIFICATION`
* `ACTIVE`
* `INVITATION_EXPIRED`

### email_outbox

Responsible for email delivery state.

Important fields:

* `status`
* `type`
* `user_id`
* `retry_count`
* `invitation_attempt`
* `next_attempt_at`
* `processing_started_at`
* `last_error`

### idempotency_records

Responsible for preventing duplicate API operations.

Important fields:

* `idempotency_key`
* `operation`

---

# 29. Problems Solved by This Architecture

| Problem | Solution |
|---|---|
| Email service temporarily fails | Retry mechanism |
| Too many immediate retries | Exponential backoff |
| Retry traffic spikes | Jitter |
| User creation depends on email | Outbox pattern |
| Duplicate resend request | Idempotency |
| Concurrent duplicate requests | Database unique constraint |
| Worker crashes during processing | Stale recovery |
| Unlimited invitation attempts | Maximum 3 attempts |
| Invitation repeatedly fails | `EXHAUSTED` state |
| Third invitation permanently fails | `INVITATION_EXPIRED` |
| Resend while current email is processing | Latest invitation status check |
| Old invitation incorrectly triggers resend | Latest invitation lookup |
| Temporary password reused on resend | Generate new password |

---

# 30. Final Design

The final MedCore invitation design can be understood as:

1. Create Hospital Admin.
2. User becomes `PENDING`.
3. Email Outbox Attempt = 1.
4. Email Processor processes the outbox.
5. On success: `SENT`, then user becomes `ACTIVE`.
6. On failure: retry with backoff and jitter.
7. After 5 failures: `EXHAUSTED`.
8. Manual Resend starts.
9. Idempotency Check runs.
10. Attempt = 2 is created.
11. Email Outbox processes Attempt 2.
12. Same process repeats.
13. Attempt = 3 is created.
14. If exhausted, user becomes `INVITATION_EXPIRED`.

---

# 31. Key Engineering Concepts Learned

This implementation demonstrates several important backend engineering concepts:

1. **Outbox Pattern**  
   Separates business transactions from unreliable external operations.

2. **Retry Mechanism**  
   Allows temporary failures to recover automatically.

3. **Exponential Backoff**  
   Prevents aggressive repeated retries.

4. **Jitter**  
   Prevents synchronized retry spikes.

5. **Idempotency**  
   Prevents duplicate effects when the same request is repeated.

6. **Database-Level Concurrency Control**  
   Uses unique constraints and atomic SQL operations to handle concurrent requests safely.

7. **State Management**  
   Explicit states make the invitation lifecycle predictable.

8. **Failure Recovery**  
   Stale processing recovery handles worker crashes.

9. **Bounded Retries**  
   Prevents infinite retry loops.

10. **External Side-Effect Limitations**  
    Recognizes that exactly-once delivery cannot be guaranteed across independent systems such as databases and SMTP providers.

---

# 32. Why This Matters in a Real Production System

A simple implementation can make email sending appear to work during development.

Production systems are different.

Requests can be duplicated.

Networks can fail.

Workers can crash.

SMTP servers can become unavailable.

Users can click buttons multiple times.

Multiple application instances can process the same data.

External services can accept a request while the application crashes before recording the result.

The purpose of this architecture is therefore not just:

```text
"Send an email"
```

It is:

```text
Make the invitation workflow reliable,
recoverable, retryable,
concurrency-safe,
and resistant to duplicate requests.
```

This is why MedCore uses the combination of:

* Outbox
* Retry
* Exponential Backoff
* Jitter
* Idempotency
* State Management
* Stale Recovery
* Bounded Invitation Attempts

together.

---
 
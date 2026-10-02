# Reliable Email Delivery

## Problem

MedCore HMS sends invitation emails when a hospital administrator creates staff accounts.

A simple implementation would send the email directly inside the user-creation flow.

However, this creates a reliability problem:

- SMTP/email service can fail.
- Network failures can occur.
- The user creation transaction should not fail just because email delivery failed.
- Temporary email failures should be retried automatically.
- Failed deliveries should not retry forever.
- Administrators need a way to resend an invitation.
- Invitation attempts need to be controlled.

Because of these requirements, email delivery was separated from the main business transaction.

---

## Solution

MedCore HMS uses a **Transactional Email Outbox pattern**.

The application first creates the user and an email-outbox record in the same database transaction.

A background processor then reads pending email records and sends them asynchronously.

```text
User Creation
     |
     v
Create User
     |
     +----> Create Email Outbox Record
                    |
                    v
                 PENDING
                    |
                    v
           Background Processor
                    |
             +------+------+
             |             |
          Success        Failure
             |             |
             v             v
           SENT        Retry Later
                           |
                    +------+------+
                    |             |
                 Success       5 Failures
                    |             |
                   SENT       EXHAUSTED
                                  |
                           After 3 invitation
                              attempts
                                  |
                                  v
                        INVITATION_EXPIRED
```

---

## Failure Recovery

An email can remain in `PROCESSING` if the application crashes or the worker stops unexpectedly during delivery.

To handle this case, the system stores the processing start time.

If an email remains in `PROCESSING` beyond the recovery threshold, it is automatically moved back to `PENDING`.

This allows the email processor to retry emails that were interrupted by application or worker failures.

---

## Concurrency Handling

The email processor uses database-level row locking to prevent multiple workers from processing the same email simultaneously.

Pending emails are claimed using:

```sql
FOR UPDATE SKIP LOCKED
```

This prevents multiple workers from claiming the same email record.

The processor also handles emails in limited batches, allowing the system to process pending emails without loading the entire queue into memory.
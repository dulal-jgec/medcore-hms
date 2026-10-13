# Transaction Rollback Integration Test

## Objective
Verify that creating a Hospital Admin is atomic when email-outbox persistence fails.

## Implementation
- Execute the real `SuperAdminServiceImpl.createHospitalAdmin()` through the Spring bean.
- Use a dedicated PostgreSQL test database.
- Simulate an `EmailOutboxRepository.save()` failure.
- Verify that the Hospital Admin user does not exist after the service transaction fails.

## Problem Solved
Prevents a partially created Hospital Admin account when saving its invitation email fails.

## Expected Behaviour
If an unchecked exception occurs inside the transactional service method, the user insert must roll back.

## Verification
- Test passes when the service throws the expected exception.
- A fresh transaction confirms that the Hospital Admin user was not persisted.

## Limitation
This test verifies rollback when the outbox repository throws an exception. It does not verify successful email delivery or the complete outbox processing workflow.
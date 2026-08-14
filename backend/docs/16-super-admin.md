# Super Admin Module

The Super Admin module is the **platform-level administration layer** of MedCore HMS.

A Super Admin operates across the entire MedCore platform rather than belonging to a single hospital. The module is responsible for hospital onboarding, hospital lifecycle management, platform-level statistics, and administrative access control.

---

## 1. Responsibilities

The Super Admin module handles:

- Super Admin profile management
- Role-based authorization
- Super Admin status validation
- Hospital creation
- Hospital listing
- Hospital search
- Hospital details
- Hospital updates
- Hospital status management
- Hospital soft deletion
- Hospital restoration
- Platform-level dashboard
- Hospital statistics

The Super Admin acts as the **platform administrator**, while hospital-level users will operate inside their respective hospital tenant.

---

## 2. Access Control

Super Admin APIs are protected using Spring Security and JWT.

The controller uses:

```java
@PreAuthorize("hasRole('SUPER_ADMIN')")
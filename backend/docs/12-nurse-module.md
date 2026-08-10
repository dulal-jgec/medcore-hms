# Nurse Module

## 1. Overview

The Nurse module manages nurse profiles and professional information within the hospital.

The module connects:

User → Nurse → Hospital

The main responsibility of this module is to create and manage nurse profiles, maintain professional information, manage nurse status, enforce hospital-level data isolation, and support soft deletion.

---

## 2. Main Responsibilities

The module handles:

- Nurse profile management
- Hospital-level nurse management
- Nurse department management
- Ward management
- Nurse designation management
- Nurse qualification management
- Nurse license number management
- Nurse status management
- Nurse activation
- Nurse deactivation
- Soft deletion
- Hospital-level data isolation
- Preventing duplicate nurse profiles
- User-to-nurse relationship management

---

## 3. APIs

### Nurse APIs

- POST /api/v1/nurses
- GET /api/v1/nurses
- GET /api/v1/nurses/{nurseId}
- PUT /api/v1/nurses/{nurseId}
- DELETE /api/v1/nurses/{nurseId}
- PATCH /api/v1/nurses/{nurseId}/activate
- PATCH /api/v1/nurses/{nurseId}/deactivate

---

## 4. Features

### Nurse Management

- Create Nurse
- Get Nurse by ID
- Get All Nurses
- Update Nurse
- Activate Nurse
- Deactivate Nurse
- Soft Delete Nurse

### Nurse Profile

A nurse profile contains:

- Department
- Ward
- Designation
- Qualification
- License Number
- Nurse Status

### Hospital Isolation

Nurse data is isolated at the hospital level.

A user can only access nurse records belonging to their own hospital.

---

## 5. Business Rules

- One User can have only one active Nurse profile.
- A Nurse must be linked to an existing User.
- A Nurse must belong to a Hospital.
- The User associated with the Nurse must belong to the same Hospital.
- Duplicate active Nurse profiles for the same User are not allowed.
- Nurse status is managed using ACTIVE and INACTIVE , ON_LEAVE states.
- A Nurse can be deactivated without deleting the profile.
- Deactivated Nurses remain stored in the database.
- Soft delete is used instead of permanent deletion.
- Deleted Nurse records are excluded from normal queries.
- Hospital isolation must be enforced when accessing Nurse data.
- A Nurse from another hospital cannot be accessed or modified.
- Nurse-specific information is stored in the Nurse entity while common user information is maintained by the User entity.

---

## 6. Data Relationship

```text
User
  ↓
Nurse
  ↓
Hospital
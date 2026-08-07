# Patient Module

## Overview

The Patient module manages patient profiles within a hospital.

Each patient is linked to:

- User
- Hospital

The module stores patient-specific medical information while authentication and common user information remain in the User entity.

---

## APIs

### Patient APIs

- POST /api/v1/patients
- GET /api/v1/patients
- GET /api/v1/patients/{id}
- PUT /api/v1/patients/{id}
- PATCH /api/v1/patients/{id}/status
- GET /api/v1/patients/search
- DELETE /api/v1/patients/{id}
- PATCH /api/v1/patients/{id}/restore

---

## Features

### Patient Management

- Create Patient
- Get All Patients
- Get Patient By Id
- Update Patient
- Update Patient Status
- Search Patients
- Soft Delete
- Restore Patient

---

## Business Rules

- One User can have only one Patient profile.
- User must have the PATIENT role.
- User must belong to the selected Hospital.
- Blood Group is stored as Enum.
- Emergency contact is mandatory.
- Soft Delete is used instead of permanent delete.
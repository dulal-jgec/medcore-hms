# Doctor Module

## Overview

The Doctor module manages doctor profiles and their weekly schedules within the hospital.

Each doctor is linked to:

- User
- Hospital
- Department

A doctor can have multiple schedules for different days and time slots.

---

## APIs

### Doctor APIs

- POST /api/v1/doctors
- GET /api/v1/doctors
- GET /api/v1/doctors/{id}
- PUT /api/v1/doctors/{id}
- PATCH /api/v1/doctors/{id}/status
- DELETE /api/v1/doctors/{id}
- PATCH /api/v1/doctors/{id}/restore
- GET /api/v1/doctors/search

### Doctor Schedule APIs

- POST /api/v1/doctor-schedules
- GET /api/v1/doctor-schedules/doctor/{doctorId}

---

## Features

### Doctor Management

- Create Doctor
- Update Doctor
- Get Doctor
- Get All Doctors
- Search Doctors
- Update Doctor Status
- Soft Delete
- Restore Doctor

### Doctor Schedule

- Create Weekly Schedule
- View Doctor Schedule
- Time Validation
- Overlapping Schedule Validation
- Only ACTIVE doctors can have schedules

---

## Business Rules

- One User can have only one Doctor profile.
- A Doctor must belong to an existing Hospital.
- A Doctor must belong to an existing Department.
- Department must belong to the selected Hospital.
- User must belong to the selected Hospital.
- User must have the DOCTOR role.
- Only ACTIVE doctors can receive schedules.
- Schedule start time must be before end time.
- Overlapping schedules are not allowed.
- Soft delete is used instead of permanent deletion.
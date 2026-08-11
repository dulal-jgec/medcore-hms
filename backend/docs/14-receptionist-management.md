# Receptionist Management Module

## 1. Overview

The Receptionist Management module handles the front-desk operations of a hospital.

A receptionist is mainly responsible for:

- Registering patients
- Searching existing patients
- Managing patient check-in
- Viewing today's appointments
- Handling receptionist profile/status
- Supporting the hospital's daily front-desk workflow

The module is designed for a multi-tenant hospital SaaS system, so a receptionist can only access data belonging to their own hospital.

---

## 2. Main Responsibilities

### Receptionist Management

The system supports:

- Create receptionist profile
- Update receptionist information
- View receptionist
- Delete receptionist using soft delete
- Activate receptionist
- Deactivate receptionist

### Patient Operations

Receptionists can:

- Register new patients
- Search existing patients

Patient business logic is handled by the existing PatientService instead of duplicating it inside ReceptionistService.

### Appointment Operations

Receptionists can:

- Check in patients for appointments
- View today's appointments
- Access only appointments belonging to their hospital

Appointment business logic is handled by AppointmentService.

---

# 3. Business Rules

## Rule 1 — Receptionist Must Belong to a Hospital

A receptionist must always be associated with a hospital.

If the authenticated user has no hospital:

```text
Reject request
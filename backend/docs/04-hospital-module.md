
---

# 2. HOSPITAL_MODULE.md`

# Hospital Module

The Hospital module represents a **hospital tenant** within the MedCore HMS platform.

A hospital is a core tenant-level resource managed by the platform Super Admin. It acts as the foundation for future hospital-specific modules such as users, doctors, patients, appointments, departments, billing, and other HMS operations.

The module focuses on hospital information, lifecycle management, data integrity, search, pagination, soft deletion, and restoration.

---

## 1. Responsibilities

The Hospital module represents and manages the hospital domain within MedCore.

It is responsible for:

- Hospital entity and persistence
- Hospital information management
- Hospital contact and license information
- Hospital status management
- Hospital business validation
- Active hospital uniqueness
- Hospital search and pagination
- Soft deletion
- Hospital restoration
- Database-level data integrity

Hospital administration is performed by the **Super Admin module**.

The Hospital module provides the underlying business logic used by the Super Admin when managing hospital tenants.

## 2. Hospital as a Tenant

MedCore is designed as a multi-tenant HMS.

Conceptually:

POST /api/v1/super-admin/hospitals
        ↓
SuperAdminController
        ↓
SuperAdminService
        ↓
HospitalService.createHospital()
        ↓
Validation + Duplicate Checks
        ↓
HospitalRepository.save()
        ↓
PostgreSQL

```text
MedCore
   │
   ├── Hospital A
   │     ├── Users
   │     ├── Doctors
   │     ├── Patients
   │     └── Appointments
   │
   ├── Hospital B
   │     ├── Users
   │     ├── Doctors
   │     ├── Patients
   │     └── Appointments
   │
   └── Hospital C
         ├── Users
         ├── Doctors
         ├── Patients
         └── Appointments
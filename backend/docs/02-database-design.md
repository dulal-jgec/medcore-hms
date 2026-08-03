# Database Design

## Core Entities

- Hospital
- Address
- Role
- User
- Department
- Doctor
- Patient
- Appointment
- MedicalRecord
- Prescription
- Medicine
- LabOrder
- Invoice
- InvoiceItem
- Notification
- AuditLog

---

## Relationships

- One Hospital -> Many Users
- One Hospital -> Many Departments
- One Department -> Many Doctors
- One User -> One Doctor (Optional)
- One User -> One Patient (Optional)
- One Doctor -> Many Appointments
- One Patient -> Many Appointments
- One Appointment -> One Medical Record
The Medical Record module currently contains:

1. MedicalRecord Entity
2. MedicalRecordRepository
3. CreateMedicalRecordRequest
4. MedicalRecordResponse
5. MedicalRecordMapper
6. MedicalRecordService
7. MedicalRecordServiceImpl
8. MedicalRecordController
9. Soft-delete awareness using deletedAt
10. Relationship with Appointment
11. Relationship with Doctor
12. Relationship with Patient
13. Relationship with Hospital

Business rules implemented:

- Only a doctor can create a medical record.
- The doctor must own the appointment.
- Doctor and appointment must belong to the same hospital.
- Medical records can only be created for COMPLETED appointments.
- One appointment cannot have multiple medical records.
- Patient, doctor and hospital relationships are taken from server-side trusted data instead of blindly trusting request body IDs.
- Medical records are protected using authenticated-user information.
- Doctors can access records belonging to them.
- Patients can access records belonging to themselves.
- Users cannot access medical records belonging to another doctor/patient.
- Hospital isolation is checked.
- Unauthorized access is handled separately from normal business validation.
- AccessDeniedException is used for authorization failures and mapped to HTTP 403.
- ResourceNotFoundException is used when a medical record/resource does not exist.

Explain the important architecture:

JWT
→ SecurityContext/SecurityUtil
→ Current User
→ Doctor/Patient
→ Authorization
→ Medical Record

Explain the important database relationship:

Appointment 1 : 1 MedicalRecord

Explain why duplicate medical records are prevented both through:
1. Service-layer validation
2. Database unique constraint

Include these sections:

# Medical Record Module
## Overview
## Responsibilities
## Entity Relationships
## API Endpoints
## Request/Response Flow
## Business Rules
## Security & Authorization
## Repository Design
## Exception Handling
## Important Design Decisions
## Example Request
## Example Response
## Future Improvements

For API endpoints, only document endpoints that actually exist in the implementation. Do not invent endpoint paths. If exact controller mappings are unknown, use placeholders such as `<actual-endpoint>` rather than making up URLs.


 
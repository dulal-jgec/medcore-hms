# Prescription Management Module — MedCore

## Overview

The Prescription Management module is responsible for creating, managing, finalizing, sharing, and generating prescriptions within the MedCore healthcare management system.

The module is designed around a real-world prescription workflow where a doctor can create a prescription only after completing an appointment, add medicines from the medicine master or manually prescribe medicines that are not available in the master, modify the prescription while it is still in draft state, finalize it, explicitly share it with the patient, and allow the patient to securely view and download the prescription as a PDF.

The implementation focuses not only on CRUD operations but also on **business rules, authorization, ownership validation, hospital-level data isolation, state management, historical data preservation, soft deletion, DTO-based API design, and secure document generation**.

---

# Key Features

The Prescription module supports:

- Creating prescriptions from completed appointments
- Doctor ownership validation
- Hospital-level data isolation
- Draft and finalized prescription lifecycle
- Adding medicines from the medicine master
- Manually entering medicines not available in the medicine master
- Medicine strength customization
- Dosage information
- Quantity
- Frequency
- Duration
- Instructions
- Updating prescription medicines
- Soft deleting prescription medicines
- Finalizing prescriptions
- Sharing prescriptions with patients
- Patient-specific prescription access
- Prescription PDF generation
- Secure PDF download
- Role and ownership based authorization
- Historical medicine snapshot preservation

---

# Prescription Business Workflow

The complete business flow is:

```text
Appointment
    |
    | Must be COMPLETED
    v
Create Prescription
    |
    v
Prescription = DRAFT
    |
    +--------------------------+
    |                          |
    v                          v
Existing Medicine       Manual Medicine
    |                          |
    +------------+-------------+
                 |
                 v
       Add Prescription Items
                 |
                 v
       Update / Delete Items
                 |
                 v
       Finalize Prescription
                 |
                 v
       Prescription = FINALIZED
                 |
                 v
       Doctor Shares Prescription
                 |
                 v
       sharedWithPatient = true
                 |
                 v
       Patient Can View
                 |
                 v
       Patient Can Download PDF
# Appointment Module

## Overview

The Appointment module manages doctor-patient appointments within a hospital.

An appointment connects:

- Hospital
- Doctor
- Patient
- Doctor Schedule

The module contains business validations to ensure that appointments are created only when the doctor is available and the requested time slot is not already booked.

---

## Appointment Entity

Main fields:

- id
- hospital
- doctor
- patient
- appointmentDate
- startTime
- endTime
- status
- reason
- createdAt
- deletedAt

---

## Relationships

```text
Hospital
   |
   └── One Hospital → Many Appointments

Doctor
   |
   └── One Doctor → Many Appointments

Patient
   |
   └── One Patient → Many Appointments
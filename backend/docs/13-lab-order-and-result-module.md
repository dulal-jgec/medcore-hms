# Lab Order & Result Management Module

## 1. Module Overview

The Lab module manages the complete lifecycle of laboratory investigations in MedCore.

The module connects:

- Doctor
- Patient
- Lab Test Master
- Lab Order
- Lab Order Items
- Lab Results

The main purpose is to allow a doctor to order one or multiple laboratory tests for a patient and allow the laboratory to process those tests and record the results.

---

# 2. Business Problem

In a hospital, a doctor may need to prescribe multiple diagnostic tests for a patient.

For example:

- CBC
- Blood Sugar
- Lipid Profile
- Thyroid Test
- Liver Function Test

The system should support:

- Doctor ordering multiple tests
- Tracking the laboratory workflow
- Collecting samples
- Processing tests
- Recording individual test results
- Updating results when required
- Automatically completing the lab order when all tests have results
- Allowing authorized doctors and patients to view results
- Maintaining hospital-level tenant isolation

---

# 3. Main Responsibilities

The module handles:

- Lab test master management
- Creating laboratory orders
- Ordering multiple tests for a patient
- Associating lab orders with doctors
- Associating lab orders with patients
- Associating lab orders with appointments
- Hospital-level lab data isolation
- Lab sample collection workflow
- Lab processing workflow
- Lab order status management
- Recording individual laboratory results
- Updating laboratory results
- Preventing duplicate results
- Automatically completing lab orders
- Doctor access to laboratory results
- Patient access to laboratory results
- Soft deletion
- Business rule validation
- Status transition validation

---

# 4. Main Entities

## LabTest

Represents the master laboratory test catalog.

Examples:

- CBC
- Blood Sugar
- Lipid Profile
- Thyroid Test
- Liver Function Test

This is reusable master data.

---

## LabOrder

Represents a laboratory investigation order created for a patient.

Important relationships:

- Patient
- Doctor
- Hospital
- Appointment
- LabOrderItems

One LabOrder can contain multiple tests.

---

## LabOrderItem

Represents an individual test inside a LabOrder.

Example:

```text
LabOrder #101

- CBC
- Blood Sugar
- Lipid Profile
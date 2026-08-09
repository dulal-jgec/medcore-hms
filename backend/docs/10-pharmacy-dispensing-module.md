# Pharmacy & Prescription Dispensing Module

## 1. Overview

The Pharmacy & Prescription Dispensing module manages the process of dispensing medicines from a hospital pharmacy based on finalized prescriptions.

The module connects:

Doctor → Prescription → Patient → Dispensing Request → Pharmacist → Pharmacy Inventory

The main responsibility of this module is to ensure that medicines are dispensed only from valid prescriptions and that pharmacy stock is automatically reduced after successful dispensing.

---

# 2. Main Responsibilities

The module handles:

- Pharmacy management
- Pharmacy inventory management
- Prescription dispensing requests
- Patient authorization
- Pharmacist authorization
- Prescription validation
- Hospital-level data isolation
- Medicine stock validation
- Automatic stock deduction
- Batch-based stock consumption
- Dispensing status management
- Transaction-safe stock updates

---

# 3. Business Flow

```text
Doctor
   |
   | Create prescription
   v
Prescription
   |
   | Add medicines
   v
Prescription
   |
   | Finalize
   v
FINALIZED
   |
   | Share with patient
   v
Patient
   |
   | Create dispensing request
   v
PENDING
   |
   | Pharmacist dispenses
   v
Validate Stock
   |
   | Enough stock
   v
Decrease Pharmacy Stock
   |
   v
DISPENSED
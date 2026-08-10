\# Billing Module

\#\# 1. Overview

The Billing module manages hospital billing and payment processing for patients.

The module connects:

Patient → Hospital → Appointment → Bill → Bill Items → Payment

The main responsibility of this module is to create accurate bills, manage bill items, calculate billing totals, track payments, and maintain the payment status of each bill.

---

\#\# 2. Main Responsibilities

The module handles:

- Hospital billing
- Patient billing
- Appointment-based billing
- Multiple bill types
- Bill item management
- Automatic subtotal calculation
- Discount handling
- Tax handling
- Final total calculation
- Partial payments
- Full payments
- Payment method tracking
- Due amount calculation
- Billing status management
- Hospital-level data isolation
- Soft deletion of bill items
- Preventing modification of paid bills
- Preventing modification of cancelled bills
- Preventing overpayment

---

\#\# 3. Business Flow

```text
Patient
   |
   | Bill created
   v
PENDING
   |
   | Add Bill Items
   v
Calculate Subtotal
   |
   | Discount + Tax
   v
Calculate Final Total
   |
   | Payment
   v
+-----------------------------+
| Payment < Due Amount        |
|        ↓                    |
| PARTIALLY_PAID              |
|                             |
| Payment = Due Amount        |
|        ↓                    |
| PAID                        |
+-----------------------------+
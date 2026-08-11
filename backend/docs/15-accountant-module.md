# Accountant Module

The Accountant module is responsible for managing hospital-level financial operations, bill collections, outstanding payments, financial reports, and payment-method-wise collection data.

The module is designed with **multi-tenant hospital isolation**, meaning an accountant can only access financial data belonging to their own hospital.

---

# 1. Module Responsibility

The Accountant module handles:

- Accountant profile management
- Accountant activation and deactivation
- Hospital-scoped bill access
- Outstanding bill tracking
- Payment collection
- Financial summary
- Date-wise financial reporting
- Payment-method-wise collection reporting
- Accountant dashboard
- Role-based access control
- Hospital-level data isolation

---

# 2. Accountant Responsibilities

An Accountant can:

- View financial information of their hospital
- View hospital bills
- View outstanding bills
- Process bill payments
- Track paid and unpaid amounts
- View total billed amount
- View total collected amount
- View total outstanding amount
- View date-wise financial reports
- View payment-method-wise collections
- View financial dashboard statistics

An Accountant cannot:

- Access another hospital's financial data
- Access financial data without being associated with a hospital
- Process payments when inactive
- Access the financial system without the ACCOUNTANT role

---

# 3. Accountant Entity

The Accountant entity represents the financial staff member associated with a hospital.

Important relationships:

- Accountant → User
- Accountant → Hospital

The Accountant profile contains information such as:

- User
- Hospital
- Department
- Designation
- Qualification
- Status
- Other accountant-specific information

The Accountant status is managed using an enum.

---

# 4. Accountant Status

The module uses an enum to represent the accountant's working state.

Typical states:

- ACTIVE
- INACTIVE

Business rules:

- Only ACTIVE accountants can access financial operations.
- INACTIVE accountants cannot process payments.
- INACTIVE accountants cannot access financial dashboard information.

---

# 5. Multi-Tenant Hospital Isolation

MedCore is a multi-tenant SaaS hospital management system.

Therefore, financial data must always be isolated by hospital.

Example:

```text
Hospital A
    ├── Accountant A
    ├── Bill 101
    └── Bill 102

Hospital B
    ├── Accountant B
    ├── Bill 201
    └── Bill 202
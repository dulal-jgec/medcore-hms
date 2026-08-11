# Super Admin Module

The Super Admin module is responsible for managing the overall MedCore HMS platform, including hospitals, platform-level administration, hospital lifecycle management, and system-wide statistics.

The module operates at the **platform level**, not inside a specific hospital. Therefore, a Super Admin can manage multiple hospitals across the MedCore platform.

---

# 1. Module Responsibility

The Super Admin module handles:

- Super Admin profile management
- Super Admin authentication and authorization
- Super Admin activation and deactivation
- Hospital creation
- Hospital listing
- Hospital details
- Hospital searching
- Hospital updating
- Hospital status management
- Hospital soft deletion
- Hospital restoration
- Platform-level dashboard
- Hospital statistics
- Role-based access control
- Initial Super Admin bootstrapping

---

# 2. Super Admin Responsibilities

A Super Admin can:

- Access the MedCore platform at the system level
- View their own Super Admin profile
- Create hospitals
- View all hospitals
- View individual hospital details
- Search hospitals
- Update hospital information
- Activate or deactivate hospitals
- Soft delete hospitals
- Restore deleted hospitals
- View platform-wide hospital statistics
- Manage hospitals across the entire platform

A Super Admin cannot:

- Be restricted to a single hospital
- Access the system without the `SUPER_ADMIN` role
- Perform protected operations when inactive
- Be treated as a hospital-level employee

---

# 3. Super Admin Entity

The Super Admin entity represents the platform-level administrator of MedCore HMS.

Important relationships:

- SuperAdmin → User
- SuperAdmin → Role

Unlike hospital-level users, the Super Admin does **not** belong to a particular hospital.

```text
Super Admin
    ├── User
    ├── Role → SUPER_ADMIN
    └── Hospital → NULL
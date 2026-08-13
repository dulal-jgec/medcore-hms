# Super Admin Module

The Super Admin module is the **platform-level administrative layer** of the MedCore HMS system.

Unlike hospital-level users, the Super Admin operates across the entire MedCore platform and is responsible for managing hospitals, controlling hospital lifecycle, monitoring platform-level statistics, and performing administrative operations.

The module is designed around **role-based authorization, JWT authentication, soft deletion, transaction management, validation, and business-level access control**.

---

# 1. Module Responsibility

The Super Admin module is responsible for:

- Super Admin authentication and authorization
- Super Admin profile management
- Super Admin account status validation
- Hospital onboarding
- Hospital listing and searching
- Hospital information management
- Hospital status management
- Hospital soft deletion
- Hospital restoration
- Platform-level dashboard
- Hospital statistics
- Role-based access control
- Platform-wide hospital administration

The Super Admin operates at the **platform level**, rather than being associated with a single hospital.

---

# 2. Super Admin Responsibilities

A Super Admin can:

- View their own Super Admin profile
- Create a new hospital
- View all active hospitals
- View individual hospital details
- Search hospitals by name or city
- Update hospital information
- Change hospital status
- Soft delete a hospital
- Restore a deleted hospital
- View platform-level hospital statistics
- Manage multiple hospitals across the MedCore platform

The Super Admin is not treated as a hospital employee and is not restricted to a single hospital.

---

# 3. Super Admin Authorization

Super Admin APIs are protected using Spring Security and JWT authentication.

Protected endpoints use:

    @PreAuthorize("hasRole('SUPER_ADMIN')")

This ensures that an authenticated user must have the `SUPER_ADMIN` authority before accessing Super Admin APIs.

The authorization flow is:

    Client
       ↓
    JWT Access Token
       ↓
    JwtAuthenticationFilter
       ↓
    Validate JWT
       ↓
    Load UserDetails
       ↓
    Set Authentication in SecurityContext
       ↓
    Check SUPER_ADMIN role
       ↓
    SuperAdminController
       ↓
    SuperAdminService
       ↓
    Business Operation

Therefore, simply knowing a valid endpoint is not enough to access administrative operations.

---

# 4. Super Admin Account Status

Role-based authorization alone is not considered sufficient.

The system also validates the Super Admin's business status.

A Super Admin must have:

    Role   = SUPER_ADMIN
    Status = ACTIVE

before performing protected administrative operations.

For example, an inactive Super Admin may still have the SUPER_ADMIN role in the database, but the business layer prevents the user from performing administrative operations.

This provides two levels of protection:

    Authentication
          ↓
    Role Authorization
          ↓
    Business Status Validation
          ↓
    Operation

---

# 5. Super Admin and User Relationship

The Super Admin is associated with the platform User account.

Conceptually:

    SuperAdmin
        │
        └── User
              │
              └── Role = SUPER_ADMIN

The Super Admin does not belong to a specific hospital.

This is important because MedCore is designed as a **multi-tenant hospital management system**, where one platform-level administrator can manage multiple hospital tenants.

---

# 6. Hospital Management

The Super Admin is responsible for hospital lifecycle management.

Supported operations:

    POST   /api/v1/super-admin/hospitals
    GET    /api/v1/super-admin/hospitals
    GET    /api/v1/super-admin/hospitals/search
    PUT    /api/v1/super-admin/hospitals/{hospitalId}
    PATCH  /api/v1/super-admin/hospitals/{hospitalId}/status
    DELETE /api/v1/super-admin/hospitals/{hospitalId}
    PATCH  /api/v1/super-admin/hospitals/{hospitalId}/restore

These APIs allow the Super Admin to control the complete hospital lifecycle.

---

# 7. Hospital Creation Flow

When a Super Admin creates a hospital:

    Request
       ↓
    DTO Validation
       ↓
    Super Admin Authorization
       ↓
    Super Admin Status Validation
       ↓
    Normalize Input
       ↓
    Check Duplicate Email
       ↓
    Check Duplicate License Number
       ↓
    Check Duplicate Phone
       ↓
    Map DTO → Hospital Entity
       ↓
    Save Hospital
       ↓
    Map Entity → Response DTO
       ↓
    Return API Response

Hospital information is normalized before persistence, such as converting email addresses to lowercase and trimming input values.

---

# 8. Hospital Lifecycle Management

Hospitals follow a lifecycle controlled by the Super Admin.

The system supports statuses such as:

    PENDING
    ACTIVE
    SUSPENDED
    INACTIVE
    CLOSED

The Super Admin can update the hospital status through a dedicated endpoint.

This separates hospital lifecycle management from normal hospital information updates.

---

# 9. Soft Delete Strategy

Hospitals are not physically removed from the database.

Instead, the system uses:

    deletedAt

from the shared BaseEntity.

When a hospital is deleted:

    deletedAt = current timestamp

The hospital therefore remains available in the database for historical and recovery purposes.

Normal hospital queries use:

    deletedAt IS NULL

so deleted hospitals are excluded from normal active-hospital operations.

---

# 10. Hospital Restoration

A deleted hospital can be restored by the Super Admin.

Restore flow:

    Find Hospital
         ↓
    Verify hospital is deleted
         ↓
    Set deletedAt = null
         ↓
    Save Hospital
         ↓
    Return success response

This provides a recoverable deletion mechanism instead of permanent data loss.

---

# 11. Duplicate Data Protection

Hospital uniqueness is protected at two levels.

### Application Level

The service checks whether an active hospital already uses:

- Email
- Phone number
- License number

before creating or updating a hospital.

### Database Level

PostgreSQL partial unique indexes are used for active hospitals:

    email
    license_number
    phone

with the condition:

    deleted_at IS NULL

This means active hospitals must have unique values while soft-deleted hospitals do not unnecessarily block reuse.

The database constraint also protects against race conditions where two requests arrive simultaneously.

---

# 12. Pagination and Sorting

Hospital listing supports pagination:

    page
    size

The system also validates:

    page >= 0
    1 <= size <= 100

Sorting is protected using an allowlist of permitted fields.

Supported examples include:

    id
    name
    email
    city
    createdAt
    updatedAt

The API also validates the sort direction:

    asc
    desc

This prevents clients from arbitrarily using unsupported entity fields for sorting.

---

# 13. Hospital Search

Hospital search supports searching by:

- Hospital name
- City

The repository uses a custom query to perform case-insensitive matching.

Deleted hospitals are excluded from normal search operations.

Example:

    GET /api/v1/super-admin/hospitals/search?keyword=kolkata

The search result is also paginated.

---

# 14. Transaction Management

Hospital write operations are executed inside a service-level transaction boundary using:

    @Transactional

This provides a consistent transaction boundary for business operations such as:

- Create hospital
- Update hospital
- Update hospital status
- Delete hospital
- Restore hospital

The transaction boundary is placed at the service layer because this layer represents the business operation.

---

# 15. Exception Handling

The module uses centralized exception handling.

Examples:

    DuplicateResourceException
    ResourceNotFoundException
    BusinessException

The GlobalExceptionHandler converts these exceptions into consistent API responses.

Examples:

    409 CONFLICT
    404 NOT FOUND
    400 BAD REQUEST
    403 FORBIDDEN
    500 INTERNAL SERVER ERROR

This keeps controllers clean and provides a consistent API error structure.

---

# 16. Dashboard

The Super Admin dashboard provides platform-level hospital statistics.

Currently it supports statistics such as:

- Total active hospitals
- Active hospitals
- Inactive hospitals
- Deleted hospitals

The dashboard is designed to give the Super Admin a quick overview of the platform.

---

# 17. Architecture

The module follows a feature-based layered architecture:

    SuperAdminController
            ↓
    SuperAdminService
            ↓
    HospitalService
            ↓
    HospitalRepository
            ↓
        PostgreSQL

Security is handled separately through:

    JwtAuthenticationFilter
            ↓
    Spring Security
            ↓
    Role Authorization

This keeps authentication, authorization, business logic, persistence, and API responsibilities separated.

---

# 18. Security Layers

The Super Admin module currently uses multiple security layers:

1. JWT authentication
2. Role-based authorization
3. Super Admin status validation
4. DTO validation
5. Business validation
6. Database constraints
7. Soft-delete protection

Therefore security is not dependent on a single layer.

---

# 19. Design Decisions

Important design decisions include:

- JWT for stateless authentication
- Spring Security for authorization
- Role-based access control
- Service-level business validation
- DTO-based API contracts
- Mapper-based entity conversion
- Soft deletion instead of physical deletion
- PostgreSQL partial unique indexes
- Transactional service operations
- Pagination and controlled sorting
- Centralized exception handling
- Feature-based package structure

---

# 20. Overall Responsibility

The Super Admin module acts as the **control plane of MedCore HMS**.

Its main responsibility is not to operate inside a hospital, but to manage the hospitals and platform-level administration.

Conceptually:

    MedCore Platform
          │
          ├── Super Admin
          │      │
          │      ├── Hospital A
          │      ├── Hospital B
          │      ├── Hospital C
          │      └── Hospital N
          │
          └── Hospital Tenants

The Super Admin controls the hospital lifecycle while hospital-level users will later operate within their respective hospital tenant.
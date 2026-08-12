# Authentication Module

The Authentication module provides secure user authentication, authorization foundations, session management, and token-based access control for the MedCore Hospital Management System.

It is built using **Spring Security, JWT, BCrypt, Spring Data JPA, and PostgreSQL**.

---

## Authentication APIs

### Public APIs

| Method | Endpoint                | Description                                       |
| ------ | ----------------------- | ------------------------------------------------- |
| POST   | `/api/v1/auth/register` | Register a new patient account                    |
| POST   | `/api/v1/auth/login`    | Authenticate user and issue access/refresh tokens |

### Protected APIs

| Method | Endpoint               | Description                                              |
| ------ | ---------------------- | -------------------------------------------------------- |
| POST   | `/api/v1/auth/refresh` | Rotate refresh token and issue new access/refresh tokens |
| POST   | `/api/v1/auth/logout`  | Revoke the user's active refresh-token sessions          |
| GET    | `/api/v1/auth/me`      | Return the currently authenticated user's profile        |

> Password recovery and email verification APIs are planned for a later authentication-hardening phase.

---

## Authentication Features

### Core Authentication

* JWT-based authentication
* User registration
* User login
* BCrypt password hashing
* Short-lived JWT access tokens
* Protected REST APIs
* Current authenticated user endpoint
* Global exception handling
* Request validation
* Swagger/OpenAPI documentation

### Refresh Token Security

MedCore implements a stateful refresh-token strategy for secure session management.

* Cryptographically secure opaque refresh tokens
* 64-byte `SecureRandom` token generation
* SHA-256 hashing before database persistence
* Raw refresh token is never stored in the database
* Multiple refresh-token sessions per user
* Refresh-token expiration
* Refresh-token revocation
* Refresh-token rotation
* Previous refresh token invalidation after successful rotation
* Protection against reuse of revoked refresh tokens
* Logout-based revocation of all active refresh-token sessions

### Session Model

A user can maintain multiple active sessions simultaneously.

```text
User
 ├── Refresh Token / Session A
 ├── Refresh Token / Session B
 └── Refresh Token / Session C
```

This allows the authentication system to support multiple devices without forcing a user to terminate existing sessions when logging in from another device.

---

## Authentication Flow

### Registration

```text
Client
   ↓
POST /api/v1/auth/register
   ↓
Validate Request
   ↓
Check Email / Phone
   ↓
Validate Hospital
   ↓
Assign PATIENT Role
   ↓
Hash Password with BCrypt
   ↓
Persist User
```

### Login

```text
Client
   ↓
POST /api/v1/auth/login
   ↓
Spring Security Authentication
   ↓
Validate Credentials
   ↓
Generate JWT Access Token
   ↓
Generate Secure Refresh Token
   ↓
Hash Refresh Token
   ↓
Store Hash in PostgreSQL
   ↓
Return Access Token + Raw Refresh Token
```

### Refresh Token Rotation

```text
Client
   ↓
POST /api/v1/auth/refresh
   ↓
Receive Raw Refresh Token
   ↓
SHA-256 Hash
   ↓
Find Stored Token Hash
   ↓
Validate Expiration / Revocation
   ↓
Revoke Previous Refresh Token
   ↓
Generate New Access Token
   ↓
Generate New Refresh Token
   ↓
Store New Token Hash
   ↓
Return New Access Token + Refresh Token
```

### Logout

```text
Authenticated User
        ↓
POST /api/v1/auth/logout
        ↓
Find User Sessions
        ↓
Revoke Active Refresh Tokens
        ↓
Clear Security Context
```

---

## Security Design

### Password Security

User passwords are never stored in plaintext.

```text
Raw Password
     ↓
BCrypt
     ↓
Hashed Password
     ↓
PostgreSQL
```

### Access Token

The access token is a short-lived JWT used to authenticate protected API requests.

```text
Client
   ↓
Authorization: Bearer <access-token>
   ↓
Spring Security
   ↓
JWT Validation
   ↓
Protected Resource
```

### Refresh Token

Refresh tokens are intentionally implemented separately from access tokens.

```text
Access Token
→ JWT
→ Short-lived
→ Stateless

Refresh Token
→ Opaque random credential
→ Long-lived
→ Stateful
→ Database-backed
→ Revocable
→ Rotated
```

The database stores only the SHA-256 hash of the refresh token, not the original credential.

---

## Role Model

The system currently defines the following roles:

* `SUPER_ADMIN`
* `HOSPITAL_ADMIN`
* `DOCTOR`
* `NURSE`
* `RECEPTIONIST`
* `LAB_TECHNICIAN`
* `PHARMACIST`
* `ACCOUNTANT`
* `PATIENT`

Public registration assigns the `PATIENT` role by default. Privileged roles are not accepted directly from the public registration request.

---

## User Account States

Users can have the following states:

* `ACTIVE`
* `INACTIVE`
* `BLOCKED`
* `PENDING_VERIFICATION`

These states form the foundation for account lifecycle and authentication restrictions.

---

## Technology Stack

| Component          | Technology                  |
| ------------------ | --------------------------- |
| Security Framework | Spring Security             |
| Authentication     | JWT                         |
| Password Hashing   | BCrypt                      |
| Persistence        | Spring Data JPA / Hibernate |
| Database           | PostgreSQL                  |
| API Documentation  | Swagger / OpenAPI           |
| Validation         | Jakarta Bean Validation     |
| Token Persistence  | PostgreSQL                  |

---

## Current Security Architecture

```text
                    ┌─────────────────────┐
                    │       Client        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Spring Security   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    JWT Validation   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        Access Token                    Refresh Token
            JWT                         Opaque Token
        Short-lived                     Long-lived
        Stateless                       Stateful
                                            │
                                            ▼
                                      SHA-256 Hash
                                            │
                                            ▼
                                        PostgreSQL
```

---

## Authentication Hardening Roadmap

The following security improvements are planned as part of the backend hardening phase:

* Multi-tenant authorization
* Super Admin tenant model
* Role-based authorization enforcement
* User-status enforcement
* Concurrent refresh protection
* Device/session metadata
* Email verification
* Forgot/reset password
* Rate limiting
* Redis-backed session/rate-limit support
* Security and integration tests

# Authentication Module

## Authentication APIs

### Public APIs

- POST /auth/register
- POST /auth/login
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/verify-email

### Protected APIs

- POST /auth/refresh
- POST /auth/logout
- GET /auth/me

## Authentication Module (Completed)

- JWT Authentication
- User Registration
- User Login
- Password Encryption (BCrypt)
- JWT Access Token
- Refresh Token
- Logout
- Current User API (/me)
- Global Exception Handling
- Swagger API Documentation
- Spring Security Configuration




## Authentication Flow

Register
→ Login
→ JWT Access Token
→ Refresh Token
→ Protected APIs
→ Logout
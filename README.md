# MedCore HMS — Multi-Tenant Hospital Management System

MedCore HMS is a hospital management platform I am building to manage hospital operations through a centralized system. My main focus has been on the backend, especially multi-tenant architecture, security, database design, and handling real-world failure scenarios.

I wanted to build something beyond basic CRUD operations and understand how backend systems should behave when requests are repeated, multiple workers run concurrently, or an external service fails.

The project is still evolving, and I am continuing to improve its reliability, features, and overall user experience.

## Project Links

- **Frontend:**  https://medcore-hms-eight.vercel.app/login
- **Backend:**  https://medcore-backend-jbgq.onrender.com
- **Health Check:**  https://medcore-backend-jbgq.onrender.com/api/v1/health
## Tech Stack

**Backend**
- Java 21
- Spring Boot
- Spring Security
- JWT authentication
- Spring Data JPA / Hibernate
- Maven

**Database and Caching**
- PostgreSQL
- Redis

**Frontend**
- Next.js
- JavaScript

**Deployment and Tools**
- Docker
- Docker Compose
- Nginx
- Git and GitHub
- Flyway Database Migration
- Postman

## What I Have Built

### 1. Multi-Tenant Architecture

MedCore is designed as a multi-tenant platform where multiple hospitals can use the same application while keeping their data isolated.

The main challenge was not simply adding a `hospital_id` column to database tables. I also needed to make sure that a user from one hospital could not access another hospital's data through an API request.

Key areas include:

- Hospital-level data isolation.
- Tenant-aware backend operations.
- Role-based access control.
- Validation of access to hospital-specific resources.
- Separation of platform-level and hospital-level responsibilities.

I tested the isolation using accounts from different hospitals and verified that unauthorized cross-hospital access was rejected.

### 2. Authentication and Authorization

I implemented an authentication system using Spring Security and JWT.

The authentication flow includes:

- User registration and login.
- JWT-based authentication.
- Access-token and refresh-token handling.
- Logout and refresh-token revocation.
- Role-based authorization.
- Protected API endpoints.

MedCore supports different roles, including:

- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `DOCTOR`
- `NURSE`
- `RECEPTIONIST`
- `LAB_TECHNICIAN`
- `PHARMACIST`
- `ACCOUNTANT`
- `PATIENT`

The goal is to ensure that users can access only the operations and resources permitted by their role and hospital context.

### 3. Reliable Email Invitation System

One of the backend features I spent significant time working on is the hospital staff invitation workflow.

A straightforward implementation would create a user and immediately send an email. However, email delivery depends on an external service, which can fail independently of the database transaction.

To handle this, I implemented a transactional email outbox approach.

The workflow includes:

- Creating the user and outbox record within the same database transaction.
- Processing emails asynchronously.
- Tracking email delivery states.
- Retrying failed deliveries.
- Exponential backoff and jitter.
- Recovering stale `PROCESSING` records.
- Limiting invitation attempts.
- Supporting controlled manual resends.

The email outbox uses states such as `PENDING`, `PROCESSING`, `SENT`, and `EXHAUSTED`.

I also used PostgreSQL row locking with `FOR UPDATE SKIP LOCKED` to allow workers to claim different pending emails without selecting the same locked records.

### 4. Idempotent Invitation Resend

I implemented idempotency for invitation resend operations to prevent the same request from creating duplicate invitation operations.

The implementation uses:

- An `Idempotency-Key` request header.
- An `idempotency_records` database table.
- A unique database constraint on the idempotency key.
- Atomic insertion using PostgreSQL `ON CONFLICT DO NOTHING`.
- Validation of the latest invitation state before allowing a resend.

This was an important learning experience because checking whether a key exists before inserting it can create a race condition when concurrent requests arrive.

The database-level constraint and atomic operation provide protection against duplicate processing of the same idempotency key.

I also considered the limitations of external email delivery: a worker can crash after the email provider accepts an email but before the database records it as sent. Therefore, the system cannot guarantee exactly-once email delivery across the database and SMTP service.

### 5. Database Indexing and Query Performance

I reviewed the existing PostgreSQL indexes before adding new ones.

The goal was to support the queries used by the application without creating unnecessary indexes on every column.

The work included:

- Inspecting existing indexes.
- Reviewing foreign-key columns and query patterns.
- Understanding B-Tree indexes.
- Working with partial indexes.
- Understanding composite index column order.
- Using `EXPLAIN` to inspect planned execution.
- Using `EXPLAIN ANALYZE` to inspect actual query execution.
- Considering the storage and write overhead of indexes.

I added query indexes through a Flyway migration:

`V27__add_query_indexes.sql`

The migration was applied and verified through `flyway_schema_history`.

This work helped me understand that indexes should be selected according to actual query patterns and measured performance, rather than added blindly.

### 6. Database Transactions and Concurrency

I am studying and applying transaction management and concurrency control to improve the correctness of backend operations.

My focus includes:

- ACID properties.
- Transaction boundaries with Spring's `@Transactional`.
- Database commit and rollback.
- Transaction isolation levels.
- Race conditions and lost updates.
- Database locking.
- Safe handling of concurrent requests.

I am continuing to strengthen the practical implementation and testing of these concepts within MedCore.

### 7. Redis Integration

MedCore includes Redis integration, and I am continuing to improve my understanding and implementation of caching and related performance concerns.

My focus is on learning how to use caching appropriately, including cache invalidation, TTL, consistency, failure handling, and the trade-offs between faster reads and stale data.

### 8. Database Migration Management

I use Flyway to version database schema changes.

Instead of relying only on manual database modifications, schema changes can be tracked through migration files alongside the application code.

This makes database changes easier to review and helps keep schema evolution organized across environments.

### 9. Deployment

I have deployed the backend and frontend to publicly accessible environments.

The deployment setup includes:

- Spring Boot backend deployed on Render.
- PostgreSQL and Redis hosted through Railway.
- Frontend deployed on Vercel.
- Docker-based backend deployment.
- Environment-based application configuration.
- A health endpoint for checking backend availability.

Deployment has also given me practical experience with environment variables, database connectivity, Redis authentication, and troubleshooting configuration problems across environments.

## Engineering Challenges

Some of the most useful challenges I have worked through are:

- Enforcing data isolation in a multi-tenant application.
- Designing authentication and authorization across different roles.
- Separating email delivery from the main database transaction.
- Handling retry limits and recovering interrupted email processing.
- Preventing duplicate resend operations using database-level idempotency.
- Understanding concurrency problems that can occur when requests arrive simultaneously.
- Improving database queries through indexes and execution-plan analysis.
- Configuring the application to run in a deployed environment.

These problems have helped me understand why production backend engineering requires more than implementing endpoints that work under normal conditions.

## Architecture Overview

At a high level, the system contains:

1. A Next.js frontend for interacting with the application.
2. A Spring Boot backend for business logic and API handling.
3. Spring Security and JWT for authentication and authorization.
4. PostgreSQL for persistent application data.
5. Redis for supporting caching and related backend use cases.
6. An email outbox processor for asynchronous invitation delivery.
7. Flyway for database schema migrations.
8. Docker and cloud hosting for deployment.

The backend is organized into modules and layers to keep responsibilities separated and make the code easier to maintain as the project grows.

## Current Focus

I am continuing to work on:

- Completing and improving the frontend experience.
- Strengthening transaction and concurrency handling.
- Improving Redis caching and performance.
- Reviewing API design and database access patterns.
- Expanding notification and other hospital workflows.
- Improving testing, monitoring, and deployment reliability.
- Exploring system design and AI integration with Spring AI.

## What I Have Learned

Working on MedCore has helped me connect backend concepts with practical implementation.

I have learned that building a reliable backend is not only about making an API return the correct response. It also involves considering failure scenarios, concurrent requests, authorization boundaries, database consistency, retries, performance, and maintainability.

I am continuing to build and improve MedCore as a practical way to develop my backend engineering skills.

---

**Project Status:** Actively developing and improving.

**Primary Focus:** Java, Spring Boot, backend engineering, multi-tenancy, database reliability, and system design.

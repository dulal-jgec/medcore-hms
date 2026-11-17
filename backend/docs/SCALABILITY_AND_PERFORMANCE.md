# MedCore HMS — Backend Scalability & Performance Engineering

## Day 3: Backend Scalability, Load Balancing, Database Optimization and Performance Testing

**Project:** MedCore HMS  
**Module:** Backend Engineering  
**Branch:** `feature/scalability-and-performance`  
**Technology Stack:** Spring Boot, Java 21, PostgreSQL, Redis, Docker, Docker Compose, Nginx, k6  
**Status:** Implementation completed; further performance benchmarking planned.

---

# 1. Introduction

As MedCore HMS evolves into a multi-tenant Hospital Management SaaS platform, the backend must support increasing numbers of hospitals, administrators, doctors, receptionists and patients.

A single backend instance may initially handle application traffic, but as the number of users and requests increases, several challenges can arise:

- Increased server load.
- Higher API response times.
- Database query overhead.
- Uneven request distribution.
- Database connection pool pressure.
- Reduced application availability during high traffic.

To address these challenges, I worked on backend scalability and performance optimization.

The main objectives were:

1. Support multiple backend instances.
2. Distribute incoming HTTP requests using Nginx.
3. Identify and eliminate an N+1 database query problem.
4. Monitor database connection pool metrics.
5. Perform load testing using k6.
6. Understand how the application behaves under concurrent traffic.

This work is part of the scalability engineering phase of MedCore HMS.

---

# 2. Architecture Before and After

## 2.1 Previous Architecture

Initially, Nginx forwarded incoming requests directly to a single backend service.

```text
                 Client
                   |
                   |
                 Nginx
                   |
                   |
             Spring Boot
             Backend (1)
                   |
                   |
               PostgreSQL
```

### Limitations

- All application requests reached one backend instance.
- The backend handled all incoming application traffic.
- There was no load distribution across multiple backend instances.
- Scaling the application horizontally was not yet configured.

## 2.2 Updated Architecture

I configured Docker Compose to support multiple backend instances and introduced Nginx upstream load balancing.

```text
                    Clients
                       |
                       |
                  Nginx :80
                       |
                Load Balancer
                 (least_conn)
                       |
          +------------+------------+
          |            |            |
          v            v            v
      Backend 1    Backend 2    Backend 3
       :8080        :8080        :8080
          |            |            |
          +------------+------------+
                       |
             +---------+---------+
             |                   |
             v                   v
         PostgreSQL             Redis
```

### Benefits

- Multiple backend instances can process requests.
- Nginx distributes incoming traffic.
- Application capacity can be increased by adding backend replicas.
- The architecture provides a foundation for horizontal scaling.

**Important:** Multiple instances improve the ability to distribute traffic, but they do not automatically guarantee better performance. Database capacity, connection pools and application bottlenecks must also be considered.

---

# 3. Docker Compose — Horizontal Scaling

## 3.1 What is Horizontal Scaling?

Horizontal scaling means increasing application capacity by adding more application instances.

There are two common scaling approaches:

### Vertical Scaling

Increasing the resources of an existing server.

For example:

- Increasing CPU cores.
- Increasing RAM.
- Using a more powerful machine.

```text
       One Backend
            |
      More CPU + RAM
```

### Horizontal Scaling

Adding multiple application instances.

```text
       Backend 1
       Backend 2
       Backend 3
```

In MedCore HMS, I implemented the foundation for horizontal scaling using Docker Compose.

## 3.2 Problem with Fixed Container Names

Previously, the backend service had:

```yaml
services:
  backend:
    container_name: medcore-backend
```

A fixed container name is unsuitable for scaling the same Compose service into multiple replicas because each container cannot share the same explicit name.

I removed:

```yaml
container_name: medcore-backend
```

The backend service now allows Docker Compose to generate unique container names.

## 3.3 Expose Instead of Publishing the Backend Port

The backend service uses:

```yaml
services:
  backend:
    build:
      context: .
    expose:
      - "8080"
```

`expose` makes the application port available to other services on the Docker network.

Nginx communicates with backend containers through the internal Docker network.

The backend does not need to publish port 8080 directly to the host for this architecture.

## 3.4 Running Multiple Backend Instances

I used:

```powershell
docker compose up -d --build --scale backend=3
```

### Command Explanation

| Option | Meaning |
|---|---|
| `up` | Creates and starts containers |
| `-d` | Runs containers in detached mode |
| `--build` | Builds the image before starting |
| `--scale backend=3` | Starts three instances of the backend service |

To verify:

```powershell
docker compose ps
```

Expected backend instances:

```text
backend-backend-1
backend-backend-2
backend-backend-3
```

Each instance runs the same Spring Boot application.

### Why Is This Useful?

Instead of depending on a single application process, the system can distribute requests across multiple application instances.

This is the foundation of horizontal application scaling.

---

# 4. Nginx Load Balancing

## 4.1 What is Load Balancing?

Load balancing is the process of distributing incoming requests across multiple backend servers or application instances.

Without load balancing:

```text
Client
  |
Nginx
  |
Backend 1
```

With load balancing:

```text
             Client
               |
             Nginx
               |
         Load Balancer
          /    |    \
         /     |     \
        v      v      v
       B1     B2     B3
```

### Why Do We Need It?

Suppose 1,000 requests arrive at the application.

If all requests go to one backend instance, that instance must handle all the traffic.

With multiple backend instances, Nginx can distribute the requests among available instances.

This helps distribute application workload.

## 4.2 Nginx Upstream Configuration

I configured the upstream group in:

`backend/nginx/nginx.conf`

```nginx
events {}

http {

    # Log which backend instance handles each request
    log_format upstreamlog
        '$remote_addr - $request '
        'upstream=$upstream_addr '
        'status=$status '
        'response_time=$request_time';

    access_log /var/log/nginx/access.log upstreamlog;

    # Backend load balancing
    upstream medcore_backend {
        least_conn;
        server backend:8080;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://medcore_backend;

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 4.3 Understanding Upstream

```nginx
upstream medcore_backend {
    least_conn;
    server backend:8080;
}
```

The upstream block defines a group of backend servers.

Here:

- `medcore_backend` is the upstream group name.
- `backend:8080` identifies the Docker Compose backend service.
- Docker Compose provides the service discovery and networking between Nginx and backend containers.

Nginx can discover the available backend instances through the Docker service name.

## 4.4 Understanding least_conn

```nginx
least_conn;
```

`least_conn` is an Nginx load-balancing method.

It directs a new request to the backend with the fewest active connections.

Example:

```text
Backend 1: 10 active connections
Backend 2:  4 active connections
Backend 3:  7 active connections

New request
     |
     v
Backend 2
```

This helps distribute requests based on active connection counts rather than simply assigning every request in sequence.

### Other Load Balancing Algorithms

| Algorithm | Explanation |
|---|---|
| Round Robin | Distributes requests sequentially |
| Least Connections | Selects the server with the fewest active connections |
| IP Hash | Uses client IP information to determine the server |

For this implementation, I selected `least_conn`.

## 4.5 Reverse Proxy

Nginx also acts as a reverse proxy.

```nginx
proxy_pass http://medcore_backend;
```

A reverse proxy receives client requests and forwards them to backend application servers.

The client communicates with Nginx rather than directly accessing individual backend containers.

### Benefits

- Centralized request entry point.
- Backend instances remain behind the reverse proxy.
- Request distribution.
- Centralized access logging.
- Easier integration of TLS termination and additional proxy policies in the future.

## 4.6 Request Logging

I added:

```nginx
log_format upstreamlog
    '$remote_addr - $request '
    'upstream=$upstream_addr '
    'status=$status '
    'response_time=$request_time';
```

This allows me to inspect:

- Client IP.
- Requested URL.
- Backend instance address.
- HTTP status.
- Request processing time.

Example:

```text
upstream=172.18.0.5:8080 status=200
upstream=172.18.0.3:8080 status=200
upstream=172.18.0.6:8080 status=200
```

These logs showed that requests were reaching all three backend instances.

## 4.7 Verifying Load Balancing

I sent multiple requests to:

```text
http://localhost/api/v1/health
```

I inspected Nginx logs using:

```powershell
docker compose logs --tail=30 nginx
```

The logs showed different upstream backend addresses:

```text
172.18.0.5:8080
172.18.0.3:8080
172.18.0.6:8080
```

### Result

The request distribution across all three backend instances was verified.

This confirmed that the Nginx upstream configuration was working.

---

# 5. Actuator Metrics and HikariCP Monitoring

## 5.1 What is Spring Boot Actuator?

Spring Boot Actuator provides endpoints for monitoring and managing application information.

It can expose information such as:

- Application health.
- JVM metrics.
- HTTP request metrics.
- Database connection pool metrics.
- Other application metrics.

For MedCore HMS, I enabled the health and metrics endpoints in the development profile.

## 5.2 Configuration

In:

`backend/src/main/resources/application-dev.yml`

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics
```

This exposes the health and metrics endpoints for the development environment.

Example endpoints:

```text
/actuator/health
/actuator/metrics
```

A specific Hikari metric can be requested using:

```text
/actuator/metrics/hikaricp.connections.active
```

Other relevant metrics:

```text
/actuator/metrics/hikaricp.connections.idle
/actuator/metrics/hikaricp.connections.pending
/actuator/metrics/hikaricp.connections.max
```

**Security consideration:** These metrics endpoints should not be exposed publicly without appropriate authentication and network restrictions in production.

## 5.3 What is HikariCP?

HikariCP is a JDBC database connection pool used by Spring Boot applications.

Opening a new database connection for every request is expensive.

Instead, HikariCP maintains a pool of reusable database connections.

```text
          Spring Boot
               |
               |
          HikariCP Pool
               |
       +-------+-------+
       |       |       |
      DB 1    DB 2    DB 3
       |       |       |
       +-------+-------+
               |
           PostgreSQL
```

The application borrows an available connection from the pool, executes database operations, and returns the connection to the pool.

## 5.4 Important HikariCP Metrics

| Metric | Meaning |
|---|---|
| Active | Connections currently being used |
| Idle | Connections currently available |
| Pending | Threads waiting for a connection |
| Max | Maximum configured pool size |

### Why Monitor These Metrics?

Suppose a large number of requests arrive simultaneously.

If all database connections are busy:

- New requests may wait for connections.
- Pending connection count may increase.
- API response times may increase.
- The database connection pool may become a bottleneck.

Monitoring these metrics helps identify potential database connection pressure.

## 5.5 HikariCP Monitoring Script

I created:

`performance/monitor-hikari.ps1`

```powershell
$baseUrl = "http://localhost:8080/actuator/metrics/hikaricp.connections"
$csvFile = ".\hikari-metrics.csv"
$duration = 40

$metrics = @("active", "idle", "pending", "max")
$results = [System.Collections.Generic.List[object]]::new()

# Remove old CSV data
if (Test-Path $csvFile) {
    Remove-Item $csvFile
}

Write-Host "HikariCP Monitoring Started..."
Write-Host "Duration: $duration seconds"

$startTime = Get-Date
$endTime = $startTime.AddSeconds($duration)

while ((Get-Date) -lt $endTime) {

    $row = [ordered]@{
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff")
    }

    foreach ($metric in $metrics) {

        try {
            $response = Invoke-RestMethod `
                -Uri "$baseUrl.$metric" `
                -TimeoutSec 3

            $row[$metric] = [double]$response.measurements[0].value
        }
        catch {
            $row[$metric] = -1
        }
    }

    $results.Add([PSCustomObject]$row)

    Start-Sleep -Milliseconds 200
}

# Save fresh CSV data
$results | Export-Csv -Path $csvFile -NoTypeInformation

Write-Host "`n========== HIKARI MONITORING REPORT =========="

Write-Host "Total Samples: $($results.Count)"

foreach ($metric in $metrics) {

    $values = @(
        $results | ForEach-Object { $_.$metric } |
        Where-Object { $_ -ge 0 }
    )

    if ($values.Count -gt 0) {

        $maxValue = ($values | Measure-Object -Maximum).Maximum
        $avgValue = ($values | Measure-Object -Average).Average

        Write-Host "$metric : Maximum = $maxValue | Average = $([math]::Round($avgValue, 2))"
    }
}

Write-Host "`nCSV saved: $csvFile"
```

### How the Script Works

1. Defines the Actuator metrics endpoint.
2. Selects four HikariCP metrics.
3. Collects metrics repeatedly.
4. Records timestamps.
5. Stores the collected values in a CSV file.
6. Calculates maximum and average values.

### Important Observation

During an earlier monitoring run, the collected values showed:

```text
active  = 0
idle    = 2
pending = 0
max     = 10
```

This was a snapshot of the connection pool during monitoring.

It does not prove that the connection pool never experienced higher usage. Short-lived database operations can finish between metric collection intervals.

Therefore, HikariCP monitoring is useful for understanding connection pool behavior, but further controlled experiments are needed to assess connection pool pressure under load.

---

# 6. Database Optimization — N+1 Query Problem

## 6.1 What is the N+1 Query Problem?

The N+1 query problem occurs when an application executes:

- One query to fetch a list of records.
- Additional queries for each record to retrieve related information.

For example, suppose we need to retrieve six Hospital Admins and their latest invitation statuses.

The application first fetches the Admin list.

Then it executes one additional invitation query for every Admin.

```text
1. Fetch all Hospital Admins
             |
             v
       6 Admin records
             |
     +-------+-------+
     |       |       |
     v       v       v
   Query 1 Query 2 Query 3
     |       |       |
     +-------+-------+
             |
        Query 4
             |
        Query 5
             |
        Query 6
```

The total number of queries becomes:

```text
1 + 6 = 7 queries
```

This creates unnecessary database round trips.

As the number of records increases, the number of additional queries also increases.

## 6.2 Where Was the Problem?

The problem existed in:

`SuperAdminServiceImpl.java`

Inside the Hospital Admin listing method:

```java
getAllHospitalAdmins(int page, int size)
```

The previous implementation used:

```java
admins.getContent().stream().map(user -> {

    EmailOutbox latestInvitation = emailOutboxRepository
            .findTopByUser_IdAndTypeOrderByInvitationAttemptDescCreatedAtDesc(
                    user.getId(),
                    EmailType.HOSPITAL_ADMIN_CREDENTIALS
            )
            .orElse(null);

    // Build response

});
```

### Why Was This a Problem?

The repository method was called separately for every Admin.

For six Admins, the application performed six invitation lookup queries.

The database had to process multiple queries instead of retrieving the required information in one batch.

## 6.3 Optimization Strategy

I replaced individual invitation lookups with a batch query.

The new approach:

1. Fetch the paginated Admin list.
2. Collect all Admin IDs.
3. Fetch the latest invitation statuses in one database query.
4. Store the results in a Map.
5. Build the response using the Map.

New flow:

```text
Fetch Admin Page
       |
       v
Collect Admin IDs
       |
       v
Execute One Batch Query
       |
       v
Build Map<UserId, InvitationStatus>
       |
       v
Build API Response
```

## 6.4 Repository Optimization

File:

`EmailOutboxRepository.java`

I introduced a projection:

```java
interface LatestInvitationStatus {

    Long getUserId();

    String getStatus();
}
```

This projection retrieves only the required fields.

Then I added:

```java
@Query(
        value = """
                SELECT DISTINCT ON (eo.user_id)
                       eo.user_id AS "userId",
                       eo.status AS "status"
                FROM email_outbox eo
                WHERE eo.user_id IN (:userIds)
                  AND eo.type = :type
                ORDER BY
                    eo.user_id,
                    eo.invitation_attempt DESC,
                    eo.created_at DESC
                """,
        nativeQuery = true
)
List<LatestInvitationStatus> findLatestInvitationStatuses(
        @Param("userIds") List<Long> userIds,
        @Param("type") String type
);
```

## 6.5 Understanding DISTINCT ON

`DISTINCT ON` is a PostgreSQL-specific SQL feature.

It returns one row for each distinct value of the specified column.

Here:

```sql
SELECT DISTINCT ON (eo.user_id)
```

means that the query returns one invitation record per user.

The ordering is important:

```sql
ORDER BY
    eo.user_id,
    eo.invitation_attempt DESC,
    eo.created_at DESC
```

This ensures that the selected record is the latest according to:

1. Highest invitation attempt.
2. Latest creation timestamp when invitation attempts are equal.

The `IN` condition:

```sql
WHERE eo.user_id IN (:userIds)
```

restricts the query to the Admin IDs on the current page.

The query retrieves the latest invitation status for all those users in one batch.

## 6.6 Service Layer Optimization

In `SuperAdminServiceImpl.java`, I first collect Admin IDs:

```java
List<Long> adminIds = admins.getContent()
        .stream()
        .map(User::getId)
        .toList();
```

Then create a Map:

```java
Map<Long, EmailOutboxStatus> invitationStatusMap = new HashMap<>();
```

Next, execute the batch query:

```java
if (!adminIds.isEmpty()) {

    List<EmailOutboxRepository.LatestInvitationStatus> invitations =
            emailOutboxRepository.findLatestInvitationStatuses(
                    adminIds,
                    EmailType.HOSPITAL_ADMIN_CREDENTIALS.name()
            );

    for (EmailOutboxRepository.LatestInvitationStatus invitation : invitations) {

        invitationStatusMap.put(
                invitation.getUserId(),
                EmailOutboxStatus.valueOf(invitation.getStatus())
        );
    }
}
```

Finally, use the Map while building the response:

```java
.invitationStatus(invitationStatusMap.get(user.getId()))
```

### Why Use a HashMap?

A HashMap provides efficient average-case lookup by key.

Instead of executing a database query for each Admin, the application retrieves the statuses once and then accesses them from memory.

## 6.7 Query Comparison

For a page containing six Admins:

| Operation | Old Implementation | Optimized Implementation |
|---|---:|---:|
| Admin page query | 1 | 1 |
| Invitation lookup queries | 6 | 1 |
| Total relevant queries | 7 | 2 |

This comparison excludes unrelated authentication, authorization, pagination count and other application queries.

### Reduction in Invitation Lookup Queries

```text
Old:        6 queries
Optimized:  1 query
```

Reduction:

```text
(6 - 1) / 6 × 100

= 83.33%
```

The invitation lookup query count was reduced by approximately 83.33% for a page containing six Admins.

**Important:** This percentage refers only to invitation lookup queries, not all SQL queries executed during the API request.

### Benefits

- Fewer database round trips.
- Reduced repeated query execution.
- Better efficiency when listing multiple Admins.
- More scalable database access pattern.
- Cleaner separation between data retrieval and response construction.

---

# 7. Load Testing with k6

## 7.1 What is Load Testing?

Load testing evaluates how an application behaves under a defined amount of traffic.

It helps answer questions such as:

- How many requests can the application handle?
- What is the average response time?
- How does response time change under concurrent traffic?
- Are requests failing?
- Are there slow requests?
- Does throughput remain stable?

For MedCore HMS, I used k6 to test the Hospital Admin listing API.

## 7.2 Why k6?

k6 is a load-testing tool that allows developers to simulate virtual users and generate HTTP traffic.

It provides metrics such as:

- Request count.
- Request rate.
- Average response time.
- Median response time.
- P90 and P95 response times.
- HTTP failure rate.
- Check success and failure rates.

## 7.3 Installation Verification

I used:

```powershell
k6 version
```

To verify that k6 was available.

## 7.4 Load Testing Script

File:

`performance/hospital-load-test.js`

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 10,
    duration: "30s",
};

export default function () {

    const token = __ENV.SUPER_ADMIN_TOKEN;

    const url =
        "http://localhost/api/v1/super-admin/admins?page=0&size=10";

    const params = {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    };

    const response = http.get(url, params);

    check(response, {
        "Status is 200": (r) => r.status === 200,
        "Response time below 1000ms": (r) => r.timings.duration < 1000,
    });

    sleep(1);
}
```

## 7.5 Understanding the Script

### Virtual Users

```javascript
vus: 10
```

This configures ten virtual users in the script's default scenario.

For the actual benchmark, I overrode this using the CLI.

### Duration

```javascript
duration: "30s"
```

This is the script's default test duration.

Again, the benchmark command can override it.

### Authentication Token

```javascript
const token = __ENV.SUPER_ADMIN_TOKEN;
```

The JWT is supplied through an environment variable rather than hardcoded in the test script.

In PowerShell:

```powershell
$env:SUPER_ADMIN_TOKEN = "YOUR_FRESH_ACCESS_TOKEN"
```

The token must be a valid access token for the Super Admin endpoint.

Never commit JWT tokens or credentials to Git.

### API Endpoint

```javascript
const url =
    "http://localhost/api/v1/super-admin/admins?page=0&size=10";
```

This endpoint retrieves a paginated list of Hospital Admins.

### HTTP Request

```javascript
const response = http.get(url, params);
```

Each virtual user sends HTTP GET requests to the endpoint.

### Checks

```javascript
check(response, {
    "Status is 200": (r) => r.status === 200,
    "Response time below 1000ms": (r) => r.timings.duration < 1000,
});
```

Two conditions are checked:

1. HTTP status must be 200.
2. Response time must be below 1000 milliseconds.

A response can pass the HTTP status check but fail the response-time check.

That distinction is important when interpreting k6 results.

## 7.6 Running the Benchmark

For the 50-user, 60-second test:

```powershell
k6 run --vus 50 --duration 60s performance/hospital-load-test.js
```

This overrides the script defaults.

| Parameter | Value |
|---|---|
| Virtual Users | 50 |
| Duration | 60 seconds |
| HTTP Method | GET |
| Endpoint | Hospital Admin listing |
| Authentication | Super Admin JWT |
| Success condition | HTTP 200 |
| Performance check | Response time below 1000 ms |

---

# 8. Understanding k6 Performance Metrics

## 8.1 Total Requests

The total number of HTTP requests generated during the test.

Higher request counts can indicate that the system processed more iterations during the test period, but request counts must be interpreted together with test duration and workload.

## 8.2 Throughput

Throughput represents the number of requests processed per second.

Example:

```text
45 requests/second
```

This means the test generated approximately 45 HTTP requests per second.

Higher throughput generally indicates greater request-processing capacity under the tested conditions.

## 8.3 Average Response Time

Average response time is the arithmetic mean of all recorded request durations.

A lower average generally indicates faster responses.

However, averages can hide occasional slow requests.

## 8.4 Median (P50)

The median is the 50th percentile.

Half of the requests completed within this duration.

It is useful for understanding typical request latency.

## 8.5 P90

P90 is the 90th percentile.

90% of requests completed within this duration.

## 8.6 P95

P95 is the 95th percentile.

95% of requests completed within this duration.

P95 is useful because it captures the experience of slower requests better than the average alone.

## 8.7 Maximum Response Time

The maximum represents the slowest recorded request.

A high maximum can indicate occasional latency spikes.

## 8.8 HTTP Failure Rate

This metric represents the percentage of failed HTTP requests.

For the tested endpoint:

```text
http_req_failed = 0%
```

means no HTTP requests were classified as failed by k6.

## 8.9 Checks Failed

Checks are separate validation conditions.

For example, a request can return HTTP 200 but take longer than one second.

In that case:

```text
Status is 200                  PASS
Response time below 1000ms     FAIL
```

This is why `checks_failed` and `http_req_failed` are not interchangeable.

---

# 9. Performance Test Results

The following results were collected during the scalability and optimization work.

## 9.1 Earlier Three-Backend Benchmark

An earlier test using three backend instances produced:

| Metric | Result |
|---|---:|
| Virtual Users | 50 |
| Total Requests | 1,331 |
| Throughput | 42.93 req/sec |
| Average Response Time | 145.72 ms |
| Median | 52.19 ms |
| P90 | 350.03 ms |
| P95 | 820.51 ms |
| Maximum | 1.28 sec |
| HTTP Failure Rate | 0% |
| Status 200 | 100% |

## 9.2 Optimized Implementation Benchmark

After implementing the batch invitation query, the following test was performed:

```powershell
k6 run --vus 50 --duration 60s performance/hospital-load-test.js
```

Results:

| Metric | Result |
|---|---:|
| Virtual Users | 50 |
| Duration | 60 seconds |
| Total Requests | 2,738 |
| Throughput | 45.06 req/sec |
| Average Response Time | 101.66 ms |
| Median | 40.51 ms |
| P90 | 119.02 ms |
| P95 | 494.69 ms |
| Maximum | 1.55 sec |
| HTTP Failure Rate | 0% |
| Status 200 | 100% |

The response-time check results were:

```text
checks_total:      5476
checks_succeeded:  5426
checks_failed:       50
```

All 50 failed checks were related to the response-time condition exceeding 1000 milliseconds.

HTTP requests themselves did not fail.

## 9.3 Preliminary Comparison

| Metric | Earlier Record | Optimized Record |
|---|---:|---:|
| Throughput | 42.93 req/sec | 45.06 req/sec |
| Average | 145.72 ms | 101.66 ms |
| Median | 52.19 ms | 40.51 ms |
| P90 | 350.03 ms | 119.02 ms |
| P95 | 820.51 ms | 494.69 ms |
| Maximum | 1.28 sec | 1.55 sec |
| HTTP Failure | 0% | 0% |

Observed differences:

- Average response time was approximately 30.2% lower.
- Median response time was approximately 22.4% lower.
- P90 response time was approximately 66.0% lower.
- P95 response time was approximately 39.7% lower.
- Throughput was approximately 5.0% higher.
- Maximum response time was higher in the newer test.

### Important Benchmarking Limitation

These two records are useful for observing performance trends, but they are not yet a controlled before-and-after experiment.

The previous and newer runs may differ in duration, application state, database state and other environmental conditions.

Therefore, the observed response-time differences must not be attributed entirely to the N+1 optimization.

A controlled benchmark is still required:

1. Run the old implementation.
2. Run the optimized implementation.
3. Use the same backend topology.
4. Use the same database and dataset.
5. Use the same endpoint and page size.
6. Use the same virtual users and duration.
7. Compare average, P50, P90, P95, maximum and throughput.

This will provide stronger evidence of the actual performance improvement caused by the optimization.

---

# 10. What Did We Achieve?

The scalability and performance phase established several important improvements.

## 10.1 Application Scaling

Implemented the ability to run three Spring Boot backend instances through Docker Compose.

## 10.2 Request Distribution

Configured Nginx upstream load balancing using `least_conn`.

Verified request distribution across all three backend instances through Nginx logs.

## 10.3 Database Optimization

Identified and eliminated the invitation-status N+1 query pattern in the Hospital Admin listing service.

For a page containing six Admins:

```text
Invitation lookup queries:

Before: 6
After:  1
```

## 10.4 Monitoring

Configured Spring Boot Actuator metrics exposure for development and created a PowerShell script to collect HikariCP connection pool metrics.

## 10.5 Load Testing

Created a k6 test script to simulate concurrent traffic against the Hospital Admin listing API.

Collected request throughput, latency percentiles, maximum response time and failure metrics.

---

# 11. Limitations and Future Improvements

The work completed so far provides a foundation for scalable backend architecture.

However, production readiness requires additional work.

## 11.1 Controlled Performance Benchmarking

Perform repeated A/B tests comparing the old and optimized N+1 implementations under identical conditions.

## 11.2 Database Connection Pool Tuning

Study and tune:

- Maximum pool size.
- Minimum idle connections.
- Connection acquisition timeout.
- Connection lifetime.
- Database connection utilization.

The connection pool should be tuned according to total application replicas and PostgreSQL capacity.

## 11.3 Database Scaling

Future work may include:

- Query execution plan analysis.
- Index optimization.
- Slow query monitoring.
- Connection pool capacity planning.
- Read replicas where appropriate.
- Database performance testing.

## 11.4 Nginx Improvements

Future improvements may include:

- Health-aware backend availability.
- Connection timeout configuration.
- Proxy timeout configuration.
- TLS termination.
- Rate limiting.
- Additional request and upstream latency monitoring.

## 11.5 Observability

Further monitoring can include:

- Prometheus.
- Grafana.
- Centralized logs.
- Distributed tracing.
- Application-level latency metrics.
- Database performance dashboards.

## 11.6 Production Security

Actuator metrics should not be publicly accessible without proper protection.

Production configuration must restrict sensitive monitoring endpoints using appropriate security and network controls.

---

# 12. Important Concepts Learned

| Concept | What I learned |
|---|---|
| Horizontal Scaling | Adding more backend instances |
| Vertical Scaling | Increasing resources of an existing server |
| Load Balancing | Distributing requests among backend instances |
| Reverse Proxy | Forwarding client requests to backend services |
| Nginx Upstream | Defining backend server groups |
| Least Connections | Choosing a backend based on active connections |
| Docker Compose Scaling | Running multiple service replicas |
| N+1 Query Problem | Repeated database queries caused by record iteration |
| Batch Query | Fetching related data for multiple records in one query |
| PostgreSQL DISTINCT ON | Retrieving one selected row per distinct key |
| HashMap | Efficient in-memory key-value lookup |
| HikariCP | JDBC database connection pooling |
| Spring Boot Actuator | Application health and metrics monitoring |
| k6 | Simulating concurrent HTTP traffic |
| Throughput | Requests processed per second |
| P95 | Latency within which 95% of requests complete |

---

# 13. Interview Questions and Answers

## Q1. What is horizontal scaling?

Horizontal scaling means increasing application capacity by adding more application instances instead of increasing the resources of a single instance.

In MedCore HMS, I used Docker Compose to run multiple Spring Boot backend instances.

## Q2. Why did you remove container_name from Docker Compose?

A fixed container name prevents multiple replicas of the same service from being created with identical explicit names.

I removed it so Docker Compose could generate unique container names for each backend replica.

## Q3. What is the role of Nginx?

Nginx acts as a reverse proxy and load balancer.

It receives incoming HTTP requests and forwards them to backend application instances.

## Q4. What is the difference between Round Robin and Least Connections?

Round Robin distributes requests sequentially across backend servers.

Least Connections selects the backend with the fewest active connections.

I used Least Connections in my Nginx configuration.

## Q5. How did you verify load balancing?

I sent multiple requests to the health endpoint and inspected Nginx upstream logs.

The logs showed different backend container IP addresses handling requests, confirming that all three instances received traffic.

## Q6. What is the N+1 query problem?

The N+1 query problem occurs when an application executes one query to retrieve a collection and then executes an additional query for every item in that collection.

For six Admins, the application previously executed one page query and six separate invitation lookup queries.

## Q7. How did you solve the N+1 problem?

I collected all Admin IDs from the current page and used a single PostgreSQL batch query with `IN` and `DISTINCT ON`.

I then stored the returned invitation statuses in a HashMap and used the Map while constructing the response.

## Q8. Why did you use DISTINCT ON?

`DISTINCT ON` is a PostgreSQL-specific feature that returns one selected row per distinct key.

I used it to retrieve the latest invitation status for each Admin based on invitation attempt and creation timestamp.

## Q9. Why did you use a HashMap?

The HashMap stores invitation statuses using user IDs as keys.

This avoids repeatedly querying the database while constructing the API response.

## Q10. What is HikariCP?

HikariCP is a JDBC database connection pool.

It maintains reusable database connections so that the application does not need to establish a new database connection for every operation.

## Q11. What is the purpose of k6?

k6 is a load-testing tool used to simulate virtual users and generate HTTP traffic.

I used it to measure API throughput, response times, latency percentiles and request failures.

## Q12. What is the difference between average and P95 latency?

Average latency is the arithmetic mean of all request durations.

P95 represents the latency within which 95% of requests completed.

P95 helps identify slower requests that may not be obvious from the average.

## Q13. Does adding more backend instances always improve performance?

No.

Additional instances can distribute application traffic, but they also increase resource usage and potentially increase database connection demand.

Performance depends on the complete system, including CPU, memory, database capacity, connection pools and network overhead.

## Q14. What is the difference between throughput and latency?

Throughput measures how many requests are processed per unit of time.

Latency measures how long an individual request takes to complete.

A system can have high throughput but still experience high latency.

## Q15. What did your performance testing reveal?

The optimized test recorded approximately 45.06 requests per second, with an average response time of 101.66 ms and P95 of 494.69 ms.

The HTTP failure rate was 0%.

The results are promising, but a controlled before-and-after benchmark is still required to isolate the effect of the N+1 optimization.

---

# 14. Git Changes and Project Tracking

**Working branch:**

```text
feature/scalability-and-performance
```

**Changes included in the pull request:**

```text
backend/docker-compose.yml
backend/nginx/nginx.conf
backend/src/main/java/com/medcore/common/security/config/SecurityConfig.java
backend/src/main/java/com/medcore/features/notification/repository/EmailOutboxRepository.java
backend/src/main/java/com/medcore/features/superadmin/service/impl/SuperAdminServiceImpl.java
backend/src/main/resources/application-dev.yml
performance/monitor-hikari.ps1
```

The empty root-level `docker-compose.yml` and the old Hikari metrics CSV were intentionally excluded from the commit.

**Pull request status:** Created; merge status should be checked separately.

---

# 15. Final Summary

During this phase, I worked on improving the scalability and performance foundation of MedCore HMS.

The key implementation areas were:

1. Docker Compose horizontal scaling.
2. Nginx reverse proxy and load balancing.
3. PostgreSQL batch query optimization.
4. Elimination of the invitation-status N+1 query pattern.
5. HikariCP connection pool monitoring.
6. k6-based API load testing.

The most important database improvement was reducing invitation-status lookup queries from six to one for a page containing six Hospital Admins.

I also successfully verified that Nginx distributed requests across three backend instances.

The next stage will focus on deeper system design concepts, performance analysis, database scaling and production-readiness improvements.

**The goal is not just to make MedCore HMS work, but to understand how to design, measure and improve a system as its traffic and data grow.**
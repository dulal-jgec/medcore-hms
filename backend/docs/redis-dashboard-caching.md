# Redis Caching — Super Admin Dashboard

## 1. Objective
Implement Redis caching for hospital count statistics used by the Super Admin dashboard.

## 2. Implementation
- Enabled Spring Cache with Redis as the cache store.
- Cached hospital count statistics using the cache key `superAdminDashboard::hospitalCounts`.
- Configured a cache TTL of 30 minutes.
- Added cache eviction when relevant hospital data changes.
- Kept Super Admin authorization checks in the dashboard request flow.

## 3. Expected Behaviour
1. On a cache miss, hospital counts are fetched from the database and stored in Redis.
2. On a valid cache hit, cached counts can be reused.
3. Relevant hospital updates should invalidate the cached counts so subsequent requests can refresh the data.
4. The cache entry expires after its configured TTL unless it is removed earlier.

## 4. Preliminary Manual Validation
- Observed the dashboard cache key and serialized hospital count data in Redis.
- Observed the key disappear and later reappear after a dashboard request.
- Observed lower response times on repeated dashboard and hospital-list requests.
- Checked that updated hospital details were returned after a PUT request.

These observations are preliminary. They do not establish a verified percentage improvement or prove that every tested endpoint uses Redis caching.

## 5. Limitations and Next Steps
- Repeatable performance benchmarking has not been completed.
- Cache-hit and cache-miss behaviour should be verified explicitly.
- Cache invalidation should be tested for each relevant hospital mutation.
- Database query counts and comparable response-time measurements can be collected in a controlled test before making performance claims.

## 6. Performance Claims
No percentage reduction or quantified performance improvement is claimed at this stage.

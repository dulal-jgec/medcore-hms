Why I added indexes

While working on MedCore HMS, I noticed that some repository queries are frequently using columns like hospital_id, doctor_id, patient_id, and other foreign-key columns.

For a small database, PostgreSQL can use a Sequential Scan because checking a small number of rows can be cheaper than using an index.

But in a real hospital management system, the number of users, appointments, doctors, patients, and other records will grow.

So I checked the existing indexes first and then added indexes only where the query patterns actually needed them.

I did not add indexes to every column because indexes also take storage and add some overhead to INSERT, UPDATE, and DELETE operations.

B-Tree Index

PostgreSQL uses B-Tree as the default index type for normal indexes.

A B-Tree keeps indexed values in an ordered structure, which makes it useful for:
- Equality searches
- Range queries
- Sorting and ORDER BY

For example:

CREATE INDEX idx_users_hospital_active
ON users(hospital_id)
WHERE deleted_at IS NULL;

Unless another index type is specified, PostgreSQL creates a B-Tree index for this type of index.

How I checked the existing indexes

Before creating new indexes, I checked the indexes already present in the database.

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

This helped me avoid creating duplicate or unnecessary indexes.

I also checked the foreign keys because a foreign key does not automatically mean that PostgreSQL has created an index on that column.

SELECT
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;



EXPLAIN

I used PostgreSQL's EXPLAIN to see the execution plan that PostgreSQL chooses for a query.

For example:

EXPLAIN
SELECT *
FROM users
WHERE hospital_id = 1;

EXPLAIN shows the planned execution steps, such as whether PostgreSQL expects to use a Sequential Scan, Index Scan, or another scan type.

It does not actually run the query.

EXPLAIN ANALYZE

I used EXPLAIN ANALYZE when I wanted to see the actual execution behavior of a query.

For example:

EXPLAIN ANALYZE
SELECT *
FROM users
WHERE hospital_id = 1;

EXPLAIN ANALYZE actually executes the query and shows information such as:
- Actual execution time
- Actual number of rows
- Number of loops
- The execution plan PostgreSQL used

For a small table, PostgreSQL may still choose a Sequential Scan.

That is not automatically a problem.

The PostgreSQL planner compares the cost of different execution plans and chooses what it thinks is cheaper.

As the table becomes larger, an index can become much more useful.

Important things I learned

- An index is not automatically good just because it exists.
- PostgreSQL may still use a Sequential Scan when the table is small.
- A foreign key does not automatically create an index on the referencing column.
- PostgreSQL uses B-Tree as the default index type for normal indexes.
- B-Tree indexes are useful for equality, range queries, and ordering.
- Composite index column order matters.
- The left-prefix rule is important for composite indexes.
- Partial indexes can be useful when only a subset of rows is normally queried.
- EXPLAIN shows the planned execution plan without running the query.
- EXPLAIN ANALYZE runs the query and shows actual execution information.
- Indexes can improve reads but add storage and write overhead.
- Too many indexes can make INSERT, UPDATE, and DELETE operations more expensive.
- Before creating an index, I should check the existing indexes and the actual query pattern.

Migration

The indexes were added through a Flyway migration instead of creating them manually in production.

Migration:
V27__add_query_indexes.sql

This keeps the database schema changes versioned along with the application code.

The migration was applied successfully and verified in flyway_schema_history
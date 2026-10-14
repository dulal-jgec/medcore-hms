# Transaction Isolation in PostgreSQL

## 1. Overview

I learned about transaction isolation levels in PostgreSQL and tested how concurrent transactions behave when they access the same data.

I used two separate Query Tool sessions to understand the difference between `READ COMMITTED` and `REPEATABLE READ`.

## 2. Isolation Levels

| Isolation level | Meaning |
|---|---|
| `READ UNCOMMITTED` | Allows dirty reads in databases that support them. PostgreSQL treats it like `READ COMMITTED`. |
| `READ COMMITTED` | Each query sees data committed before that query starts. |
| `REPEATABLE READ` | Repeated reads within the same transaction return a consistent snapshot. |
| `SERIALIZABLE` | Provides the strongest isolation by preventing non-serializable transaction outcomes; transactions may need to be retried. |

## 3. Problems Related to Isolation

| Problem | Meaning |
|---|---|
| Dirty Read | Reading another transaction's uncommitted changes. |
| Non-repeatable Read | Reading the same row twice and getting different values within one transaction. |
| Phantom Read | Repeating a query and finding additional or missing rows because another transaction changed matching data. |

## 4. Practical SQL Lab

I created a test table named `transaction_lab`:

```sql
CREATE TABLE IF NOT EXISTS transaction_lab (
    id INT PRIMARY KEY,
    bed_count INT
);

INSERT INTO transaction_lab (id, bed_count)
VALUES (1, 10)
ON CONFLICT (id)
DO UPDATE SET bed_count = 10;
```

### Experiment 1: Dirty Read

I studied how PostgreSQL handles uncommitted changes using two sessions.

**Result:** PostgreSQL treats `READ UNCOMMITTED` as `READ COMMITTED`, so dirty reads are prevented.

### Experiment 2: Non-repeatable Read

I tested the behavior using two sessions.

- Session A started a `READ COMMITTED` transaction and read `bed_count = 10`.
- Session B changed the value to `8` and committed.
- Session A read the same row again and got `8`.

**Result:** The value changed between the two reads in `READ COMMITTED`.

### Experiment 3: Repeatable Read

I repeated the experiment using `REPEATABLE READ` in Session A.

- Session A read `bed_count = 10`.
- Session B changed the value to `8` and committed.
- Session A read the same row again.

**Expected result:** Session A continues to see `10` within its transaction snapshot.

## 5. What I Learned

- How PostgreSQL transaction isolation works.
- Why concurrent transactions can observe different database states.
- How `READ COMMITTED` and `REPEATABLE READ` behave differently.
- How to test isolation behavior using two database sessions.

## 6. Conclusion

Transaction isolation controls how concurrent transactions see changes made by each other. Choosing an appropriate isolation level helps maintain correct behavior when multiple requests access or modify the same data.


CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE doctor_schedules
ADD CONSTRAINT doctor_schedule_no_overlap
EXCLUDE USING GIST (
    doctor_id WITH =,
    day_of_week WITH =,
    tsrange(
        TIMESTAMP '2000-01-01' + start_time,
        TIMESTAMP '2000-01-01' + end_time,
        '[)'
    ) WITH &&
)
WHERE (deleted_at IS NULL);
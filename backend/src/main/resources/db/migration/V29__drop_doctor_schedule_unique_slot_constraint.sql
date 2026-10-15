-- Drop the unique constraint on doctor_schedules
-- so doctors can delete and re-create the same slot.

DO $$
DECLARE
    cname text;
BEGIN
    FOR cname IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'doctor_schedules'::regclass
          AND contype = 'u'
    LOOP
        EXECUTE format(
            'ALTER TABLE doctor_schedules DROP CONSTRAINT %I',
            cname
        );
        RAISE NOTICE 'Dropped constraint: %', cname;
    END LOOP;
END $$;
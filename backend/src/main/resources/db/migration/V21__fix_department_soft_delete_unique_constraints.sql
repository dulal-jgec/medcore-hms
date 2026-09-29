DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'departments'::regclass
          AND contype = 'u'
          AND pg_get_constraintdef(oid) IN (
              'UNIQUE (hospital_id, code)',
              'UNIQUE (hospital_id, name)'
          )
    LOOP
        EXECUTE format(
            'ALTER TABLE departments DROP CONSTRAINT %I',
            constraint_record.conname
        );
    END LOOP;
END $$;

CREATE UNIQUE INDEX department_hospital_code_active_unique
ON departments (hospital_id, code)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX department_hospital_name_active_unique
ON departments (hospital_id, name)
WHERE deleted_at IS NULL;
DO $$
DECLARE
    constraint_name TEXT;
BEGIN

    SELECT conname
    INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) = 'UNIQUE (email)';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format(
            'ALTER TABLE users DROP CONSTRAINT %I',
            constraint_name
        );
    END IF;

    SELECT conname
    INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) = 'UNIQUE (phone)';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format(
            'ALTER TABLE users DROP CONSTRAINT %I',
            constraint_name
        );
    END IF;

END $$;

CREATE UNIQUE INDEX uq_users_email_active
ON users(email)
WHERE status <> 'INVITATION_EXPIRED';

CREATE UNIQUE INDEX uq_users_phone_active
ON users(phone)
WHERE status <> 'INVITATION_EXPIRED';
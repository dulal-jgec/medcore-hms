CREATE UNIQUE INDEX ux_hospital_email_active
ON hospitals (email)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_hospital_license_active
ON hospitals (license_number)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ux_hospital_phone_active
ON hospitals (phone)
WHERE deleted_at IS NULL;
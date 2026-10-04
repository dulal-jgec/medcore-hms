CREATE INDEX idx_accountants_hospital_active
ON accountants(hospital_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_patient_active
ON appointments(patient_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_doctors_hospital_status_active
ON doctors(hospital_id, status)
WHERE deleted_at IS NULL;

CREATE INDEX idx_hospitals_status_active
ON hospitals(status)
WHERE deleted_at IS NULL;

CREATE INDEX idx_refresh_tokens_user_id
ON refresh_tokens(user_id);

CREATE INDEX idx_users_hospital_active
ON users(hospital_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_users_role_active
ON users(role_id)
WHERE deleted_at IS NULL;
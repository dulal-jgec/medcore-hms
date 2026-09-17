ALTER TABLE patients
    ADD COLUMN emergency_contact_relation VARCHAR(100);

CREATE TABLE patient_allergies (
    patient_id BIGINT NOT NULL,
    allergy VARCHAR(255) NOT NULL,

    CONSTRAINT fk_patient_allergies_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
);

CREATE TABLE patient_chronic_conditions (
    patient_id BIGINT NOT NULL,
    condition_name VARCHAR(255) NOT NULL,

    CONSTRAINT fk_patient_chronic_conditions_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
);
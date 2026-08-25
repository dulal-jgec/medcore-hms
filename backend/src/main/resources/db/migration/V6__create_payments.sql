CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,

    hospital_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    bill_id BIGINT NOT NULL,

    gateway_order_id VARCHAR(100) UNIQUE,
    gateway_payment_id VARCHAR(100) UNIQUE,

    amount NUMERIC(12, 2) NOT NULL,

    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',

    payment_method VARCHAR(30),

    paid_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_payment_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id),

    CONSTRAINT fk_payment_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id),

    CONSTRAINT fk_payment_bill
        FOREIGN KEY (bill_id)
        REFERENCES bills(id)
);

CREATE INDEX idx_payment_hospital
    ON payments(hospital_id);

CREATE INDEX idx_payment_order
    ON payments(gateway_order_id);

CREATE INDEX idx_payment_gateway_payment
    ON payments(gateway_payment_id);
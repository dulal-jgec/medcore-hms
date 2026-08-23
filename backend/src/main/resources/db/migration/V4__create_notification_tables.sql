 
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,

    recipient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,

    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,

    read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,

    deleted_at TIMESTAMP,

    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id),

    CONSTRAINT fk_notifications_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
);


 
CREATE TABLE notification_deliveries (
    id BIGSERIAL PRIMARY KEY,

    notification_id BIGINT NOT NULL,

    channel VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    recipient_address VARCHAR(255),
    error_message VARCHAR(1000),

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,

    deleted_at TIMESTAMP,

    CONSTRAINT fk_notification_deliveries_notification
        FOREIGN KEY (notification_id)
        REFERENCES notifications(id)
);


 
CREATE INDEX idx_notifications_hospital_active
ON notifications (hospital_id)
WHERE deleted_at IS NULL;


CREATE INDEX idx_notifications_recipient_active
ON notifications (recipient_id)
WHERE deleted_at IS NULL;


CREATE INDEX idx_notifications_hospital_recipient_active
ON notifications (hospital_id, recipient_id)
WHERE deleted_at IS NULL;


CREATE INDEX idx_notification_deliveries_notification_active
ON notification_deliveries (notification_id)
WHERE deleted_at IS NULL;
ALTER TABLE email_outbox
    ADD COLUMN type VARCHAR(50) NOT NULL
    DEFAULT 'HOSPITAL_ADMIN_CREDENTIALS';

ALTER TABLE email_outbox
    ADD COLUMN user_id BIGINT;

ALTER TABLE email_outbox
    ADD CONSTRAINT fk_email_outbox_user
    FOREIGN KEY (user_id)
    REFERENCES users(id);

CREATE INDEX idx_email_outbox_user
    ON email_outbox(user_id);
ALTER TABLE email_outbox
ADD COLUMN invitation_attempt INTEGER NOT NULL DEFAULT 1;

CREATE INDEX idx_email_outbox_user_type_attempt
ON email_outbox(user_id, type, invitation_attempt);
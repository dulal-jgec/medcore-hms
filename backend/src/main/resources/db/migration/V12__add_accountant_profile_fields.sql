ALTER TABLE accountants
    ADD COLUMN bio TEXT;

ALTER TABLE accountants
    ADD COLUMN languages VARCHAR(500);

ALTER TABLE accountants
    ADD COLUMN emergency_contact VARCHAR(15);

ALTER TABLE accountants
    ADD COLUMN profile_image_url VARCHAR(500);
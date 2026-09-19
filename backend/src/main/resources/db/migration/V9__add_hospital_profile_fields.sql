ALTER TABLE hospitals
    ADD COLUMN state VARCHAR(100),
    ADD COLUMN address VARCHAR(255),
    ADD COLUMN pincode VARCHAR(10),
    ADD COLUMN emergency_phone VARCHAR(15),
    ADD COLUMN description TEXT;
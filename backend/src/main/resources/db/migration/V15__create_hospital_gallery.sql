CREATE TABLE hospital_gallery (
    id BIGSERIAL PRIMARY KEY,

    hospital_id BIGINT NOT NULL,

    title VARCHAR(150) NOT NULL,

    category VARCHAR(50) NOT NULL,

    description VARCHAR(1000),

    image_url VARCHAR(500) NOT NULL,

    display_order INTEGER NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP,

    deleted_at TIMESTAMP,

    CONSTRAINT fk_hospital_gallery_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
);

CREATE INDEX idx_hospital_gallery_hospital_id
    ON hospital_gallery(hospital_id);
-- V19
-- Complete optimistic locking column for hospital_gallery

ALTER TABLE hospital_gallery
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
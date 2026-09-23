package com.medcore.features.hospital.gallery.repository;

import com.medcore.features.hospital.gallery.entity.GalleryCategory;
import com.medcore.features.hospital.gallery.entity.GalleryStatus;
import com.medcore.features.hospital.gallery.entity.HospitalGallery;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicHospitalGalleryRepository
        extends JpaRepository<HospitalGallery, Long> {

    @EntityGraph(attributePaths = {"hospital"})
    Page<HospitalGallery> findByHospitalIdAndStatusAndDeletedAtIsNull(
            Long hospitalId,
            GalleryStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"hospital"})
    Page<HospitalGallery>
    findByHospitalIdAndCategoryAndStatusAndDeletedAtIsNull(
            Long hospitalId,
            GalleryCategory category,
            GalleryStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"hospital"})
    Optional<HospitalGallery>
    findByIdAndHospitalIdAndStatusAndDeletedAtIsNull(
            Long galleryId,
            Long hospitalId,
            GalleryStatus status
    );
}
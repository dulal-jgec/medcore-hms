package com.medcore.features.hospital.gallery.repository;

import com.medcore.features.hospital.gallery.entity.HospitalGallery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalGalleryRepository
        extends JpaRepository<HospitalGallery, Long> {

    Page<HospitalGallery> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    Optional<HospitalGallery> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long id,
            Long hospitalId
    );

    Page<HospitalGallery> findByHospitalIdAndCategoryAndDeletedAtIsNull(
            Long hospitalId,
            String category,
            Pageable pageable
    );
}
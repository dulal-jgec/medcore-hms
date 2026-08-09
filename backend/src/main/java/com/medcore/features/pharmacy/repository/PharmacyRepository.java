package com.medcore.features.pharmacy.repository;

import com.medcore.features.pharmacy.entity.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PharmacyRepository
        extends JpaRepository<Pharmacy, Long> {

    Optional<Pharmacy> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId
    );

    Optional<Pharmacy> findByIdAndDeletedAtIsNull(
            Long id
    );

    boolean existsByHospitalIdAndDeletedAtIsNull(
            Long hospitalId
    );
    
    
}
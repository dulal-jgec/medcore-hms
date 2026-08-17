package com.medcore.features.patient.repository;

import com.medcore.features.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository
        extends JpaRepository<Patient, Long> {

    boolean existsByUserId(Long userId);

    Optional<Patient> findByUserId(Long userId);

    Optional<Patient> findByIdAndDeletedAtIsNull(
            Long patientId
    );

    Page<Patient> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    Page<Patient>
    findByHospitalIdAndUserFullNameContainingIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String keyword,
            Pageable pageable
    );

    Optional<Patient>
    findByIdAndHospitalIdAndDeletedAtIsNull(
            Long patientId,
            Long hospitalId
    );

    Optional<Patient>
    findByIdAndHospitalId(
            Long patientId,
            Long hospitalId
    );
}
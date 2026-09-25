package com.medcore.features.patient.repository;

import com.medcore.features.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    boolean existsByUserId(Long userId);

    Optional<Patient> findByUserIdAndDeletedAtIsNull(Long userId);

    Optional<Patient> findByIdAndDeletedAtIsNull(Long patientId);

}
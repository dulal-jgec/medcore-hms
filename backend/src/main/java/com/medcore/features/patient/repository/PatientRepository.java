package com.medcore.features.patient.repository;

import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByUserId(Long userId);

    Page<Patient> findByDeletedAtIsNull(Pageable pageable);

    Page<Patient> findByUserFullNameContainingIgnoreCaseAndDeletedAtIsNull(
            String keyword,
            Pageable pageable
    );
    Optional<Patient> findByUserId(Long userId);
    
    Page<Patient> findByHospitalIdAndUserFullNameContainingIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String keyword,
            Pageable pageable
    );
    
    Page<Appointment> findByPatientIdAndHospitalIdAndDeletedAtIsNull(
            Long patientId,
            Long hospitalId,
            Pageable pageable
    );
    
    Optional<Patient> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long patientId,
            Long hospitalId
    );
}
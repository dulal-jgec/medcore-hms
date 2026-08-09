package com.medcore.features.prescription.repository;

import com.medcore.features.prescription.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByIdAndDeletedAtIsNull(Long id);

    Optional<Prescription> findByAppointmentIdAndDeletedAtIsNull(
            Long appointmentId
    );

    boolean existsByAppointmentIdAndDeletedAtIsNull(
            Long appointmentId
    );
    
 
}
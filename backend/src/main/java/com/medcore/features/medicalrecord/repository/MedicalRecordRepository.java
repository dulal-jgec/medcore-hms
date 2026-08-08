package com.medcore.features.medicalrecord.repository;

import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicalRecordRepository
        extends JpaRepository<MedicalRecord, Long> {

    Optional<MedicalRecord> findByIdAndDeletedAtIsNull(
            Long id
    );

    Optional<MedicalRecord> findByAppointmentIdAndDeletedAtIsNull(
            Long appointmentId
    );

    boolean existsByAppointmentIdAndDeletedAtIsNull(
            Long appointmentId
    );

    Optional<MedicalRecord> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long recordId,
            Long hospitalId
    );

    Optional<MedicalRecord> findByIdAndPatientIdAndDeletedAtIsNull(
            Long recordId,
            Long patientId
    );

    Optional<MedicalRecord> findByIdAndDoctorIdAndDeletedAtIsNull(
            Long recordId,
            Long doctorId
    );
    
    Optional<Doctor> findByUserId(Long userId);
}
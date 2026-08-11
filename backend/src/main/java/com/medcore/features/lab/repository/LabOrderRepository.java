package com.medcore.features.lab.repository;

import com.medcore.features.lab.entity.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabOrderRepository
        extends JpaRepository<LabOrder, Long> {

    Optional<LabOrder> findByIdAndDeletedAtIsNull(
            Long id
    );

    List<LabOrder> findByPatientIdAndDeletedAtIsNull(
            Long patientId
    );

    List<LabOrder> findByDoctorIdAndDeletedAtIsNull(
            Long doctorId
    );

    List<LabOrder> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId
    );

    boolean existsByAppointmentIdAndDeletedAtIsNull(
            Long appointmentId
    );
}
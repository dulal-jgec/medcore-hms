package com.medcore.features.appointment.repository;

import com.medcore.features.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByDoctorIdAndAppointmentDateAndStartTimeLessThanAndEndTimeGreaterThanAndDeletedAtIsNull(
            Long doctorId,
            LocalDate appointmentDate,
            LocalTime endTime,
            LocalTime startTime
    );
    
    Page<Appointment> findByDeletedAtIsNull(Pageable pageable);

    Page<Appointment> findByDoctorIdAndDeletedAtIsNull(
            Long doctorId,
            Pageable pageable
    );

    Page<Appointment> findByPatientIdAndDeletedAtIsNull(
            Long patientId,
            Pageable pageable
    );
    
    Page<Appointment> findByHospitalIdAndAppointmentDateAndDeletedAtIsNull(
            Long hospitalId,
            LocalDate appointmentDate,
            Pageable pageable
    );
}
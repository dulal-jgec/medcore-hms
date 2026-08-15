package com.medcore.features.appointment.repository;

import com.medcore.features.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByIdAndDeletedAtIsNull(Long id);

    @Query("""
    	    SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END
    	    FROM Appointment a
    	    WHERE a.doctor.id = :doctorId
    	      AND a.appointmentDate = :appointmentDate
    	      AND a.deletedAt IS NULL
    	      AND a.status NOT IN (
    	          com.medcore.features.appointment.enums.AppointmentStatus.CANCELLED,
    	          com.medcore.features.appointment.enums.AppointmentStatus.NO_SHOW
    	      )
    	      AND a.startTime < :endTime
    	      AND a.endTime > :startTime
    	""")
    	boolean existsOverlappingAppointment(
    	        @Param("doctorId") Long doctorId,
    	        @Param("appointmentDate") LocalDate appointmentDate,
    	        @Param("startTime") LocalTime startTime,
    	        @Param("endTime") LocalTime endTime
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
    
    Optional<Appointment> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long appointmentId,
            Long hospitalId
    );

    Page<Appointment> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    Page<Appointment> findByDoctorIdAndHospitalIdAndDeletedAtIsNull(
            Long doctorId,
            Long hospitalId,
            Pageable pageable
    );

    Page<Appointment> findByPatientIdAndHospitalIdAndDeletedAtIsNull(
            Long patientId,
            Long hospitalId,
            Pageable pageable
    );

    Optional<Appointment> findByIdAndHospitalId(
            Long appointmentId,
            Long hospitalId
    );
    
}
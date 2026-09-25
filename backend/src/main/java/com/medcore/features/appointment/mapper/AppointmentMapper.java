package com.medcore.features.appointment.mapper;

import com.medcore.features.appointment.dto.request.CreateAppointmentRequest;
import com.medcore.features.appointment.dto.response.AppointmentResponse;
import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.enums.AppointmentStatus;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.entity.Patient;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class AppointmentMapper {

    public Appointment toEntity(
            CreateAppointmentRequest request,
            Hospital hospital,
            Doctor doctor,
            Patient patient) {

        LocalTime startTime =
                request.getStartTime();

        LocalTime endTime =
                startTime.plusMinutes(
                        doctor.getConsultationDurationMinutes()
                );

        return Appointment.builder()
                .hospital(hospital)
                .doctor(doctor)
                .patient(patient)
                .appointmentDate(request.getAppointmentDate())
                .startTime(startTime)
                .endTime(endTime)
                .reason(
                        request.getReason() != null
                                ? request.getReason().trim()
                                : null
                )
                .status(AppointmentStatus.SCHEDULED)
                .build();
    }

    public AppointmentResponse toResponse(
            Appointment appointment) {

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .hospitalId(
                        appointment.getHospital().getId()
                )
                .hospitalName(
                        appointment.getHospital().getName()
                )
                .doctorId(
                        appointment.getDoctor().getId()
                )
                .doctorName(
                        appointment.getDoctor()
                                .getUser()
                                .getFullName()
                )
                .patientId(
                        appointment.getPatient().getId()
                )
                .patientName(
                        appointment.getPatient()
                                .getUser()
                                .getFullName()
                )
                .appointmentDate(
                        appointment.getAppointmentDate()
                )
                .startTime(
                        appointment.getStartTime()
                )
                .endTime(
                        appointment.getEndTime()
                )
                .status(
                        appointment.getStatus()
                )
                .reason(
                        appointment.getReason()
                )
                .createdAt(
                        appointment.getCreatedAt()
                )
                .build();
    }
}
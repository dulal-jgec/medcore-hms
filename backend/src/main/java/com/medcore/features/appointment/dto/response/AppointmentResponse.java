package com.medcore.features.appointment.dto.response;

import com.medcore.features.appointment.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class AppointmentResponse {

    private Long id;

    private Long hospitalId;
    private String hospitalName;

    private Long doctorId;
    private String doctorName;

    private Long patientId;
    private String patientName;

    private LocalDate appointmentDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private AppointmentStatus status;

    private String reason;

    private LocalDateTime createdAt;
}
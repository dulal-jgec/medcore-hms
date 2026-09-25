package com.medcore.features.appointment.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateAppointmentRequest {

    /*
     * PATIENT:
     *     hospitalId comes from selected hospital.
     *
     * RECEPTIONIST:
     *     hospitalId is derived from current tenant.
     */
    private Long hospitalId;

    @NotNull(message = "Doctor id is required")
    private Long doctorId;

    /*
     * PATIENT:
     *     patientId is derived from logged-in patient.
     *
     * RECEPTIONIST:
     *     patientId comes from selected patient.
     */
    private Long patientId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(
            message = "Appointment date cannot be in the past"
    )
    private LocalDate appointmentDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    

    @Size(
            max = 500,
            message = "Reason cannot exceed 500 characters"
    )
    private String reason;
}
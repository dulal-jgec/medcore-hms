package com.medcore.features.appointment.dto.request;

import com.medcore.features.appointment.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAppointmentStatusRequest {

    @NotNull(message = "Appointment status is required")
    private AppointmentStatus status;
}
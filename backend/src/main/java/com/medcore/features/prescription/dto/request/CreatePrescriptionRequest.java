package com.medcore.features.prescription.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePrescriptionRequest {

    @NotNull
    private Long appointmentId;
}
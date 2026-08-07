package com.medcore.features.patient.dto.request;

import com.medcore.features.patient.enums.PatientStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePatientStatusRequest {

    @NotNull(message = "Patient status is required")
    private PatientStatus status;

}
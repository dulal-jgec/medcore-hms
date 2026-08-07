package com.medcore.features.doctor.dto.request;

import com.medcore.features.doctor.enums.DoctorStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDoctorStatusRequest {

    @NotNull(message = "Doctor status is required")
    private DoctorStatus status;

}
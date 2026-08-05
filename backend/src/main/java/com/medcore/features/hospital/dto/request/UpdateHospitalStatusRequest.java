package com.medcore.features.hospital.dto.request;

import com.medcore.features.hospital.enums.HospitalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateHospitalStatusRequest {

    @NotNull(message = "Hospital status is required")
    private HospitalStatus status;

}
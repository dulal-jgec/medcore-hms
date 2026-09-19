package com.medcore.features.hospital.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateHospitalProfileRequest {

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 10, message = "Pincode must not exceed 10 characters")
    private String pincode;

    @Size(max = 15, message = "Emergency phone must not exceed 15 characters")
    private String emergencyPhone;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
}
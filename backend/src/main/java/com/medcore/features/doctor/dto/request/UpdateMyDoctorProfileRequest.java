package com.medcore.features.doctor.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateMyDoctorProfileRequest {

    @DecimalMin(
            value = "0.0",
            message = "Consultation fee cannot be negative"
    )
 
    @Size(
            max = 1000,
            message = "Bio must not exceed 1000 characters"
    )
    private String bio;

    @Size(
            max = 500,
            message = "Languages must not exceed 500 characters"
    )
    private String languages;
}
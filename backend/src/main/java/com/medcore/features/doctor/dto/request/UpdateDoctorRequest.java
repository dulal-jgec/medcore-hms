package com.medcore.features.doctor.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateDoctorRequest {

    @NotBlank(message = "Specialization is required")
    @Size(max = 100)
    private String specialization;

    @NotNull(message = "Experience is required")
    @Min(0)
    @Max(60)
    private Integer experienceYears;

    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0")
    private BigDecimal consultationFee;
    
    @NotNull(message = "Consultation duration is required")
    @Min(value = 5, message = "Consultation duration must be at least 5 minutes")
    private Integer consultationDurationMinutes;

    @NotBlank(message = "Qualification is required")
    @Size(max = 255)
    private String qualification;
}
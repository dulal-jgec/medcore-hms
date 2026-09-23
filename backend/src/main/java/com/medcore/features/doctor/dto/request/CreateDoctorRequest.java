package com.medcore.features.doctor.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateDoctorRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian phone number"
    )
    private String phone;

    @NotNull(message = "Department id is required")
    private Long departmentId;

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
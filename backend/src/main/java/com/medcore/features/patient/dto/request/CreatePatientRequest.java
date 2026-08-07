package com.medcore.features.patient.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import com.medcore.features.patient.enums.BloodGroup;
import java.time.LocalDate;

@Getter
@Setter
public class CreatePatientRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Hospital id is required")
    private Long hospitalId;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotNull(message = "Blood group is required")
    private BloodGroup bloodGroup;

    @NotBlank(message = "Emergency contact name is required")
    private String emergencyContactName;

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian phone number"
    )
    private String emergencyContactPhone;
}
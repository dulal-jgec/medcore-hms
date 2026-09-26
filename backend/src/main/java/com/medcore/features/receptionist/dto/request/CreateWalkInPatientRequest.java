package com.medcore.features.receptionist.dto.request;

import com.medcore.features.patient.enums.BloodGroup;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateWalkInPatientRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;

    private LocalDate dateOfBirth;

    private String gender;

    private BloodGroup bloodGroup;

    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
}
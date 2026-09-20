package com.medcore.features.accountant.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMyAccountantProfileRequest {

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    @Size(max = 500, message = "Languages must not exceed 500 characters")
    private String languages;

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid emergency contact number"
    )
    private String emergencyContact;
}
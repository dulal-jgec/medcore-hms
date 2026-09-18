package com.medcore.features.superadmin.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateHospitalAdminRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 100,
            message = "Full name must be between 3 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian phone number"
    )
    private String phone;

    @NotNull(message = "Hospital is required")
    private Long hospitalId;
}
package com.medcore.features.hospital.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateHospitalRequest {

    @NotBlank(message = "Hospital name is required")
    @Size(min = 3, max = 150)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian phone number"
    )
    private String phone;

    @NotBlank(message = "License number is required")
    @Size(min = 5, max = 50)
    private String licenseNumber;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @Size(max = 500)
    private String logo;
}
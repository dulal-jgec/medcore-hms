package com.medcore.features.hospital.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateHospitalRequest {

    @NotBlank(message = "Hospital name is required")
    @Size(min = 3, max = 150,
            message = "Hospital name must be between 3 and 150 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    @Size(max = 100,
            message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian phone number"
    )
    private String phone;

    @NotBlank(message = "License number is required")
    @Size(min = 5, max = 50,
            message = "License number must be between 5 and 50 characters")
    private String licenseNumber;

    @NotBlank(message = "City is required")
    @Size(max = 100,
            message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 500,
            message = "Logo URL must not exceed 500 characters")
    private String logo;

}
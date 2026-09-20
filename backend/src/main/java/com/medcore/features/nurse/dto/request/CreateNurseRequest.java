package com.medcore.features.nurse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateNurseRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @jakarta.validation.constraints.Email(
            message = "Invalid email address"
    )
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Phone is required")
    @jakarta.validation.constraints.Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian phone number"
    )
    private String phone;

    @NotBlank(message = "Department is required")
    @Size(max = 100)
    private String department;

    @Size(max = 100)
    private String ward;

    @Size(max = 100)
    private String designation;

    @Size(max = 100)
    private String qualification;

    @Size(max = 50)
    private String licenseNumber;
}
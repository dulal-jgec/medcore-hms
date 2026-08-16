package com.medcore.features.nurse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateNurseRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "User ID is required")
    private Long userId;

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
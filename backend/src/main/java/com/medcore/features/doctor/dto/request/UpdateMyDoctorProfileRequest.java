package com.medcore.features.doctor.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMyDoctorProfileRequest {

    @Size(
            max = 1000,
            message = "Bio must not exceed 1000 characters"
    )
    private String bio;

    @Size(
            max = 500,
            message = "Languages must not exceed 500 characters"
    )
    private String languages;
}
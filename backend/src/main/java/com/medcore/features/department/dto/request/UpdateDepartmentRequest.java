package com.medcore.features.department.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Department code is required")
    @Size(min = 2, max = 20)
    private String code;

    @Size(max = 500)
    private String description;

}
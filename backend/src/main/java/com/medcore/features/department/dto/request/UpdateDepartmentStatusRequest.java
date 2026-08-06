package com.medcore.features.department.dto.request;

import com.medcore.features.department.enums.DepartmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDepartmentStatusRequest {

    @NotNull(message = "Department status is required")
    private DepartmentStatus status;

}
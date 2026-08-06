package com.medcore.features.department.dto.response;

import com.medcore.features.department.enums.DepartmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class DepartmentResponse {

    private Long id;

    private String name;

    private String code;

    private String description;

    private Long hospitalId;

    private String hospitalName;

    private DepartmentStatus status;

    private LocalDateTime createdAt;
}
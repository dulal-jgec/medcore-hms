package com.medcore.features.department.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PublicDepartmentResponse {

    private Long id;

    private String name;

    private String code;

    private String description;

    private String imageUrl;

    private Long hospitalId;

    private String hospitalName;

    private LocalDateTime createdAt;
}
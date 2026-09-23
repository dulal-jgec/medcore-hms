package com.medcore.features.department.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.department.dto.response.PublicDepartmentResponse;

import org.springframework.data.domain.Page;

public interface PublicDepartmentService {

    ApiResponse<Page<PublicDepartmentResponse>> getDepartments(
            Long hospitalId,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<PublicDepartmentResponse> getDepartment(
            Long hospitalId,
            Long departmentId
    );
}
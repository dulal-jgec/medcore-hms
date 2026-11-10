package com.medcore.features.department.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.RestPage;
import com.medcore.features.department.dto.response.PublicDepartmentResponse;

public interface PublicDepartmentService {

    ApiResponse<RestPage<PublicDepartmentResponse>> getDepartments(
            Long hospitalId, int page, int size, String sortBy, String sortDir);

    ApiResponse<PublicDepartmentResponse> getDepartment(
            Long hospitalId, Long departmentId);
}
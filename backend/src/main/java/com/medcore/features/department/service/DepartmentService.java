package com.medcore.features.department.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.department.dto.request.CreateDepartmentRequest;
import com.medcore.features.department.dto.request.UpdateDepartmentRequest;
import com.medcore.features.department.dto.request.UpdateDepartmentStatusRequest;
import com.medcore.features.department.dto.response.DepartmentResponse;

public interface DepartmentService {

    ApiResponse<DepartmentResponse> createDepartment(CreateDepartmentRequest request);
    	
    ApiResponse<PageResponse<DepartmentResponse>> getAllDepartments(
            int page,
            int size,
            String sortBy,
            String sortDir
    );
    
    ApiResponse<DepartmentResponse> getDepartmentById(Long departmentId);
    
    ApiResponse<DepartmentResponse> updateDepartment(
            Long departmentId,
            UpdateDepartmentRequest request
    );
    
    ApiResponse<DepartmentResponse> updateDepartmentStatus(
            Long departmentId,
            UpdateDepartmentStatusRequest request
    );
    
    ApiResponse<PageResponse<DepartmentResponse>> searchDepartments(
            String keyword,
            int page,
            int size
    );
    
    ApiResponse<String> deleteDepartment(Long departmentId);

    ApiResponse<String> restoreDepartment(Long departmentId);
}
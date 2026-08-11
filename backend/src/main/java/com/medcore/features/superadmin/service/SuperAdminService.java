package com.medcore.features.superadmin.service;

import org.springframework.data.domain.Page;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalStatusRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import com.medcore.features.superadmin.dto.response.SuperAdminDashboardResponse;
import com.medcore.features.superadmin.dto.response.SuperAdminResponse;


public interface SuperAdminService {

    ApiResponse<SuperAdminResponse> getCurrentSuperAdmin();

    ApiResponse<CreateHospitalResponse> createHospital(
            CreateHospitalRequest request
    );

    ApiResponse<org.springframework.data.domain.Page<CreateHospitalResponse>>
    getAllHospitals(
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<CreateHospitalResponse> getHospitalById(
            Long hospitalId
    );
    
    ApiResponse<CreateHospitalResponse> updateHospital(
            Long hospitalId,
            UpdateHospitalRequest request
    );

    ApiResponse<CreateHospitalResponse> updateHospitalStatus(
            Long hospitalId,
            UpdateHospitalStatusRequest request
    );

    ApiResponse<Page<CreateHospitalResponse>> searchHospitals(
            String keyword,
            int page,
            int size
    );
    
    ApiResponse<String> deleteHospital(Long hospitalId);

    ApiResponse<String> restoreHospital(Long hospitalId);
    
    ApiResponse<SuperAdminDashboardResponse>
    getDashboard();
}
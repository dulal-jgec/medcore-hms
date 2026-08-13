package com.medcore.features.hospital.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalStatusRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import org.springframework.data.domain.Page;

public interface HospitalService {

    ApiResponse<CreateHospitalResponse> createHospital(CreateHospitalRequest request);

    ApiResponse<Page<CreateHospitalResponse>> getAllHospitals(
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<CreateHospitalResponse> getHospitalById(Long hospitalId);
    	
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
}
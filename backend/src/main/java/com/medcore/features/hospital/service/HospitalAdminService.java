package com.medcore.features.hospital.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.request.UpdateHospitalProfileRequest;
import com.medcore.features.hospital.dto.response.HospitalProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface HospitalAdminService {

    ApiResponse<HospitalProfileResponse> getMyHospitalProfile();

    ApiResponse<HospitalProfileResponse> updateMyHospitalProfile(
            UpdateHospitalProfileRequest request
    );
    
    ApiResponse<HospitalProfileResponse> uploadLogo(
            MultipartFile file
    );
    
    ApiResponse<HospitalProfileResponse> uploadBanner(
            MultipartFile file
    );
}
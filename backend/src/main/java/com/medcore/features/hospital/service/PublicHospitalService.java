package com.medcore.features.hospital.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.response.PublicHospitalResponse;

import org.springframework.data.domain.Page;

public interface PublicHospitalService {

    ApiResponse<Page<PublicHospitalResponse>> getHospitals(
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<PublicHospitalResponse> getHospital(
            Long hospitalId
    );
}
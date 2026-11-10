package com.medcore.features.hospital.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.RestPage;
import com.medcore.features.hospital.dto.response.PublicHospitalResponse;

public interface PublicHospitalService {

    ApiResponse<RestPage<PublicHospitalResponse>> getHospitals(
            int page,
            int size,
            String sortBy,
            String sortDir);

    ApiResponse<PublicHospitalResponse> getHospital(Long hospitalId);
}
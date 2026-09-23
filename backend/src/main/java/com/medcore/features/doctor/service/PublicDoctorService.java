package com.medcore.features.doctor.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.doctor.dto.response.PublicDoctorResponse;

import org.springframework.data.domain.Page;

public interface PublicDoctorService {

    ApiResponse<Page<PublicDoctorResponse>> getDoctors(
            Long hospitalId,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<PublicDoctorResponse> getDoctor(
            Long hospitalId,
            Long doctorId
    );
}
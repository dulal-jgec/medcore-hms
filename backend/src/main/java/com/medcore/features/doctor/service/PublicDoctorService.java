package com.medcore.features.doctor.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.RestPage;
import com.medcore.features.doctor.dto.response.PublicDoctorResponse;

public interface PublicDoctorService {

    ApiResponse<RestPage<PublicDoctorResponse>> getDoctors(Long hospitalId, int page, int size, String sortBy, String sortDir);

    ApiResponse<PublicDoctorResponse> getDoctor(Long hospitalId, Long doctorId);
}
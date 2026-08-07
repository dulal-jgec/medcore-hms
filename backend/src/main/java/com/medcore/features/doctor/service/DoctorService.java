package com.medcore.features.doctor.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.doctor.dto.request.CreateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorStatusRequest;
import com.medcore.features.doctor.dto.response.DoctorResponse;

public interface DoctorService {

    ApiResponse<DoctorResponse> createDoctor(CreateDoctorRequest request);
    
    ApiResponse<PageResponse<DoctorResponse>> getAllDoctors(
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<DoctorResponse> getDoctorById(Long doctorId);
    
    ApiResponse<DoctorResponse> updateDoctor(
            Long doctorId,
            UpdateDoctorRequest request
    );

    ApiResponse<DoctorResponse> updateDoctorStatus(
            Long doctorId,
            UpdateDoctorStatusRequest request
    );

    ApiResponse<String> deleteDoctor(Long doctorId);

    ApiResponse<String> restoreDoctor(Long doctorId);

    ApiResponse<PageResponse<DoctorResponse>> searchDoctors(
            String keyword,
            int page,
            int size
    );
}
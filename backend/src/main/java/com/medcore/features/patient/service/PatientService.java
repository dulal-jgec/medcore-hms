package com.medcore.features.patient.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.request.UpdatePatientRequest;
import com.medcore.features.patient.dto.request.UpdatePatientStatusRequest;
import com.medcore.features.patient.dto.response.PatientResponse;

public interface PatientService {

    ApiResponse<PatientResponse> createPatient(
            CreatePatientRequest request
    );

    ApiResponse<PageResponse<PatientResponse>> getAllPatients(
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<PatientResponse> getPatientById(
            Long patientId
    );
    
    ApiResponse<PatientResponse> updatePatient(
            Long patientId,
            UpdatePatientRequest request
    );
    
    ApiResponse<PatientResponse> updatePatientStatus(
            Long patientId,
            UpdatePatientStatusRequest request
    );
    
    ApiResponse<PageResponse<PatientResponse>> searchPatients(
            String keyword,
            int page,
            int size
    );

    ApiResponse<String> deletePatient(Long patientId);

    ApiResponse<String> restorePatient(Long patientId);
    
    
}
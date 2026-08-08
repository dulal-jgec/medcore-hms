package com.medcore.features.medicalrecord.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.medicalrecord.dto.request.CreateMedicalRecordRequest;
import com.medcore.features.medicalrecord.dto.response.MedicalRecordResponse;

public interface MedicalRecordService {

    ApiResponse<MedicalRecordResponse> createMedicalRecord(
            CreateMedicalRecordRequest request
    );

    ApiResponse<MedicalRecordResponse> getMedicalRecordById(
            Long recordId
    );

    ApiResponse<MedicalRecordResponse> getMedicalRecordByAppointment(
            Long appointmentId
    );
}
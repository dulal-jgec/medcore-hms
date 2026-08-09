package com.medcore.features.prescription.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.prescription.dto.request.AddPrescriptionItemRequest;
import com.medcore.features.prescription.dto.request.CreatePrescriptionRequest;
import com.medcore.features.prescription.dto.response.PrescriptionItemResponse;
import com.medcore.features.prescription.dto.response.PrescriptionResponse;

import org.springframework.http.ResponseEntity;

public interface PrescriptionService {

    ApiResponse<PrescriptionResponse> createPrescription(
            CreatePrescriptionRequest request
    );

    ApiResponse<PrescriptionItemResponse> addMedicine(
            Long prescriptionId,
            AddPrescriptionItemRequest request
    );

    ApiResponse<PrescriptionResponse> getPrescriptionById(
            Long prescriptionId
    );

     

    ApiResponse<PrescriptionResponse> finalizePrescription(
            Long prescriptionId
    );
    
    ApiResponse<PrescriptionResponse> sharePrescriptionWithPatient(
            Long prescriptionId
    );
    
    ApiResponse<PrescriptionResponse> getPatientPrescription(
            Long prescriptionId
    );
    
    ApiResponse<PrescriptionItemResponse> updateMedicine(
            Long prescriptionId,
            Long itemId,
            AddPrescriptionItemRequest request
    );

    ApiResponse<Void> deleteMedicine(
            Long prescriptionId,
            Long itemId
    );
    
    ResponseEntity<byte[]> downloadPrescriptionPdf(
            Long prescriptionId
    );
}
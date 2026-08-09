package com.medcore.features.prescription.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.prescription.dto.request.AddPrescriptionItemRequest;
import com.medcore.features.prescription.dto.request.CreatePrescriptionRequest;
import com.medcore.features.prescription.dto.response.PrescriptionItemResponse;
import com.medcore.features.prescription.dto.response.PrescriptionResponse;
import com.medcore.features.prescription.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PrescriptionResponse> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequest request) {

        return prescriptionService.createPrescription(request);
    }

    @PostMapping("/{prescriptionId}/medicines")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PrescriptionItemResponse> addMedicine(
            @PathVariable Long prescriptionId,
            @Valid @RequestBody AddPrescriptionItemRequest request) {

        return prescriptionService.addMedicine(
                prescriptionId,
                request
        );
    }

    @GetMapping("/{prescriptionId}")
    public ApiResponse<PrescriptionResponse> getPrescriptionById(
            @PathVariable Long prescriptionId) {

        return prescriptionService.getPrescriptionById(
                prescriptionId
        );
    }

    @PatchMapping("/{prescriptionId}/finalize")
    public ApiResponse<PrescriptionResponse> finalizePrescription(
            @PathVariable Long prescriptionId) {

        return prescriptionService.finalizePrescription(
                prescriptionId
        );
    }
    
    @PatchMapping("/{prescriptionId}/share")
    public ApiResponse<PrescriptionResponse> sharePrescriptionWithPatient(
            @PathVariable Long prescriptionId) {

        return prescriptionService.sharePrescriptionWithPatient(
                prescriptionId
        );
    }
    
    @GetMapping("/{prescriptionId}/patient")
    public ApiResponse<PrescriptionResponse> getPatientPrescription(
            @PathVariable Long prescriptionId) {

        return prescriptionService.getPatientPrescription(
                prescriptionId
        );
    }
    
    @PutMapping("/{prescriptionId}/medicines/{itemId}")
    public ApiResponse<PrescriptionItemResponse> updateMedicine(
            @PathVariable Long prescriptionId,
            @PathVariable Long itemId,
            @Valid @RequestBody AddPrescriptionItemRequest request) {

        return prescriptionService.updateMedicine(
                prescriptionId,
                itemId,
                request
        );
    }
    
    @DeleteMapping("/{prescriptionId}/medicines/{itemId}")
    public ApiResponse<Void> deleteMedicine(
            @PathVariable Long prescriptionId,
            @PathVariable Long itemId) {

        return prescriptionService.deleteMedicine(
                prescriptionId,
                itemId
        );
    }
    
    @GetMapping("/{prescriptionId}/download")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(
            @PathVariable Long prescriptionId) {

        return prescriptionService.downloadPrescriptionPdf(
                prescriptionId
        );
    }
}
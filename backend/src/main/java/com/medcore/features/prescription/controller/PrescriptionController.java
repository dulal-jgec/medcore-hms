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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<PrescriptionResponse> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequest request) {

        return prescriptionService.createPrescription(request);
    }

    @PostMapping("/{prescriptionId}/medicines")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<PrescriptionItemResponse> addMedicine(
            @PathVariable Long prescriptionId,
            @Valid @RequestBody AddPrescriptionItemRequest request) {

        return prescriptionService.addMedicine(
                prescriptionId,
                request
        );
    }

    @GetMapping("/{prescriptionId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ApiResponse<PrescriptionResponse> getPrescriptionById(
            @PathVariable Long prescriptionId) {

        return prescriptionService.getPrescriptionById(
                prescriptionId
        );
    }

    @PatchMapping("/{prescriptionId}/finalize")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<PrescriptionResponse> finalizePrescription(
            @PathVariable Long prescriptionId) {

        return prescriptionService.finalizePrescription(
                prescriptionId
        );
    }

    @PatchMapping("/{prescriptionId}/share")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<PrescriptionResponse> sharePrescriptionWithPatient(
            @PathVariable Long prescriptionId) {

        return prescriptionService.sharePrescriptionWithPatient(
                prescriptionId
        );
    }

    @GetMapping("/{prescriptionId}/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<PrescriptionResponse> getPatientPrescription(
            @PathVariable Long prescriptionId) {

        return prescriptionService.getPatientPrescription(
                prescriptionId
        );
    }

    @PutMapping("/{prescriptionId}/medicines/{itemId}")
    @PreAuthorize("hasRole('DOCTOR')")
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
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<Void> deleteMedicine(
            @PathVariable Long prescriptionId,
            @PathVariable Long itemId) {

        return prescriptionService.deleteMedicine(
                prescriptionId,
                itemId
        );
    }

    @GetMapping("/{prescriptionId}/download")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(
            @PathVariable Long prescriptionId) {

        return prescriptionService.downloadPrescriptionPdf(
                prescriptionId
        );
    }
}
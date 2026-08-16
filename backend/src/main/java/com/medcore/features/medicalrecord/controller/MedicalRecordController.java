package com.medcore.features.medicalrecord.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.medicalrecord.dto.request.CreateMedicalRecordRequest;
import com.medcore.features.medicalrecord.dto.response.MedicalRecordResponse;
import com.medcore.features.medicalrecord.service.MedicalRecordService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>>
    createMedicalRecord(
            @Valid @RequestBody CreateMedicalRecordRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        medicalRecordService
                                .createMedicalRecord(request)
                );
    }

    @GetMapping("/{recordId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>>
    getMedicalRecordById(
            @PathVariable Long recordId) {

        return ResponseEntity.ok(
                medicalRecordService
                        .getMedicalRecordById(recordId)
        );
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>>
    getMedicalRecordByAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                medicalRecordService
                        .getMedicalRecordByAppointment(appointmentId)
        );
    }
}
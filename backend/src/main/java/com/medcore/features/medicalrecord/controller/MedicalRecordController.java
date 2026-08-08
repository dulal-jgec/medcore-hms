package com.medcore.features.medicalrecord.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.medicalrecord.dto.request.CreateMedicalRecordRequest;
import com.medcore.features.medicalrecord.dto.response.MedicalRecordResponse;
import com.medcore.features.medicalrecord.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
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
    public ResponseEntity<ApiResponse<MedicalRecordResponse>>
    getMedicalRecordById(
            @PathVariable Long recordId) {

        return ResponseEntity.ok(
                medicalRecordService
                        .getMedicalRecordById(recordId)
        );
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>>
    getMedicalRecordByAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                medicalRecordService
                        .getMedicalRecordByAppointment(appointmentId)
        );
    }
}
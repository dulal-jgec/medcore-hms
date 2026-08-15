package com.medcore.features.doctor.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.doctor.dto.request.CreateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorStatusRequest;
import com.medcore.features.doctor.dto.response.DoctorResponse;
import com.medcore.features.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(
            @Valid @RequestBody CreateDoctorRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(doctorService.createDoctor(request));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DoctorResponse>>> getAllDoctors(

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                doctorService.getAllDoctors(
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                doctorService.getDoctorById(doctorId)
        );
    }
    
    @PutMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long doctorId,
            @Valid @RequestBody UpdateDoctorRequest request) {

        return ResponseEntity.ok(
                doctorService.updateDoctor(doctorId, request)
        );
    }

    @PatchMapping("/{doctorId}/status")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctorStatus(
            @PathVariable Long doctorId,
            @Valid @RequestBody UpdateDoctorStatusRequest request) {

        return ResponseEntity.ok(
                doctorService.updateDoctorStatus(doctorId, request)
        );
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<DoctorResponse>>> searchDoctors(

            @RequestParam String keyword,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                doctorService.searchDoctors(
                        keyword,
                        page,
                        size
                )
        );
    }
    
    @DeleteMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<String>> deleteDoctor(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                doctorService.deleteDoctor(doctorId)
        );
    }

    @PatchMapping("/{doctorId}/restore")
    public ResponseEntity<ApiResponse<String>> restoreDoctor(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                doctorService.restoreDoctor(doctorId)
        );
    }
}
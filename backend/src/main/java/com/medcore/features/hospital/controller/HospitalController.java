package com.medcore.features.hospital.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalStatusRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import com.medcore.features.hospital.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateHospitalResponse>> createHospital(
            @Valid @RequestBody CreateHospitalRequest request) {

        ApiResponse<CreateHospitalResponse> response =
                hospitalService.createHospital(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping
    public ResponseEntity<ApiResponse<Page<CreateHospitalResponse>>> getAllHospitals(

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                hospitalService.getAllHospitals(page, size, sortBy, sortDir)
        );
    }
    
    @GetMapping("/{hospitalId}")
    public ResponseEntity<ApiResponse<CreateHospitalResponse>> getHospitalById(
            @PathVariable Long hospitalId) {

        return ResponseEntity.ok(
                hospitalService.getHospitalById(hospitalId)
        );
    }
    
    @PutMapping("/{hospitalId}")
    public ResponseEntity<ApiResponse<CreateHospitalResponse>> updateHospital(
            @PathVariable Long hospitalId,
            @Valid @RequestBody UpdateHospitalRequest request) {

        return ResponseEntity.ok(
                hospitalService.updateHospital(hospitalId, request)
        );
    }
    
    @PatchMapping("/{hospitalId}/status")
    public ResponseEntity<ApiResponse<CreateHospitalResponse>> updateHospitalStatus(
            @PathVariable Long hospitalId,
            @Valid @RequestBody UpdateHospitalStatusRequest request) {

        return ResponseEntity.ok(
                hospitalService.updateHospitalStatus(hospitalId, request)
        );
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CreateHospitalResponse>>> searchHospitals(

            @RequestParam String keyword,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                hospitalService.searchHospitals(keyword, page, size)
        );
    }
    
    @DeleteMapping("/{hospitalId}")
    public ResponseEntity<ApiResponse<String>> deleteHospital(
            @PathVariable Long hospitalId) {

        return ResponseEntity.ok(
                hospitalService.deleteHospital(hospitalId)
        );
    }
    
    @PatchMapping("/{hospitalId}/restore")
    public ResponseEntity<ApiResponse<String>> restoreHospital(
            @PathVariable Long hospitalId) {

        return ResponseEntity.ok(
                hospitalService.restoreHospital(hospitalId)
        );
    }
}
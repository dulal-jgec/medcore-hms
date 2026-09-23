package com.medcore.features.hospital.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.response.PublicHospitalResponse;
import com.medcore.features.hospital.service.PublicHospitalService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/hospitals")
@RequiredArgsConstructor
public class PublicHospitalController {

    private final PublicHospitalService publicHospitalService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PublicHospitalResponse>>> getHospitals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                publicHospitalService.getHospitals(
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }

    @GetMapping("/{hospitalId}")
    public ResponseEntity<ApiResponse<PublicHospitalResponse>> getHospital(
            @PathVariable Long hospitalId) {

        return ResponseEntity.ok(
                publicHospitalService.getHospital(hospitalId)
        );
    }
}
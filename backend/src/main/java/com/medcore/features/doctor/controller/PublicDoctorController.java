package com.medcore.features.doctor.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.doctor.dto.response.PublicDoctorResponse;
import com.medcore.features.doctor.service.PublicDoctorService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/hospitals/{hospitalId}/doctors")
@RequiredArgsConstructor
public class PublicDoctorController {

    private final PublicDoctorService publicDoctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PublicDoctorResponse>>>
    getDoctors(
            @PathVariable Long hospitalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                publicDoctorService.getDoctors(
                        hospitalId,
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<PublicDoctorResponse>>
    getDoctor(
            @PathVariable Long hospitalId,
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                publicDoctorService.getDoctor(
                        hospitalId,
                        doctorId
                )
        );
    }
}
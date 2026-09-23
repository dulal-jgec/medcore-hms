package com.medcore.features.hospital.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.request.UpdateHospitalProfileRequest;
import com.medcore.features.hospital.dto.response.HospitalProfileResponse;
import com.medcore.features.hospital.service.HospitalAdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/hospital")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOSPITAL_ADMIN')")
public class HospitalController {

    private final HospitalAdminService hospitalAdminService;

    @GetMapping("/profile")
    public ApiResponse<HospitalProfileResponse> getMyHospitalProfile() {
        return hospitalAdminService.getMyHospitalProfile();
    }

    @PutMapping("/profile")
    public ApiResponse<HospitalProfileResponse> updateMyHospitalProfile(
            @Valid @RequestBody UpdateHospitalProfileRequest request) {

        return hospitalAdminService.updateMyHospitalProfile(request);
    }

    @PostMapping(
            value = "/profile/logo",
            consumes = "multipart/form-data"
    )
    public ApiResponse<HospitalProfileResponse> uploadLogo(
            @RequestParam("file") MultipartFile file) {

        return hospitalAdminService.uploadLogo(file);
    }

    @PostMapping(
            value = "/profile/banner",
            consumes = "multipart/form-data"
    )
    public ApiResponse<HospitalProfileResponse> uploadBanner(
            @RequestParam("file") MultipartFile file) {

        return hospitalAdminService.uploadBanner(file);
    }
}
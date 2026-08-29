package com.medcore.features.superadmin.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalStatusRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import com.medcore.features.superadmin.dto.response.SuperAdminDashboardResponse;
import com.medcore.features.superadmin.dto.response.SuperAdminResponse;
import com.medcore.features.superadmin.service.SuperAdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/super-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @GetMapping("/me")
    public ApiResponse<SuperAdminResponse>
    getCurrentSuperAdmin() {

        return superAdminService
                .getCurrentSuperAdmin();
    }
    
    @PostMapping("/hospitals")
    public ApiResponse<CreateHospitalResponse> createHospital(
            @Valid @RequestBody CreateHospitalRequest request) {

        return superAdminService.createHospital(request);
    }
    
    @GetMapping("/hospitals")
    public ApiResponse<Page<CreateHospitalResponse>> getAllHospitals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        return superAdminService.getAllHospitals(
                page,
                size,
                sortBy,
                sortDir
        );
    }
    
    @GetMapping("/hospitals/{hospitalId}")
    public ApiResponse<CreateHospitalResponse>getHospitalById(
    		@PathVariable Long hospitalId
    		){
    	return superAdminService.getHospitalById(hospitalId);
    }
    
    
    @PutMapping("/hospitals/{hospitalId}")
    public ApiResponse<CreateHospitalResponse> updateHospital(
            @PathVariable Long hospitalId,
            @Valid @RequestBody UpdateHospitalRequest request) {

        return superAdminService.updateHospital(
                hospitalId,
                request
        );
    }
    
    @PatchMapping("/hospitals/{hospitalId}/status")
    public ApiResponse<CreateHospitalResponse> updateHospitalStatus(
            @PathVariable Long hospitalId,
            @Valid @RequestBody UpdateHospitalStatusRequest request) {

        return superAdminService.updateHospitalStatus(
                hospitalId,
                request
        );
    }
    
    @GetMapping("/hospitals/search")
    public ApiResponse<Page<CreateHospitalResponse>> searchHospitals(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return superAdminService.searchHospitals(
                keyword,
                page,
                size
        );
    }
    
    @DeleteMapping("/hospitals/{hospitalId}")
    public ApiResponse<String> deleteHospital(
            @PathVariable Long hospitalId) {

        return superAdminService.deleteHospital(
                hospitalId
        );
    }
    
    @PatchMapping("/hospitals/{hospitalId}/restore")
    public ApiResponse<String> restoreHospital(
            @PathVariable Long hospitalId) {

        return superAdminService.restoreHospital(
                hospitalId
        );
    }
    
    @GetMapping("/dashboard")
    public ApiResponse<SuperAdminDashboardResponse> getDashboard() {

        return superAdminService.getDashboard();
    }
}
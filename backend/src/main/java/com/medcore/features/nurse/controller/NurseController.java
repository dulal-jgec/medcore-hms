package com.medcore.features.nurse.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.nurse.dto.request.CreateNurseRequest;
import com.medcore.features.nurse.dto.request.UpdateMyNurseProfileRequest;
import com.medcore.features.nurse.dto.request.UpdateNurseRequest;
import com.medcore.features.nurse.dto.response.NurseProfileResponse;
import com.medcore.features.nurse.dto.response.NurseResponse;
import com.medcore.features.nurse.service.NurseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/nurses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOSPITAL_ADMIN')")
public class NurseController {

    private final NurseService nurseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NurseResponse> createNurse(
            @Valid @RequestBody CreateNurseRequest request) {

        return nurseService.createNurse(request);
    }

    @GetMapping("/{nurseId}")
    public ApiResponse<NurseResponse> getNurseById(
            @PathVariable Long nurseId) {

        return nurseService.getNurseById(nurseId);
    }

    @GetMapping
    public ApiResponse<List<NurseResponse>> getAllNurses() {

        return nurseService.getAllNurses();
    }

    @PutMapping("/{nurseId}")
    public ApiResponse<NurseResponse> updateNurse(
            @PathVariable Long nurseId,
            @Valid @RequestBody UpdateNurseRequest request) {

        return nurseService.updateNurse(
                nurseId,
                request
        );
    }

    @DeleteMapping("/{nurseId}")
    public ApiResponse<Void> deleteNurse(
            @PathVariable Long nurseId) {

        return nurseService.deleteNurse(nurseId);
    }

    @PatchMapping("/{nurseId}/activate")
    public ApiResponse<NurseResponse> activateNurse(
            @PathVariable Long nurseId) {

        return nurseService.activateNurse(nurseId);
    }

    @PatchMapping("/{nurseId}/deactivate")
    public ApiResponse<NurseResponse> deactivateNurse(
            @PathVariable Long nurseId) {

        return nurseService.deactivateNurse(nurseId);
    }
    
    @PreAuthorize("hasRole('NURSE')")
    @GetMapping("/me")
    public ApiResponse<NurseProfileResponse> getMyProfile() {

        return nurseService.getMyProfile();
    }
    
    @PreAuthorize("hasRole('NURSE')")
    @PutMapping("/me")
    public ApiResponse<NurseProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateMyNurseProfileRequest request) {

        return nurseService.updateMyProfile(request);
    }
    
    @PreAuthorize("hasRole('NURSE')")
    @PostMapping(
            value = "/me/profile-image",
            consumes = "multipart/form-data"
    )
    public ApiResponse<NurseProfileResponse> uploadMyProfileImage(
            @RequestParam("file") MultipartFile file) {

        return nurseService.uploadMyProfileImage(file);
    }
    
}
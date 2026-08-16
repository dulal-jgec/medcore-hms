package com.medcore.features.lab.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.lab.dto.request.CreateLabTestRequest;
import com.medcore.features.lab.dto.request.UpdateLabTestRequest;
import com.medcore.features.lab.dto.response.LabTestResponse;
import com.medcore.features.lab.service.LabTestService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lab-tests")
@RequiredArgsConstructor
public class LabTestController {

    private final LabTestService labTestService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ApiResponse<LabTestResponse> createLabTest(
            @Valid @RequestBody CreateLabTestRequest request) {

        return labTestService.createLabTest(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    public ApiResponse<List<LabTestResponse>> getAllLabTests() {

        return labTestService.getAllLabTests();
    }

    @GetMapping("/{labTestId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    public ApiResponse<LabTestResponse> getLabTestById(
            @PathVariable Long labTestId) {

        return labTestService.getLabTestById(labTestId);
    }

    @PutMapping("/{labTestId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ApiResponse<LabTestResponse> updateLabTest(
            @PathVariable Long labTestId,
            @Valid @RequestBody UpdateLabTestRequest request) {

        return labTestService.updateLabTest(
                labTestId,
                request
        );
    }

    @DeleteMapping("/{labTestId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ApiResponse<Void> deleteLabTest(
            @PathVariable Long labTestId) {

        return labTestService.deleteLabTest(labTestId);
    }

    @PatchMapping("/{labTestId}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ApiResponse<LabTestResponse> activateLabTest(
            @PathVariable Long labTestId) {

        return labTestService.activateLabTest(labTestId);
    }

    @PatchMapping("/{labTestId}/deactivate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ApiResponse<LabTestResponse> deactivateLabTest(
            @PathVariable Long labTestId) {

        return labTestService.deactivateLabTest(labTestId);
    }
}
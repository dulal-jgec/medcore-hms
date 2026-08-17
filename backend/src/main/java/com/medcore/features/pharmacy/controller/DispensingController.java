package com.medcore.features.pharmacy.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.CreateDispensingRequest;
import com.medcore.features.pharmacy.entity.DispensingRequest;
import com.medcore.features.pharmacy.service.DispensingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pharmacy/dispensing")
@RequiredArgsConstructor
public class DispensingController {

    private final DispensingService dispensingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<DispensingRequest> createDispensingRequest(
            @Valid @RequestBody CreateDispensingRequest request) {

        return dispensingService.createDispensingRequest(
                request
        );
    }

    @PatchMapping("/{dispensingRequestId}/dispense")
    @PreAuthorize("hasRole('PHARMACIST')")
    public ApiResponse<DispensingRequest> dispensePrescription(
            @PathVariable Long dispensingRequestId) {

        return dispensingService.dispensePrescription(
                dispensingRequestId
        );
    }
}
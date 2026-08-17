package com.medcore.features.pharmacy.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.CreatePharmacyRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyResponse;
import com.medcore.features.pharmacy.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pharmacies")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ApiResponse<PharmacyResponse> createPharmacy(
            @Valid @RequestBody CreatePharmacyRequest request) {

        return pharmacyService.createPharmacy(request);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('PHARMACIST')")
    public ApiResponse<PharmacyResponse> getMyPharmacy() {

        return pharmacyService.getMyPharmacy();
    }
}
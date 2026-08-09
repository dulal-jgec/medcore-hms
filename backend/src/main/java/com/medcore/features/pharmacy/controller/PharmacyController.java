package com.medcore.features.pharmacy.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.CreatePharmacyRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyResponse;
import com.medcore.features.pharmacy.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pharmacies")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PharmacyResponse> createPharmacy(
            @Valid @RequestBody CreatePharmacyRequest request) {

        return pharmacyService.createPharmacy(request);
    }

    @GetMapping("/my")
    public ApiResponse<PharmacyResponse> getMyPharmacy() {

        return pharmacyService.getMyPharmacy();
    }
}
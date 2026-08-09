package com.medcore.features.pharmacy.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.CreatePharmacyRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyResponse;

public interface PharmacyService {

    ApiResponse<PharmacyResponse> createPharmacy(
            CreatePharmacyRequest request
    );

    ApiResponse<PharmacyResponse> getMyPharmacy();
}
package com.medcore.features.pharmacy.service;

import java.util.List;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.CreateDispensingRequest;
import com.medcore.features.pharmacy.entity.DispensingRequest;

public interface DispensingService {

    ApiResponse<DispensingRequest> createDispensingRequest(
            CreateDispensingRequest request
    );

    ApiResponse<DispensingRequest> dispensePrescription(
            Long dispensingRequestId
    );
    ApiResponse<List<DispensingRequest>> getPendingRequests();
}
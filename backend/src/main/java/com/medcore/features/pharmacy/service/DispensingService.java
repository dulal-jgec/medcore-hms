package com.medcore.features.pharmacy.service;

import java.util.List;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.CreateDispensingRequest;
import com.medcore.features.pharmacy.entity.DispensingRequest;
import com.medcore.common.response.PageResponse;
public interface DispensingService {

    ApiResponse<DispensingRequest> createDispensingRequest(
            CreateDispensingRequest request
    );

    ApiResponse<DispensingRequest> dispensePrescription(
            Long dispensingRequestId
    );
    ApiResponse<PageResponse<DispensingRequest>> getPendingRequests(
            int page,
            int size,
            String sortBy,
            String sortDir
    );}
package com.medcore.features.lab.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.lab.dto.request.CreateLabResultRequest;
import com.medcore.features.lab.dto.response.LabResultResponse;

public interface LabResultService {

    ApiResponse<LabResultResponse> createResult(
            Long labOrderItemId,
            CreateLabResultRequest request
    );

    ApiResponse<LabResultResponse> getResult(
            Long labOrderItemId
    );
    
    ApiResponse<LabResultResponse> updateResult(
            Long labOrderItemId,
            CreateLabResultRequest request
    );
}
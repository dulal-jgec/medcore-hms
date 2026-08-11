package com.medcore.features.lab.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.lab.dto.request.CreateLabTestRequest;
import com.medcore.features.lab.dto.request.UpdateLabTestRequest;
import com.medcore.features.lab.dto.response.LabTestResponse;

import java.util.List;

public interface LabTestService {

    ApiResponse<LabTestResponse> createLabTest(
            CreateLabTestRequest request
    );

    ApiResponse<LabTestResponse> getLabTestById(
            Long labTestId
    );

    ApiResponse<List<LabTestResponse>> getAllLabTests();

    ApiResponse<LabTestResponse> updateLabTest(
            Long labTestId,
            UpdateLabTestRequest request
    );

    ApiResponse<Void> deleteLabTest(
            Long labTestId
    );

    ApiResponse<LabTestResponse> activateLabTest(
            Long labTestId
    );

    ApiResponse<LabTestResponse> deactivateLabTest(
            Long labTestId
    );
}
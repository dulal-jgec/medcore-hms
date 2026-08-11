package com.medcore.features.lab.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.lab.dto.request.AddLabOrderItemRequest;
import com.medcore.features.lab.dto.request.CreateLabOrderRequest;
import com.medcore.features.lab.dto.response.LabOrderItemResponse;
import com.medcore.features.lab.dto.response.LabOrderResponse;
import com.medcore.features.lab.enums.LabOrderStatus;

public interface LabOrderService {

    ApiResponse<LabOrderResponse> createLabOrder(
            CreateLabOrderRequest request
    );

    ApiResponse<LabOrderItemResponse> addLabOrderItem(
            Long labOrderId,
            AddLabOrderItemRequest request
    );

    ApiResponse<LabOrderResponse> getLabOrderById(
            Long labOrderId
    );
    
    ApiResponse<LabOrderResponse> updateStatus(
            Long labOrderId,
            LabOrderStatus status
    );
}
package com.medcore.features.lab.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.lab.dto.request.AddLabOrderItemRequest;
import com.medcore.features.lab.dto.request.CreateLabOrderRequest;
import com.medcore.features.lab.dto.response.LabOrderItemResponse;
import com.medcore.features.lab.dto.response.LabOrderResponse;
import com.medcore.features.lab.enums.LabOrderStatus;
import com.medcore.features.lab.service.LabOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lab-orders")
@RequiredArgsConstructor
public class LabOrderController {

    private final LabOrderService labOrderService;


     
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LabOrderResponse> createLabOrder(
            @Valid @RequestBody CreateLabOrderRequest request) {

        return labOrderService.createLabOrder(request);
    }


     

    @PostMapping("/{labOrderId}/tests")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LabOrderItemResponse> addLabOrderItem(
            @PathVariable Long labOrderId,
            @Valid @RequestBody AddLabOrderItemRequest request) {

        return labOrderService.addLabOrderItem(
                labOrderId,
                request
        );
    }


    
    @GetMapping("/{labOrderId}")
    public ApiResponse<LabOrderResponse> getLabOrderById(
            @PathVariable Long labOrderId) {

        return labOrderService.getLabOrderById(
                labOrderId
        );
    }
    
    @PatchMapping("/{labOrderId}/status")
    public ApiResponse<LabOrderResponse> updateStatus(
            @PathVariable Long labOrderId,
            @RequestParam LabOrderStatus status) {

        return labOrderService.updateStatus(
                labOrderId,
                status
        );
    }
}
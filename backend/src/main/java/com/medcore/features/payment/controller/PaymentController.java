package com.medcore.features.payment.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.payment.dto.request.CreatePaymentRequest;
import com.medcore.features.payment.dto.response.PaymentOrderResponse;
import com.medcore.features.payment.service.PaymentService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<
            ApiResponse<PaymentOrderResponse>
            > createPaymentOrder(

            @Valid
            @RequestBody
            CreatePaymentRequest request) {

        ApiResponse<PaymentOrderResponse> response =
                paymentService.createPaymentOrder(
                        request
                );

        return ResponseEntity.ok(response);
    }
}
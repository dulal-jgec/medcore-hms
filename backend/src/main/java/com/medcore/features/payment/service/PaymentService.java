package com.medcore.features.payment.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.payment.dto.request.CreatePaymentRequest;
import com.medcore.features.payment.dto.response.PaymentOrderResponse;

public interface PaymentService {

    ApiResponse<PaymentOrderResponse> createPaymentOrder(
            CreatePaymentRequest request
    );
}
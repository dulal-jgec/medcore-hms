package com.medcore.features.payment.gateway;

import com.medcore.features.payment.gateway.dto.GatewayOrderResponse;

import java.math.BigDecimal;

public interface PaymentGateway {

    GatewayOrderResponse createOrder(
            String receipt,
            BigDecimal amount,
            String currency
    );

    boolean verifyPaymentSignature(
            String orderId,
            String paymentId,
            String signature
    );
    
    boolean verifyWebhookSignature(
            String payload,
            String signature
    );
}
package com.medcore.features.payment.gateway.impl;

import com.medcore.features.payment.config.RazorpayProperties;
import com.medcore.features.payment.gateway.PaymentGateway;
import com.medcore.features.payment.gateway.dto.GatewayOrderResponse;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import lombok.RequiredArgsConstructor;

import org.json.JSONObject;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class RazorpayPaymentGateway
        implements PaymentGateway {

    private final RazorpayProperties razorpayProperties;

    @Override
    public GatewayOrderResponse createOrder(
            String receipt,
            BigDecimal amount,
            String currency) {

        try {

            RazorpayClient client =
                    new RazorpayClient(
                            razorpayProperties.getKeyId(),
                            razorpayProperties.getKeySecret()
                    );

            long amountInPaise =
                    amount
                            .multiply(BigDecimal.valueOf(100))
                            .longValueExact();

            JSONObject orderRequest =
                    new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    currency
            );

            orderRequest.put(
                    "receipt",
                    receipt
            );

            Order order =
                    client.orders.create(
                            orderRequest
                    );

            return GatewayOrderResponse.builder()
                    .orderId(
                            order.get("id")
                    )
                    .amount(amount)
                    .currency(currency)
                    .build();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to create Razorpay order",
                    e
            );
        }
    }

    @Override
    public boolean verifyPaymentSignature(
            String orderId,
            String paymentId,
            String signature) {

        try {

            String payload =
                    orderId + "|" + paymentId;

            return com.razorpay.Utils.verifySignature(
                    payload,
                    signature,
                    razorpayProperties.getKeySecret()
            );

        } catch (Exception e) {

            return false;
        }
    }
}
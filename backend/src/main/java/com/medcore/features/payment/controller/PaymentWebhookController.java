package com.medcore.features.payment.controller;

import com.medcore.features.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(

            @RequestHeader(
                    value = "X-Razorpay-Signature",
                    required = false
            )
            String signature,

            @RequestBody String payload) {

        paymentService.handleWebhook(
                signature,
                payload
        );

        return ResponseEntity.ok().build();
    }
}
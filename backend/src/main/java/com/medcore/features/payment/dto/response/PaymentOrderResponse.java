package com.medcore.features.payment.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PaymentOrderResponse {

    private Long paymentId;

    private String gatewayOrderId;

    private BigDecimal amount;

    private String currency;

    private String status;
}
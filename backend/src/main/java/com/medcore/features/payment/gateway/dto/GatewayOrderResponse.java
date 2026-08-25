package com.medcore.features.payment.gateway.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class GatewayOrderResponse {

    private String orderId;

    private BigDecimal amount;

    private String currency;
}
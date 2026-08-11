package com.medcore.features.accountant.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class FinancialSummaryResponse {

    private long totalBills;

    private BigDecimal totalBilledAmount;

    private BigDecimal totalPaidAmount;

    private BigDecimal totalOutstandingAmount;
}
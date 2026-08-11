package com.medcore.features.accountant.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class FinancialReportResponse {

    private LocalDate fromDate;

    private LocalDate toDate;

    private long totalBills;

    private BigDecimal totalBilledAmount;

    private BigDecimal totalPaidAmount;

    private BigDecimal totalOutstandingAmount;
}
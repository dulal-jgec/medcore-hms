package com.medcore.features.lab.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LabResultResponse {

    private Long id;

    private Long labOrderItemId;

    private Long labOrderId;

    private Long labTestId;

    private String testName;

    private String resultValue;

    private String unit;

    private String referenceRange;

    private String remarks;

    private Boolean abnormal;

    private LocalDateTime resultDate;
}
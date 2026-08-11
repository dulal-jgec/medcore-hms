package com.medcore.features.lab.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class LabOrderItemResponse {

    private Long id;

    private Long labTestId;

    private String testName;

    private String category;

    private BigDecimal price;

    private String instructions;
}
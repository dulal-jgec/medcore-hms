package com.medcore.features.lab.dto.response;

import com.medcore.features.lab.enums.LabTestCategory;
import com.medcore.features.lab.enums.LabTestStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class LabTestResponse {

    private Long id;

    private String name;

    private LabTestCategory category;

    private String description;

    private BigDecimal price;

    private LabTestStatus status;
}
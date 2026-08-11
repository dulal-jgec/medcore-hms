package com.medcore.features.lab.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateLabResultRequest {

    @NotBlank(message = "Result value is required")
    @Size(max = 255)
    private String resultValue;

    @Size(max = 100)
    private String unit;

    @Size(max = 100)
    private String referenceRange;

    @Size(max = 1000)
    private String remarks;

    private Boolean abnormal;
}
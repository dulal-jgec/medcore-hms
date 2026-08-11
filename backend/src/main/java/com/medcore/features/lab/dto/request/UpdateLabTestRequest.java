package com.medcore.features.lab.dto.request;

import com.medcore.features.lab.enums.LabTestCategory;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateLabTestRequest {

    @NotBlank(message = "Test name is required")
    @Size(max = 150)
    private String name;

    @NotNull(message = "Test category is required")
    private LabTestCategory category;

    @Size(max = 500)
    private String description;

    @NotNull(message = "Test price is required")
    @DecimalMin(value = "0.0", inclusive = false,
            message = "Price must be greater than zero")
    private BigDecimal price;
}
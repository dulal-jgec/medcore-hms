package com.medcore.features.lab.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddLabOrderItemRequest {

    @NotNull(message = "Lab test ID is required")
    private Long labTestId;

    @Size(max = 500, message = "Instructions cannot exceed 500 characters")
    private String instructions;
}
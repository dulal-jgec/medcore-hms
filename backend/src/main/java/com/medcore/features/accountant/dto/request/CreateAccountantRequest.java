package com.medcore.features.accountant.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAccountantRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @Size(max = 100)
    private String designation;
}
package com.medcore.features.accountant.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAccountantRequest {

    @Size(max = 100)
    private String designation;
}
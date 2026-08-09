package com.medcore.features.pharmacy.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDispensingRequest {

    @NotNull
    private Long prescriptionId;
}
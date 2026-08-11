package com.medcore.features.receptionist.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateReceptionistRequest {

    @Size(max = 100)
    private String designation;
}
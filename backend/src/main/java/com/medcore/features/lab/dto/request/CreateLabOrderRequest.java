package com.medcore.features.lab.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateLabOrderRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotEmpty(message = "At least one lab test is required")
    private List<Long> labTestIds;

    @Size(max = 500, message = "Clinical notes cannot exceed 500 characters")
    private String clinicalNotes;
}
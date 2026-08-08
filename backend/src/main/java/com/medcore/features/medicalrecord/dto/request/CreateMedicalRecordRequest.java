package com.medcore.features.medicalrecord.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMedicalRecordRequest {

    @NotNull(message = "Appointment id is required")
    private Long appointmentId;

    @NotBlank(message = "Symptoms are required")
    @Size(max = 5000, message = "Symptoms cannot exceed 5000 characters")
    private String symptoms;

    @NotBlank(message = "Diagnosis is required")
    @Size(max = 5000, message = "Diagnosis cannot exceed 5000 characters")
    private String diagnosis;

    @Size(max = 10000, message = "Examination notes cannot exceed 10000 characters")
    private String examinationNotes;

    @Size(max = 10000, message = "Treatment notes cannot exceed 10000 characters")
    private String treatmentNotes;
}
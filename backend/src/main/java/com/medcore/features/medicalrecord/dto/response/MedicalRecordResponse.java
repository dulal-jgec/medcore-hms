package com.medcore.features.medicalrecord.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponse {

    private Long id;

    private Long appointmentId;

    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;

    private Long hospitalId;
    private String hospitalName;

    private String symptoms;
    private String diagnosis;
    private String examinationNotes;
    private String treatmentNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
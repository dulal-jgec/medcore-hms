package com.medcore.features.prescription.dto.response;

import com.medcore.features.prescription.enums.PrescriptionStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PrescriptionResponse {

    private Long id;

    private Long appointmentId;

    private Long doctorId;
    private String doctorName;

    private Long patientId;
    private String patientName;

    private Long hospitalId;
    private String hospitalName;

    private LocalDateTime prescriptionDate;

    private PrescriptionStatus status;

    private List<PrescriptionItemResponse> medicines;

    private LocalDateTime createdAt;
}
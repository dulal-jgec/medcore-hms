package com.medcore.features.lab.dto.response;

import com.medcore.features.lab.enums.LabOrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class LabOrderResponse {

    private Long id;

    private Long patientId;

    private Long doctorId;

    private Long hospitalId;

    private Long appointmentId;

    private LabOrderStatus status;

    private String clinicalNotes;

    private LocalDateTime createdAt;

    private List<LabOrderItemResponse> items;
}
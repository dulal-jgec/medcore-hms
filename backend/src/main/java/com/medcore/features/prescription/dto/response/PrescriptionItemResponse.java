package com.medcore.features.prescription.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemResponse {

    private Long id;

    private Long medicineId;

    private String medicineName;

    private String strength;

    private String dosage;

    private Integer quantity;

    private String frequency;

    private String duration;

    private String instructions;
}
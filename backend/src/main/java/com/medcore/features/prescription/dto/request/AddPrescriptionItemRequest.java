package com.medcore.features.prescription.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddPrescriptionItemRequest {

    private Long medicineId;

    @NotBlank(message = "Medicine name is required")
    @Size(max = 150)
    private String medicineName;

    @Size(max = 100)
    private String strength;

    @NotBlank(message = "Dosage is required")
    @Size(max = 100)
    private String dosage;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotBlank(message = "Frequency is required")
    @Size(max = 100)
    private String frequency;

    @NotBlank(message = "Duration is required")
    @Size(max = 50)
    private String duration;

    @Size(max = 255)
    private String instructions;
}
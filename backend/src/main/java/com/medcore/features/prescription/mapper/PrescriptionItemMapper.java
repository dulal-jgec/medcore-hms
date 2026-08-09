package com.medcore.features.prescription.mapper;

import com.medcore.features.prescription.dto.response.PrescriptionItemResponse;
import com.medcore.features.prescription.entity.PrescriptionItem;
import org.springframework.stereotype.Component;

@Component
public class PrescriptionItemMapper {

    public PrescriptionItemResponse toResponse(
            PrescriptionItem item) {

        return PrescriptionItemResponse.builder()
                .id(item.getId())

                .medicineId(
                        item.getMedicine() != null
                                ? item.getMedicine().getId()
                                : null
                )

                .medicineName(
                        item.getMedicineName()
                )

                .strength(
                        item.getStrength()
                )

                .dosage(
                        item.getDosage()
                )

                .quantity(
                        item.getQuantity()
                )

                .frequency(
                        item.getFrequency()
                )

                .duration(
                        item.getDuration()
                )

                .instructions(
                        item.getInstructions()
                )

                .build();
    }
}
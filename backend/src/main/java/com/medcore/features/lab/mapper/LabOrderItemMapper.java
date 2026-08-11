package com.medcore.features.lab.mapper;

import com.medcore.features.lab.dto.response.LabOrderItemResponse;
import com.medcore.features.lab.entity.LabOrderItem;
import org.springframework.stereotype.Component;

@Component
public class LabOrderItemMapper {

    public LabOrderItemResponse toResponse(
            LabOrderItem item) {

        return LabOrderItemResponse.builder()
                .id(item.getId())
                .labTestId(item.getLabTest().getId())
                .testName(item.getLabTest().getName())
                .category(
                        item.getLabTest()
                                .getCategory()
                                .name()
                )
                .price(item.getLabTest().getPrice())
                .instructions(item.getInstructions())
                .build();
    }
}
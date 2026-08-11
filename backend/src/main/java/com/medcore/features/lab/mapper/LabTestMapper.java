package com.medcore.features.lab.mapper;

import com.medcore.features.lab.dto.request.CreateLabTestRequest;
import com.medcore.features.lab.dto.request.UpdateLabTestRequest;
import com.medcore.features.lab.dto.response.LabTestResponse;
import com.medcore.features.lab.entity.LabTest;
import org.springframework.stereotype.Component;

@Component
public class LabTestMapper {

    public LabTest toEntity(
            CreateLabTestRequest request) {

        return LabTest.builder()
                .name(request.getName().trim())
                .category(request.getCategory())
                .description(request.getDescription())
                .price(request.getPrice())
                .build();
    }

    public void updateEntity(
            LabTest labTest,
            UpdateLabTestRequest request) {

        labTest.setName(request.getName().trim());
        labTest.setCategory(request.getCategory());
        labTest.setDescription(request.getDescription());
        labTest.setPrice(request.getPrice());
    }

    public LabTestResponse toResponse(
            LabTest labTest) {

        return LabTestResponse.builder()
                .id(labTest.getId())
                .name(labTest.getName())
                .category(labTest.getCategory())
                .description(labTest.getDescription())
                .price(labTest.getPrice())
                .status(labTest.getStatus())
                .build();
    }
}
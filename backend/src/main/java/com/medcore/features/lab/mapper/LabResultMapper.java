package com.medcore.features.lab.mapper;

import com.medcore.features.lab.dto.request.CreateLabResultRequest;
import com.medcore.features.lab.dto.response.LabResultResponse;
import com.medcore.features.lab.entity.LabOrderItem;
import com.medcore.features.lab.entity.LabResult;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class LabResultMapper {

    public LabResult toEntity(
            CreateLabResultRequest request,
            LabOrderItem labOrderItem) {

        return LabResult.builder()
                .labOrderItem(labOrderItem)
                .resultValue(request.getResultValue())
                .unit(request.getUnit())
                .referenceRange(request.getReferenceRange())
                .remarks(request.getRemarks())
                .abnormal(
                        Boolean.TRUE.equals(request.getAbnormal())
                )
                .resultDate(LocalDateTime.now())
                .build();
    }

    public LabResultResponse toResponse(
            LabResult result) {

        LabOrderItem item =
                result.getLabOrderItem();

        return LabResultResponse.builder()
                .id(result.getId())
                .labOrderItemId(item.getId())
                .labOrderId(
                        item.getLabOrder().getId()
                )
                .labTestId(
                        item.getLabTest().getId()
                )
                .testName(
                        item.getLabTest().getName()
                )
                .resultValue(
                        result.getResultValue()
                )
                .unit(
                        result.getUnit()
                )
                .referenceRange(
                        result.getReferenceRange()
                )
                .remarks(
                        result.getRemarks()
                )
                .abnormal(
                        result.getAbnormal()
                )
                .resultDate(
                        result.getResultDate()
                )
                .build();
    }
}
package com.medcore.features.billing.mapper;

import com.medcore.features.billing.dto.request.AddBillItemRequest;
import com.medcore.features.billing.dto.response.BillItemResponse;
import com.medcore.features.billing.entity.Bill;
import com.medcore.features.billing.entity.BillItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class BillItemMapper {

    public BillItem toEntity(
            AddBillItemRequest request,
            Bill bill) {

        BigDecimal amount =
                request.getUnitPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        request.getQuantity()
                                )
                        );

        return BillItem.builder()
                .bill(bill)
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .amount(amount)
                .build();
    }

    public BillItemResponse toResponse(
            BillItem item) {

        return BillItemResponse.builder()
                .id(item.getId())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .amount(item.getAmount())
                .build();
    }
}
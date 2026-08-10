package com.medcore.features.billing.mapper;

import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.entity.Bill;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BillMapper {

    public BillResponse toResponse(
            Bill bill,
            List<com.medcore.features.billing.dto.response.BillItemResponse> items) {

        return BillResponse.builder()
                .id(bill.getId())
                .patientId(
                        bill.getPatient().getId()
                )
                .hospitalId(
                        bill.getHospital().getId()
                )
                .appointmentId(
                        bill.getAppointment() != null
                                ? bill.getAppointment().getId()
                                : null
                )
                .billType(bill.getBillType())
                .status(bill.getStatus())
                .subtotal(bill.getSubtotal())
                .discount(bill.getDiscount())
                .tax(bill.getTax())
                .totalAmount(bill.getTotalAmount())
                .paidAmount(bill.getPaidAmount())
                .paymentMethod(bill.getPaymentMethod())
                .billDate(bill.getBillDate())
                .paidAt(bill.getPaidAt())
                .items(items)
                .build();
    }
}
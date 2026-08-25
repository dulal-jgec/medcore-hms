package com.medcore.features.payment.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.billing.entity.Bill;
import com.medcore.features.billing.enums.BillingStatus;
import com.medcore.features.billing.repository.BillRepository;

import com.medcore.features.payment.dto.request.CreatePaymentRequest;
import com.medcore.features.payment.dto.response.PaymentOrderResponse;

import com.medcore.features.payment.entity.Payment;

import com.medcore.features.payment.enums.PaymentStatus;

import com.medcore.features.payment.gateway.PaymentGateway;
import com.medcore.features.payment.gateway.dto.GatewayOrderResponse;

import com.medcore.features.payment.repository.PaymentRepository;
import com.medcore.features.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl
        implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final PaymentGateway paymentGateway;
    private final TenantContextService tenantContextService;


    @Override
    @Transactional
    public ApiResponse<PaymentOrderResponse> createPaymentOrder(
            CreatePaymentRequest request) {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {

            throw new BusinessException(
                    "Hospital context is required"
            );
        }


      
        Bill bill =
                billRepository
                        .findByIdAndHospitalIdForUpdate(
                                request.getBillId(),
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill not found"
                                )
                        );

 
        if (bill.getStatus()
                == BillingStatus.CANCELLED) {

            throw new BusinessException(
                    "Cancelled bills cannot be paid"
            );
        }


        
        if (bill.getStatus()
                == BillingStatus.PAID) {

            throw new BusinessException(
                    "Bill is already fully paid"
            );
        }


        BigDecimal totalAmount =
                bill.getTotalAmount() != null
                        ? bill.getTotalAmount()
                        : BigDecimal.ZERO;

        BigDecimal paidAmount =
                bill.getPaidAmount() != null
                        ? bill.getPaidAmount()
                        : BigDecimal.ZERO;


        BigDecimal dueAmount =
                totalAmount.subtract(
                        paidAmount
                );


        if (dueAmount.compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new BusinessException(
                    "No outstanding amount remains for this bill"
            );
        }

 
        String receipt =
                "bill_"
                        + bill.getId()
                        + "_"
                        + UUID.randomUUID()
                                .toString()
                                .replace("-", "")
                                .substring(0, 12);


         
        GatewayOrderResponse gatewayOrder =
                paymentGateway.createOrder(
                        receipt,
                        dueAmount,
                        "INR"
                );


         
        Payment payment =
                Payment.builder()
                        .hospital(
                                bill.getHospital()
                        )
                        .patient(
                                bill.getPatient()
                        )
                        .bill(bill)
                        .gatewayOrderId(
                                gatewayOrder.getOrderId()
                        )
                        .amount(
                                dueAmount
                        )
                        .currency(
                                gatewayOrder.getCurrency()
                        )
                        .status(
                                PaymentStatus.CREATED
                        )
                        .build();


        Payment savedPayment =
                paymentRepository.save(
                        payment
                );


        PaymentOrderResponse response =
                PaymentOrderResponse.builder()
                        .paymentId(
                                savedPayment.getId()
                        )
                        .gatewayOrderId(
                                savedPayment
                                        .getGatewayOrderId()
                        )
                        .amount(
                                savedPayment.getAmount()
                        )
                        .currency(
                                savedPayment.getCurrency()
                        )
                        .status(
                                savedPayment
                                        .getStatus()
                                        .name()
                        )
                        .build();


        return ApiResponse
                .<PaymentOrderResponse>builder()
                .success(true)
                .message(
                        "Payment order created successfully"
                )
                .data(response)
                .build();
    }
}
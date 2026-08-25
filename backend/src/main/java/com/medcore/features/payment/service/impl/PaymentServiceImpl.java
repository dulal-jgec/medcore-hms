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
import org.json.JSONObject;
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
    
    @Override
    @Transactional
    public void handleWebhook(
            String signature,
            String payload) {

        if (signature == null || signature.isBlank()) {

            throw new BusinessException(
                    "Missing Razorpay webhook signature"
            );
        }

        if (payload == null || payload.isBlank()) {

            throw new BusinessException(
                    "Empty webhook payload"
            );
        }

        boolean valid =
                paymentGateway.verifyWebhookSignature(
                        payload,
                        signature
                );

        if (!valid) {

            throw new BusinessException(
                    "Invalid Razorpay webhook signature"
            );
        }

        try {

            JSONObject webhook =
                    new JSONObject(payload);

            String event =
                    webhook.getString("event");

            System.out.println(
                    "Razorpay event: " + event
            );

            switch (event) {

                case "payment.captured" -> {

                    handlePaymentCaptured(
                            webhook
                    );
                }

                case "payment.failed" -> {

                    handlePaymentFailed(
                            webhook
                    );
                }

                default -> {

                    System.out.println(
                            "Ignoring unsupported Razorpay event: "
                                    + event
                    );
                }
            }

        } catch (BusinessException e) {

            throw e;

        } catch (Exception e) {

            throw new BusinessException(
                    "Failed to process Razorpay webhook"
            );
        }
    }
     
    
    private void handlePaymentCaptured(
            JSONObject webhook) {

        JSONObject paymentEntity =
                webhook
                        .getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

        String razorpayPaymentId =
                paymentEntity.getString("id");

        String razorpayOrderId =
                paymentEntity.getString("order_id");


        Payment payment =
                paymentRepository
                        .findByGatewayOrderId(
                                razorpayOrderId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found"
                                )
                        );


        // Webhook can be delivered more than once
        if (payment.getStatus()
                == PaymentStatus.SUCCESS) {

            return;
        }


        payment.setGatewayPaymentId(
                razorpayPaymentId
        );

        payment.setStatus(
                PaymentStatus.SUCCESS
        );

        payment.setPaidAt(
                java.time.LocalDateTime.now()
        );


        Bill bill =
                payment.getBill();

        BigDecimal currentPaid =
                bill.getPaidAmount() != null
                        ? bill.getPaidAmount()
                        : BigDecimal.ZERO;

        BigDecimal newPaidAmount =
                currentPaid.add(
                        payment.getAmount()
                );


        if (newPaidAmount.compareTo(
                bill.getTotalAmount()
        ) > 0) {

            throw new BusinessException(
                    "Payment amount exceeds bill due amount"
            );
        }


        bill.setPaidAmount(
                newPaidAmount
        );


        if (newPaidAmount.compareTo(
                bill.getTotalAmount()
        ) == 0) {

            bill.setStatus(
                    BillingStatus.PAID
            );

            bill.setPaidAt(
                    java.time.LocalDateTime.now()
            );

        } else {

            bill.setStatus(
                    BillingStatus.PARTIALLY_PAID
            );
        }


        paymentRepository.save(payment);

        billRepository.save(bill);
    }

     
    private void handlePaymentFailed(
            JSONObject webhook) {

        JSONObject paymentEntity =
                webhook
                        .getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

        String razorpayPaymentId =
                paymentEntity.getString("id");

        String razorpayOrderId =
                paymentEntity.getString("order_id");


        Payment payment =
                paymentRepository
                        .findByGatewayOrderId(
                                razorpayOrderId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found"
                                )
                        );


        // Never change a successful payment back to failed
        if (payment.getStatus()
                == PaymentStatus.SUCCESS) {

            return;
        }


        payment.setGatewayPaymentId(
                razorpayPaymentId
        );

        payment.setStatus(
                PaymentStatus.FAILED
        );

        paymentRepository.save(payment);
    }

}
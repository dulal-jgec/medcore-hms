package com.medcore.features.billing.service.impl;

import com.medcore.common.security.TenantContextService;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.PaymentResponse;
import com.medcore.features.billing.entity.Bill;
import com.medcore.features.billing.enums.BillingStatus;
import com.medcore.features.billing.enums.PaymentMethod;
import com.medcore.features.billing.repository.BillItemRepository;
import com.medcore.features.billing.repository.BillRepository;
import com.medcore.features.billing.mapper.BillItemMapper;
import com.medcore.features.billing.mapper.BillMapper;
import com.medcore.features.appointment.repository.AppointmentRepository;
import com.medcore.features.user.repository.UserRepository;
import com.medcore.common.exception.BusinessException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceImplTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BillMapper billMapper;

    @Mock
    private BillItemRepository billItemRepository;

    @Mock
    private BillItemMapper billItemMapper;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private BillingServiceImpl billingService;

    @Test
    void payBill_shouldRecordPartialPayment() {

        // Arrange

        Long billId = 1L;
        Long hospitalId = 10L;

        Bill bill = Bill.builder()
                .hospital(null)
                .status(BillingStatus.PENDING)
                .totalAmount(new BigDecimal("1000.00"))
                .paidAmount(new BigDecimal("0.00"))
                .build();

        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("400.00"));
        request.setPaymentMethod(PaymentMethod.CASH);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(hospitalId);

        when(billRepository.findByIdAndHospitalIdForUpdate(
                billId,
                hospitalId
        )).thenReturn(Optional.of(bill));

        when(billRepository.save(bill))
                .thenReturn(bill);

        // Act

        var result =
                billingService.payBill(
                        billId,
                        request
                );

        // Assert

        assertEquals(
                new BigDecimal("400.00"),
                bill.getPaidAmount()
        );

        assertEquals(
                BillingStatus.PARTIALLY_PAID,
                bill.getStatus()
        );

        PaymentResponse response =
                result.getData();

        assertEquals(
                new BigDecimal("600.00"),
                response.getDueAmount()
        );

        assertEquals(
                new BigDecimal("400.00"),
                response.getPaidNow()
        );

        verify(
                billRepository
        ).save(bill);
    }
    
    @Test
    void payBill_shouldRejectPaymentGreaterThanDueAmount() {

        // Arrange

        Long billId = 1L;
        Long hospitalId = 10L;

        Bill bill = Bill.builder()
                .status(BillingStatus.PARTIALLY_PAID)
                .totalAmount(new BigDecimal("1000.00"))
                .paidAmount(new BigDecimal("400.00"))
                .build();

        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("700.00"));
        request.setPaymentMethod(PaymentMethod.CASH);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(hospitalId);

        when(billRepository.findByIdAndHospitalIdForUpdate(
                billId,
                hospitalId
        )).thenReturn(Optional.of(bill));

        // Act + Assert

        assertThrows(
                BusinessException.class,
                () -> billingService.payBill(
                        billId,
                        request
                )
        );

        // Verify database was NOT updated

        verify(
                billRepository,
                never()
        ).save(any(Bill.class));
    }
    
    @Test
    void payBill_shouldRejectAlreadyPaidBill() {

        // Arrange

        Long billId = 1L;
        Long hospitalId = 10L;

        Bill bill = Bill.builder()
                .status(BillingStatus.PAID)
                .totalAmount(new BigDecimal("1000.00"))
                .paidAmount(new BigDecimal("1000.00"))
                .build();

        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("100.00"));
        request.setPaymentMethod(PaymentMethod.CASH);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(hospitalId);

        when(billRepository.findByIdAndHospitalIdForUpdate(
                billId,
                hospitalId
        )).thenReturn(Optional.of(bill));

        // Act + Assert

        assertThrows(
                BusinessException.class,
                () -> billingService.payBill(
                        billId,
                        request
                )
        );

        // No database update

        verify(
                billRepository,
                never()
        ).save(any(Bill.class));
    }
    
    @Test
    void payBill_shouldRejectCancelledBill() {

        // Arrange

        Long billId = 1L;
        Long hospitalId = 10L;

        Bill bill = Bill.builder()
                .status(BillingStatus.CANCELLED)
                .totalAmount(new BigDecimal("1000.00"))
                .paidAmount(BigDecimal.ZERO)
                .build();

        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("500.00"));
        request.setPaymentMethod(PaymentMethod.CASH);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(hospitalId);

        when(billRepository.findByIdAndHospitalIdForUpdate(
                billId,
                hospitalId
        )).thenReturn(Optional.of(bill));

        // Act + Assert

        assertThrows(
                BusinessException.class,
                () -> billingService.payBill(
                        billId,
                        request
                )
        );

        verify(
                billRepository,
                never()
        ).save(any(Bill.class));
    }
    
    @Test
    void payBill_shouldMarkBillAsPaidForFullPayment() {

        // Arrange

        Long billId = 1L;
        Long hospitalId = 10L;

        Bill bill = Bill.builder()
                .status(BillingStatus.PENDING)
                .totalAmount(new BigDecimal("1000.00"))
                .paidAmount(BigDecimal.ZERO)
                .build();

        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("1000.00"));
        request.setPaymentMethod(PaymentMethod.UPI);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(hospitalId);

        when(billRepository.findByIdAndHospitalIdForUpdate(
                billId,
                hospitalId
        )).thenReturn(Optional.of(bill));

        when(billRepository.save(bill))
                .thenReturn(bill);

        // Act

        var result = billingService.payBill(
                billId,
                request
        );

        // Assert

        assertEquals(
                new BigDecimal("1000.00"),
                bill.getPaidAmount()
        );

        assertEquals(
                BillingStatus.PAID,
                bill.getStatus()
        );

        assertEquals(
                PaymentMethod.UPI,
                bill.getPaymentMethod()
        );

        PaymentResponse response = result.getData();

        assertEquals(
                BigDecimal.ZERO,
                response.getDueAmount().stripTrailingZeros()
        );

        assertEquals(
                new BigDecimal("1000.00"),
                response.getPaidNow()
        );

        assertEquals(
                BillingStatus.PAID,
                response.getStatus()
        );

        verify(billRepository).save(bill);
    }
}
package com.medcore.features.billing.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.repository.AppointmentRepository;

import com.medcore.features.billing.dto.request.AddBillItemRequest;
import com.medcore.features.billing.dto.request.CreateBillRequest;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.BillItemResponse;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.dto.response.PaymentResponse;

import com.medcore.features.billing.entity.Bill;
import com.medcore.features.billing.entity.BillItem;

import com.medcore.features.billing.enums.BillingStatus;

import com.medcore.features.billing.mapper.BillItemMapper;
import com.medcore.features.billing.mapper.BillMapper;

import com.medcore.features.billing.repository.BillItemRepository;
import com.medcore.features.billing.repository.BillRepository;

import com.medcore.features.billing.service.BillingService;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.entity.Patient;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl
        implements BillingService {

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final BillMapper billMapper;
    private final BillItemRepository billItemRepository;
    private final BillItemMapper billItemMapper;
    private final TenantContextService tenantContextService;

    private static final int MAX_PAGE_SIZE = 50;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "id",
                    "billDate",
                    "totalAmount",
                    "paidAmount",
                    "status",
                    "createdAt",
                    "updatedAt"
            );

    @Override
    @Transactional
    public ApiResponse<BillResponse> createBill(
            CreateBillRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Appointment appointment = null;

        if (request.getAppointmentId() != null) {

            appointment =
                    appointmentRepository
                            .findByIdAndDeletedAtIsNull(
                                    request.getAppointmentId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Appointment not found"
                                    ));

            if (appointment.getHospital() == null
                    || !appointment.getHospital()
                    .getId()
                    .equals(hospitalId)) {

                throw new BusinessException(
                        "You are not authorized to access this appointment"
                );
            }

            if (appointment.getPatient() == null) {

                throw new BusinessException(
                        "Appointment is not associated with a patient"
                );
            }

            if (appointment.getPatient().getHospital() == null
                    || !appointment.getPatient()
                    .getHospital()
                    .getId()
                    .equals(hospitalId)) {

                throw new BusinessException(
                        "Patient does not belong to the current hospital"
                );
            }
        }

        if (appointment == null) {

            throw new BusinessException(
                    "Appointment is required to create a bill"
            );
        }

        if (billRepository
                .existsByAppointmentIdAndDeletedAtIsNull(
                        appointment.getId()
                )) {

            throw new BusinessException(
                    "A bill already exists for this appointment"
            );
        }

        Patient patient =
                appointment.getPatient();

        Hospital hospital =
                appointment.getHospital();

        BigDecimal subtotal =
                request.getSubtotal() != null
                        ? request.getSubtotal()
                        : BigDecimal.ZERO;

        BigDecimal discount =
                request.getDiscount() != null
                        ? request.getDiscount()
                        : BigDecimal.ZERO;

        BigDecimal tax =
                request.getTax() != null
                        ? request.getTax()
                        : BigDecimal.ZERO;

        if (subtotal.compareTo(BigDecimal.ZERO) < 0) {

            throw new BusinessException(
                    "Subtotal cannot be negative"
            );
        }

        if (discount.compareTo(BigDecimal.ZERO) < 0) {

            throw new BusinessException(
                    "Discount cannot be negative"
            );
        }

        if (tax.compareTo(BigDecimal.ZERO) < 0) {

            throw new BusinessException(
                    "Tax cannot be negative"
            );
        }

        if (discount.compareTo(subtotal) > 0) {

            throw new BusinessException(
                    "Discount cannot be greater than subtotal"
            );
        }

        BigDecimal totalAmount =
                subtotal
                        .subtract(discount)
                        .add(tax);

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new BusinessException(
                    "Total amount cannot be negative"
            );
        }

        Bill bill =
                Bill.builder()
                        .patient(patient)
                        .hospital(hospital)
                        .appointment(appointment)
                        .billType(request.getBillType())
                        .status(BillingStatus.PENDING)
                        .subtotal(subtotal)
                        .discount(discount)
                        .tax(tax)
                        .totalAmount(totalAmount)
                        .paidAmount(BigDecimal.ZERO)
                        .billDate(LocalDateTime.now())
                        .build();

        Bill savedBill =
                billRepository.save(bill);

        return ApiResponse.<BillResponse>builder()
                .success(true)
                .message("Bill created successfully")
                .data(
                        billMapper.toResponse(
                                savedBill,
                                List.of()
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<BillItemResponse> addBillItem(
            Long billId,
            AddBillItemRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Bill bill =
                getBill(
                        billId,
                        hospitalId
                );

        validateBillModification(bill);

        BillItem item =
                billItemMapper.toEntity(
                        request,
                        bill
                );

        BillItem savedItem =
                billItemRepository.save(item);

        recalculateBill(bill);

        billRepository.save(bill);

        return ApiResponse.<BillItemResponse>builder()
                .success(true)
                .message(
                        "Bill item added successfully"
                )
                .data(
                        billItemMapper.toResponse(
                                savedItem
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<BillResponse> getBillById(
            Long billId) {

        Long hospitalId =
                getCurrentHospitalId();

        Bill bill =
                getBill(
                        billId,
                        hospitalId
                );

        List<BillItemResponse> items =
                getBillItems(bill.getId());

        return ApiResponse.<BillResponse>builder()
                .success(true)
                .message(
                        "Bill fetched successfully"
                )
                .data(
                        billMapper.toResponse(
                                bill,
                                items
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<BillItemResponse> updateBillItem(
            Long billId,
            Long itemId,
            AddBillItemRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Bill bill =
                getBill(
                        billId,
                        hospitalId
                );

        validateBillModification(bill);

        BillItem item =
                billItemRepository
                        .findByIdAndBillIdAndDeletedAtIsNull(
                                itemId,
                                billId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill item not found"
                                ));

        item.setDescription(
                request.getDescription()
        );

        item.setQuantity(
                request.getQuantity()
        );

        item.setUnitPrice(
                request.getUnitPrice()
        );

        item.setAmount(
                request.getUnitPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        request.getQuantity()
                                )
                        )
        );

        BillItem savedItem =
                billItemRepository.save(item);

        recalculateBill(bill);

        billRepository.save(bill);

        return ApiResponse.<BillItemResponse>builder()
                .success(true)
                .message(
                        "Bill item updated successfully"
                )
                .data(
                        billItemMapper.toResponse(
                                savedItem
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteBillItem(
            Long billId,
            Long itemId) {

        Long hospitalId =
                getCurrentHospitalId();

        Bill bill =
                getBill(
                        billId,
                        hospitalId
                );

        validateBillModification(bill);

        BillItem item =
                billItemRepository
                        .findByIdAndBillIdAndDeletedAtIsNull(
                                itemId,
                                billId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill item not found"
                                ));

        item.setDeletedAt(
                LocalDateTime.now()
        );

        billItemRepository.save(item);

        recalculateBill(bill);

        billRepository.save(bill);

        return ApiResponse.<Void>builder()
                .success(true)
                .message(
                        "Bill item deleted successfully"
                )
                .data(null)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<PaymentResponse> payBill(
            Long billId,
            PaymentRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Bill bill =
                billRepository
                        .findByIdAndHospitalIdForUpdate(
                                billId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill not found"
                                ));

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

        if (request.getAmount() == null
                || request.getAmount()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    "Payment amount must be greater than zero"
            );
        }

        BigDecimal totalAmount =
                bill.getTotalAmount() != null
                        ? bill.getTotalAmount()
                        : BigDecimal.ZERO;

        BigDecimal currentPaid =
                bill.getPaidAmount() != null
                        ? bill.getPaidAmount()
                        : BigDecimal.ZERO;

        BigDecimal dueAmount =
                totalAmount.subtract(currentPaid);

        if (dueAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    "No outstanding amount remains for this bill"
            );
        }

        if (request.getAmount()
                .compareTo(dueAmount) > 0) {

            throw new BusinessException(
                    "Payment amount cannot be greater than due amount"
            );
        }

        BigDecimal newPaidAmount =
                currentPaid.add(
                        request.getAmount()
                );

        bill.setPaidAmount(
                newPaidAmount
        );

        bill.setPaymentMethod(
                request.getPaymentMethod()
        );

        if (newPaidAmount.compareTo(totalAmount) == 0) {

            bill.setStatus(
                    BillingStatus.PAID
            );

            bill.setPaidAt(
                    LocalDateTime.now()
            );

        } else {

            bill.setStatus(
                    BillingStatus.PARTIALLY_PAID
            );
        }

        Bill savedBill =
                billRepository.save(bill);

        BigDecimal remainingDue =
                savedBill.getTotalAmount()
                        .subtract(
                                savedBill.getPaidAmount()
                        );

        PaymentResponse response =
                PaymentResponse.builder()
                        .billId(savedBill.getId())
                        .totalAmount(
                                savedBill.getTotalAmount()
                        )
                        .paidAmount(
                                savedBill.getPaidAmount()
                        )
                        .dueAmount(
                                remainingDue
                        )
                        .paidNow(
                                request.getAmount()
                        )
                        .paymentMethod(
                                savedBill.getPaymentMethod()
                        )
                        .status(
                                savedBill.getStatus()
                        )
                        .paidAt(
                                savedBill.getPaidAt()
                        )
                        .build();

        return ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message(
                        savedBill.getStatus()
                                == BillingStatus.PAID
                                ? "Bill paid successfully"
                                : "Partial payment recorded successfully"
                )
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<PageResponse<BillResponse>>
    getHospitalBills(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Long hospitalId =
                getCurrentHospitalId();

        Pageable pageable =
                createPageable(
                        page,
                        size,
                        sortBy,
                        sortDir
                );

        Page<Bill> billPage =
                billRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId,
                                pageable
                        );

        return buildPageResponse(
                billPage,
                "Hospital bills fetched successfully"
        );
    }

    @Override
    public ApiResponse<PageResponse<BillResponse>>
    getOutstandingBills(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Long hospitalId =
                getCurrentHospitalId();

        List<BillingStatus> outstandingStatuses =
                List.of(
                        BillingStatus.PENDING,
                        BillingStatus.PARTIALLY_PAID
                );

        Pageable pageable =
                createPageable(
                        page,
                        size,
                        sortBy,
                        sortDir
                );

        Page<Bill> billPage =
                billRepository
                        .findByHospitalIdAndStatusInAndDeletedAtIsNull(
                                hospitalId,
                                outstandingStatuses,
                                pageable
                        );

        return buildPageResponse(
                billPage,
                "Outstanding bills fetched successfully"
        );
    }

    private Bill getBill(
            Long billId,
            Long hospitalId) {

        return billRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        billId,
                        hospitalId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bill not found"
                        ));
    }

    private void validateBillModification(
            Bill bill) {

        if (bill.getStatus()
                == BillingStatus.PAID
                || bill.getStatus()
                == BillingStatus.CANCELLED) {

            throw new BusinessException(
                    "Paid or cancelled bills cannot be modified"
            );
        }
    }

    private List<BillItemResponse> getBillItems(
            Long billId) {

        return billItemRepository
                .findByBillIdAndDeletedAtIsNull(
                        billId
                )
                .stream()
                .map(billItemMapper::toResponse)
                .toList();
    }

    private void recalculateBill(
            Bill bill) {

        List<BillItem> items =
                billItemRepository
                        .findByBillIdAndDeletedAtIsNull(
                                bill.getId()
                        );

        BigDecimal subtotal =
                items.stream()
                        .map(BillItem::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal discount =
                bill.getDiscount() != null
                        ? bill.getDiscount()
                        : BigDecimal.ZERO;

        BigDecimal tax =
                bill.getTax() != null
                        ? bill.getTax()
                        : BigDecimal.ZERO;

        if (discount.compareTo(subtotal) > 0) {

            throw new BusinessException(
                    "Discount cannot be greater than subtotal"
            );
        }

        BigDecimal total =
                subtotal
                        .subtract(discount)
                        .add(tax);

        bill.setSubtotal(subtotal);
        bill.setTotalAmount(total);

        if (bill.getPaidAmount() != null
                && bill.getPaidAmount()
                .compareTo(total) > 0) {

            throw new BusinessException(
                    "Updated bill total cannot be less than already paid amount"
            );
        }
    }

    private Pageable createPageable(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        if (page < 0) {

            throw new BusinessException(
                    "Page number cannot be negative"
            );
        }

        if (size <= 0) {

            throw new BusinessException(
                    "Page size must be greater than zero"
            );
        }

        if (size > MAX_PAGE_SIZE) {

            throw new BusinessException(
                    "Page size cannot exceed "
                            + MAX_PAGE_SIZE
            );
        }

        if (sortBy == null
                || !ALLOWED_SORT_FIELDS
                .contains(sortBy)) {

            throw new BusinessException(
                    "Invalid sort field"
            );
        }

        Sort.Direction direction =
                "desc".equalsIgnoreCase(sortDir)
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        return PageRequest.of(
                page,
                size,
                Sort.by(
                        direction,
                        sortBy
                )
        );
    }

    private ApiResponse<PageResponse<BillResponse>>
    buildPageResponse(
            Page<Bill> billPage,
            String message) {

        List<BillResponse> items =
                billPage
                        .getContent()
                        .stream()
                        .map(bill -> {

                            List<BillItemResponse> billItems =
                                    getBillItems(
                                            bill.getId()
                                    );

                            return billMapper.toResponse(
                                    bill,
                                    billItems
                            );
                        })
                        .toList();

        PageResponse<BillResponse> response =
                PageResponse
                        .<BillResponse>builder()
                        .items(items)
                        .page(
                                billPage.getNumber()
                        )
                        .size(
                                billPage.getSize()
                        )
                        .totalElements(
                                billPage.getTotalElements()
                        )
                        .totalPages(
                                billPage.getTotalPages()
                        )
                        .first(
                                billPage.isFirst()
                        )
                        .last(
                                billPage.isLast()
                        )
                        .hasNext(
                                billPage.hasNext()
                        )
                        .hasPrevious(
                                billPage.hasPrevious()
                        )
                        .build();

        return ApiResponse
                .<PageResponse<BillResponse>>builder()
                .success(true)
                .message(message)
                .data(response)
                .build();
    }

    private Long getCurrentHospitalId() {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {

            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return hospitalId;
    }

    private User getCurrentUser() {

        String email =
                SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }
}
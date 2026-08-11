package com.medcore.features.billing.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;

import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.repository.AppointmentRepository;

import com.medcore.features.billing.dto.request.CreateBillRequest;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.entity.Bill;
import com.medcore.features.billing.enums.BillingStatus;
import com.medcore.features.billing.mapper.BillMapper;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.medcore.features.billing.dto.request.AddBillItemRequest;
import com.medcore.features.billing.dto.response.BillItemResponse;
import com.medcore.features.billing.entity.BillItem;
import com.medcore.features.billing.mapper.BillItemMapper;
import com.medcore.features.billing.repository.BillItemRepository;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.PaymentResponse;
import com.medcore.features.billing.enums.BillingStatus;

import java.math.BigDecimal;
@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final BillMapper billMapper;
    private final BillItemRepository billItemRepository;
    private final BillItemMapper billItemMapper;
    
    
    @Override
    public ApiResponse<BillResponse> createBill(
            CreateBillRequest request) {

        // 1. Get logged-in user
        User currentUser = getCurrentUser();

        // 2. Patient must belong to current hospital
        if (currentUser.getHospital() == null) {

            throw new BusinessException(
                    "You are not associated with any hospital"
            );
        }

        // 3. Find appointment if provided
        Appointment appointment = null;

        if (request.getAppointmentId() != null) {

            appointment = appointmentRepository
                    .findByIdAndDeletedAtIsNull(
                            request.getAppointmentId()
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Appointment not found"
                            ));

            // Hospital isolation
            if (appointment.getHospital() == null
                    || !appointment.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

                throw new BusinessException(
                        "You are not authorized to access this hospital data"
                );
            }
        }

        // 4. Determine patient
        Patient patient;

        if (appointment != null) {

            patient = appointment.getPatient();

        } else {

            throw new BusinessException(
                    "Appointment is required to create a bill"
            );
        }

        // 5. Prevent duplicate appointment bill
        if (billRepository
                .existsByAppointmentIdAndDeletedAtIsNull(
                        appointment.getId()
                )) {

            throw new BusinessException(
                    "A bill already exists for this appointment"
            );
        }

        // 6. Hospital
        Hospital hospital =
                appointment.getHospital();

        // 7. Validate discount and tax
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

        if (discount.compareTo(subtotal) > 0) {

            throw new BusinessException(
                    "Discount cannot be greater than subtotal"
            );
        }

        // 8. Calculate total
        BigDecimal totalAmount =
                subtotal
                        .subtract(discount)
                        .add(tax);

        // 9. Build bill
        Bill bill = Bill.builder()
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

        // 10. Save
        Bill savedBill =
                billRepository.save(bill);

        // 11. Response
        BillResponse response =
                billMapper.toResponse(
                        savedBill,
                        List.of()
                );

        return ApiResponse.<BillResponse>builder()
                .success(true)
                .message("Bill created successfully")
                .data(response)
                .build();
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
    
    @Override
    public ApiResponse<BillItemResponse> addBillItem(
            Long billId,
            AddBillItemRequest request) {

        // 1. Get logged-in user
        User currentUser = getCurrentUser();

        // 2. Find bill
        Bill bill =
                billRepository
                        .findByIdAndDeletedAtIsNull(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill not found"
                                ));

        // 3. Hospital isolation
        if (currentUser.getHospital() == null
                || bill.getHospital() == null
                || !bill.getHospital().getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        // 4. Cannot modify paid/cancelled bill
        if (bill.getStatus() == BillingStatus.PAID
                || bill.getStatus() == BillingStatus.CANCELLED) {

            throw new BusinessException(
                    "Paid or cancelled bills cannot be modified"
            );
        }

        // 5. Build bill item
        BillItem item =
                billItemMapper.toEntity(
                        request,
                        bill
                );

        // 6. Save item
        BillItem savedItem =
                billItemRepository.save(item);

        // 7. Recalculate bill
        recalculateBill(bill);

        // 8. Save updated bill
        billRepository.save(bill);

        // 9. Response
        return ApiResponse.<BillItemResponse>builder()
                .success(true)
                .message("Bill item added successfully")
                .data(
                        billItemMapper.toResponse(
                                savedItem
                        )
                )
                .build();
        
        
    }
    
    private void recalculateBill(Bill bill) {

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

        BigDecimal total =
                subtotal
                        .subtract(discount)
                        .add(tax);

        bill.setSubtotal(subtotal);
        bill.setTotalAmount(total);
    }
    
    @Override
    public ApiResponse<BillResponse> getBillById(
            Long billId) {

        User currentUser = getCurrentUser();

        Bill bill =
                billRepository
                        .findByIdAndDeletedAtIsNull(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill not found"
                                ));

        if (currentUser.getHospital() == null
                || bill.getHospital() == null
                || !bill.getHospital().getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        List<BillItemResponse> items =
                billItemRepository
                        .findByBillIdAndDeletedAtIsNull(
                                bill.getId()
                        )
                        .stream()
                        .map(billItemMapper::toResponse)
                        .toList();

        return ApiResponse.<BillResponse>builder()
                .success(true)
                .message("Bill fetched successfully")
                .data(
                        billMapper.toResponse(
                                bill,
                                items
                        )
                )
                .build();
    }
    
    @Override
    public ApiResponse<BillItemResponse> updateBillItem(
            Long billId,
            Long itemId,
            AddBillItemRequest request) {

        User currentUser = getCurrentUser();

        Bill bill =
                billRepository
                        .findByIdAndDeletedAtIsNull(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill not found"
                                ));

        if (currentUser.getHospital() == null
                || bill.getHospital() == null
                || !bill.getHospital().getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (bill.getStatus() == BillingStatus.PAID
                || bill.getStatus() == BillingStatus.CANCELLED) {

            throw new BusinessException(
                    "Paid or cancelled bills cannot be modified"
            );
        }

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
                .message("Bill item updated successfully")
                .data(
                        billItemMapper.toResponse(
                                savedItem
                        )
                )
                .build();
    }
    
    
    @Override
    public ApiResponse<Void> deleteBillItem(
            Long billId,
            Long itemId) {

        User currentUser = getCurrentUser();

        Bill bill =
                billRepository
                        .findByIdAndDeletedAtIsNull(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill not found"
                                ));

        if (currentUser.getHospital() == null
                || bill.getHospital() == null
                || !bill.getHospital().getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (bill.getStatus() == BillingStatus.PAID
                || bill.getStatus() == BillingStatus.CANCELLED) {

            throw new BusinessException(
                    "Paid or cancelled bills cannot be modified"
            );
        }

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
                java.time.LocalDateTime.now()
        );

        billItemRepository.save(item);

        recalculateBill(bill);

        billRepository.save(bill);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Bill item deleted successfully")
                .data(null)
                .build();
    }
    
    @Override
    public ApiResponse<PaymentResponse> payBill(
            Long billId,
            PaymentRequest request) {

        // 1. Get logged-in user
        User currentUser = getCurrentUser();

        // 2. Find bill
        Bill bill =
                billRepository
                        .findByIdAndDeletedAtIsNull(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill not found"
                                ));

        // 3. Hospital isolation
        if (currentUser.getHospital() == null
                || bill.getHospital() == null
                || !bill.getHospital().getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        // 4. Cancelled bill cannot be paid
        if (bill.getStatus() == BillingStatus.CANCELLED) {

            throw new BusinessException(
                    "Cancelled bills cannot be paid"
            );
        }

        // 5. Already fully paid
        if (bill.getStatus() == BillingStatus.PAID) {

            throw new BusinessException(
                    "Bill is already fully paid"
            );
        }

        // 6. Validate payment amount
        if (request.getAmount() == null
                || request.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    "Payment amount must be greater than zero"
            );
        }

        // 7. Calculate current due amount
        BigDecimal currentPaid =
                bill.getPaidAmount() != null
                        ? bill.getPaidAmount()
                        : BigDecimal.ZERO;

        BigDecimal dueAmount =
                bill.getTotalAmount()
                        .subtract(currentPaid);

        // 8. Prevent overpayment
        if (request.getAmount()
                .compareTo(dueAmount) > 0) {

            throw new BusinessException(
                    "Payment amount cannot be greater than due amount"
            );
        }

        // 9. Add payment
        BigDecimal newPaidAmount =
                currentPaid.add(
                        request.getAmount()
                );

        bill.setPaidAmount(newPaidAmount);

        bill.setPaymentMethod(
                request.getPaymentMethod()
        );

        // 10. Update status
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

        // 11. Save
        Bill savedBill =
                billRepository.save(bill);

        // 12. Calculate remaining due
        BigDecimal remainingDue =
                savedBill.getTotalAmount()
                        .subtract(
                                savedBill.getPaidAmount()
                        );

        // 13. Response
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
    public ApiResponse<PageResponse<BillResponse>> getHospitalBills(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        User currentUser = getCurrentUser();

        if (currentUser.getHospital() == null) {
            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        Long hospitalId =
                currentUser.getHospital().getId();

        Sort.Direction direction =
                sortDir.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(direction, sortBy)
                );

        Page<Bill> billPage =
                billRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId,
                                pageable
                        );

        List<BillResponse> items =
                billPage.getContent()
                        .stream()
                        .map(bill -> {

                            List<BillItemResponse> billItems =
                                    billItemRepository
                                            .findByBillIdAndDeletedAtIsNull(
                                                    bill.getId()
                                            )
                                            .stream()
                                            .map(billItemMapper::toResponse)
                                            .toList();

                            return billMapper.toResponse(
                                    bill,
                                    billItems
                            );
                        })
                        .toList();

        PageResponse<BillResponse> response =
                PageResponse.<BillResponse>builder()
                        .items(items)
                        .page(billPage.getNumber())
                        .size(billPage.getSize())
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
                .message("Hospital bills fetched successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<PageResponse<BillResponse>> getOutstandingBills(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        User currentUser = getCurrentUser();

        if (currentUser.getHospital() == null) {
            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        Long hospitalId =
                currentUser.getHospital().getId();

        List<BillingStatus> outstandingStatuses =
                List.of(
                        BillingStatus.PENDING,
                        BillingStatus.PARTIALLY_PAID
                );

        Sort.Direction direction =
                sortDir.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(direction, sortBy)
                );

        Page<Bill> billPage =
                billRepository
                        .findByHospitalIdAndStatusInAndDeletedAtIsNull(
                                hospitalId,
                                outstandingStatuses,
                                pageable
                        );

        List<BillResponse> items =
                billPage.getContent()
                        .stream()
                        .map(bill -> {

                            List<BillItemResponse> billItems =
                                    billItemRepository
                                            .findByBillIdAndDeletedAtIsNull(
                                                    bill.getId()
                                            )
                                            .stream()
                                            .map(billItemMapper::toResponse)
                                            .toList();

                            return billMapper.toResponse(
                                    bill,
                                    billItems
                            );
                        })
                        .toList();

        PageResponse<BillResponse> response =
                PageResponse.<BillResponse>builder()
                        .items(items)
                        .page(billPage.getNumber())
                        .size(billPage.getSize())
                        .totalElements(
                                billPage.getTotalElements()
                        )
                        .totalPages(
                                billPage.getTotalPages()
                        )
                        .first(billPage.isFirst())
                        .last(billPage.isLast())
                        .hasNext(billPage.hasNext())
                        .hasPrevious(billPage.hasPrevious())
                        .build();

        return ApiResponse
                .<PageResponse<BillResponse>>builder()
                .success(true)
                .message("Outstanding bills fetched successfully")
                .data(response)
                .build();
    }
}
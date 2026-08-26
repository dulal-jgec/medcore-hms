package com.medcore.features.accountant.service.impl;

import com.medcore.common.exception.BusinessException;

import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.accountant.dto.request.CreateAccountantRequest;
import com.medcore.features.accountant.dto.request.UpdateAccountantRequest;
import com.medcore.features.accountant.dto.response.AccountantDashboardResponse;
import com.medcore.features.accountant.dto.response.AccountantResponse;
import com.medcore.features.accountant.dto.response.FinancialReportResponse;
import com.medcore.features.accountant.dto.response.FinancialSummaryResponse;
import com.medcore.features.accountant.dto.response.PaymentMethodCollectionResponse;
import com.medcore.features.accountant.entity.Accountant;
import com.medcore.features.accountant.enums.AccountantStatus;
import com.medcore.features.accountant.mapper.AccountantMapper;
import com.medcore.features.accountant.repository.AccountantRepository;
import com.medcore.features.accountant.service.AccountantService;

import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.dto.response.PaymentResponse;
import com.medcore.features.billing.enums.BillingStatus;
import com.medcore.features.billing.enums.PaymentMethod;
import com.medcore.features.billing.repository.BillRepository;
import com.medcore.features.billing.service.BillingService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AccountantServiceImpl
        implements AccountantService {
	
	private static final Logger log= 
			LoggerFactory.getLogger(AccountantServiceImpl.class);

    private final AccountantRepository accountantRepository;
    private final UserRepository userRepository;
    private final AccountantMapper accountantMapper;
    private final BillingService billingService;
    private final BillRepository billRepository;
    private final TenantContextService tenantContextService;

    private Long getCurrentHospitalId() {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }
        
        

        return hospitalId;
    }


    @Override
    public ApiResponse<AccountantResponse> createAccountant(
            CreateAccountantRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        User user =
                userRepository
                        .findById(request.getUserId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        if (user.getRole() == null
                || user.getRole().getName()
                != RoleName.ACCOUNTANT) {

            throw new BusinessException(
                    "Selected user is not assigned the ACCOUNTANT role"
            );
        }

        if (user.getHospital() == null
                || !user.getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "User does not belong to the current hospital"
            );
        }

        if (accountantRepository
                .existsByUserIdAndDeletedAtIsNull(
                        user.getId()
                )) {

            throw new BusinessException(
                    "Accountant profile already exists for this user"
            );
        }

        Accountant accountant =
                accountantMapper.toEntity(
                        request,
                        user
                );

        accountant.setStatus(
                AccountantStatus.ACTIVE
        );

        Accountant savedAccountant =
                accountantRepository.save(
                        accountant
                );
        
        log.info(
                "Accountant created: accountantId={}, userId={}, hospitalId={}",
                savedAccountant.getId(),
                user.getId(),
                hospitalId
        );

        return ApiResponse.<AccountantResponse>builder()
                .success(true)
                .message(
                        "Accountant created successfully"
                )
                .data(
                        accountantMapper.toResponse(
                                savedAccountant
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<AccountantResponse>
    getAccountantById(
            Long accountantId) {

        Accountant accountant =
                getAccountant(accountantId);

        return ApiResponse.<AccountantResponse>builder()
                .success(true)
                .message(
                        "Accountant fetched successfully"
                )
                .data(
                        accountantMapper.toResponse(
                                accountant
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<List<AccountantResponse>>
    getAllAccountants() {

        Long hospitalId =
                getCurrentHospitalId();

        List<AccountantResponse> accountants =
                accountantRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .stream()
                        .map(accountantMapper::toResponse)
                        .toList();

        return ApiResponse
                .<List<AccountantResponse>>builder()
                .success(true)
                .message(
                        "Accountants fetched successfully"
                )
                .data(accountants)
                .build();
    }

    @Override
    public ApiResponse<AccountantResponse>
    updateAccountant(
            Long accountantId,
            UpdateAccountantRequest request) {

        Accountant accountant =
                getAccountant(accountantId);

        accountantMapper.updateEntity(
                accountant,
                request
        );

        Accountant updatedAccountant =
                accountantRepository.save(
                        accountant
                );

        return ApiResponse.<AccountantResponse>builder()
                .success(true)
                .message(
                        "Accountant updated successfully"
                )
                .data(
                        accountantMapper.toResponse(
                                updatedAccountant
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<Void> deleteAccountant(
            Long accountantId) {

        Accountant accountant =
                getAccountant(accountantId);

        accountant.setDeletedAt(
                LocalDateTime.now()
        );

        accountantRepository.save(
                accountant
        );
        
        log.info(
                "Accountant deleted: accountantId={}, hospitalId={}",
                accountantId,
                getCurrentHospitalId()
        );

        return ApiResponse.<Void>builder()
                .success(true)
                .message(
                        "Accountant deleted successfully"
                )
                .data(null)
                .build();
    }

    @Override
    public ApiResponse<AccountantResponse>
    activateAccountant(
            Long accountantId) {

        Accountant accountant =
                getAccountant(accountantId);

        accountant.setStatus(
                AccountantStatus.ACTIVE
        );

        Accountant savedAccountant =
                accountantRepository.save(
                        accountant
                );
        
        log.info(
                "Accountant activated: accountantId={}, hospitalId={}",
                accountantId,
                getCurrentHospitalId()
        );

        return ApiResponse.<AccountantResponse>builder()
                .success(true)
                .message(
                        "Accountant activated successfully"
                )
                .data(
                        accountantMapper.toResponse(
                                savedAccountant
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<AccountantResponse>
    deactivateAccountant(
            Long accountantId) {

        Accountant accountant =
                getAccountant(accountantId);

        accountant.setStatus(
                AccountantStatus.INACTIVE
        );

        Accountant savedAccountant =
                accountantRepository.save(
                        accountant
                );
        
        log.info(
                "Accountant deactivated: accountantId={}, hospitalId={}",
                accountantId,
                getCurrentHospitalId()
        );

        return ApiResponse.<AccountantResponse>builder()
                .success(true)
                .message(
                        "Accountant deactivated successfully"
                )
                .data(
                        accountantMapper.toResponse(
                                savedAccountant
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<PageResponse<BillResponse>>
    getHospitalBills(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        getActiveAccountant();

        return billingService.getHospitalBills(
                page,
                size,
                sortBy,
                sortDir
        );
    }

    @Override
    public ApiResponse<PageResponse<BillResponse>>
    getOutstandingBills(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        getActiveAccountant();

        return billingService.getOutstandingBills(
                page,
                size,
                sortBy,
                sortDir
        );
    }

    @Override
    public ApiResponse<FinancialSummaryResponse>
    getFinancialSummary() {

        getActiveAccountant();

        Long hospitalId =
                getCurrentHospitalId();

        Object[] result =
                billRepository.getFinancialSummary(
                        hospitalId,
                        BillingStatus.CANCELLED
                );

        long totalBills =
                ((Number) result[0]).longValue();

        BigDecimal totalBilledAmount =
                result[1] != null
                        ? (BigDecimal) result[1]
                        : BigDecimal.ZERO;

        BigDecimal totalPaidAmount =
                result[2] != null
                        ? (BigDecimal) result[2]
                        : BigDecimal.ZERO;

        BigDecimal totalOutstandingAmount =
                totalBilledAmount.subtract(
                        totalPaidAmount
                );

        FinancialSummaryResponse response =
                FinancialSummaryResponse.builder()
                        .totalBills(totalBills)
                        .totalBilledAmount(
                                totalBilledAmount
                        )
                        .totalPaidAmount(
                                totalPaidAmount
                        )
                        .totalOutstandingAmount(
                                totalOutstandingAmount
                        )
                        .build();

        return ApiResponse
                .<FinancialSummaryResponse>builder()
                .success(true)
                .message(
                        "Financial summary fetched successfully"
                )
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<FinancialReportResponse>
    getFinancialReport(
            LocalDate fromDate,
            LocalDate toDate) {

        getActiveAccountant();

        if (fromDate == null
                || toDate == null) {

            throw new BusinessException(
                    "From date and to date are required"
            );
        }

        if (fromDate.isAfter(toDate)) {

            throw new BusinessException(
                    "From date cannot be after to date"
            );
        }

        Long hospitalId =
                getCurrentHospitalId();

        LocalDateTime fromDateTime =
                fromDate.atStartOfDay();

        LocalDateTime toDateTime =
                toDate
                        .plusDays(1)
                        .atStartOfDay();

        Object[] result =
                billRepository.getFinancialReport(
                        hospitalId,
                        fromDateTime,
                        toDateTime,
                        BillingStatus.CANCELLED
                );

        long totalBills =
                ((Number) result[0]).longValue();

        BigDecimal totalBilledAmount =
                result[1] != null
                        ? (BigDecimal) result[1]
                        : BigDecimal.ZERO;

        BigDecimal totalPaidAmount =
                result[2] != null
                        ? (BigDecimal) result[2]
                        : BigDecimal.ZERO;

        BigDecimal totalOutstandingAmount =
                totalBilledAmount.subtract(
                        totalPaidAmount
                );
        
        log.info(
                "Financial report requested: hospitalId={}, fromDate={}, toDate={}",
                hospitalId,
                fromDate,
                toDate
        );

        FinancialReportResponse response =
                FinancialReportResponse.builder()
                        .fromDate(fromDate)
                        .toDate(toDate)
                        .totalBills(totalBills)
                        .totalBilledAmount(
                                totalBilledAmount
                        )
                        .totalPaidAmount(
                                totalPaidAmount
                        )
                        .totalOutstandingAmount(
                                totalOutstandingAmount
                        )
                        .build();

        return ApiResponse
                .<FinancialReportResponse>builder()
                .success(true)
                .message(
                        "Financial report fetched successfully"
                )
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<List<PaymentMethodCollectionResponse>>
    getPaymentMethodCollection() {

        getActiveAccountant();

        Long hospitalId =
                getCurrentHospitalId();

        List<Object[]> results =
                billRepository.getPaymentMethodCollection(
                        hospitalId,
                        BillingStatus.CANCELLED
                );
        
        

        List<PaymentMethodCollectionResponse>
                response =
                results.stream()
                        .map(row ->
                                PaymentMethodCollectionResponse
                                        .builder()
                                        .paymentMethod(
                                                (PaymentMethod) row[0]
                                        )
                                        .transactionCount(
                                                ((Number) row[1])
                                                        .longValue()
                                        )
                                        .collectedAmount(
                                                row[2] != null
                                                        ? (BigDecimal) row[2]
                                                        : BigDecimal.ZERO
                                        )
                                        .build()
                        )
                        .toList();

        return ApiResponse
                .<List<PaymentMethodCollectionResponse>>builder()
                .success(true)
                .message(
                        "Payment method collection fetched successfully"
                )
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<AccountantDashboardResponse>
    getDashboard() {

        getActiveAccountant();

        Long hospitalId =
                getCurrentHospitalId();

        Object[] summary =
                billRepository.getFinancialSummary(
                        hospitalId,
                        BillingStatus.CANCELLED
                );

        long totalBills =
                ((Number) summary[0]).longValue();

        BigDecimal totalBilledAmount =
                summary[1] != null
                        ? (BigDecimal) summary[1]
                        : BigDecimal.ZERO;

        BigDecimal totalPaidAmount =
                summary[2] != null
                        ? (BigDecimal) summary[2]
                        : BigDecimal.ZERO;

        BigDecimal totalOutstandingAmount =
                totalBilledAmount.subtract(
                        totalPaidAmount
                );

        long outstandingBills =
                billRepository
                        .countByHospitalIdAndStatusInAndDeletedAtIsNull(
                                hospitalId,
                                List.of(
                                        BillingStatus.PENDING,
                                        BillingStatus.PARTIALLY_PAID
                                )
                        );

        List<Object[]> results =
                billRepository.getPaymentMethodCollection(
                        hospitalId,
                        BillingStatus.CANCELLED
                );

        List<PaymentMethodCollectionResponse>
                paymentMethodCollection =
                results.stream()
                        .map(row ->
                                PaymentMethodCollectionResponse
                                        .builder()
                                        .paymentMethod(
                                                (PaymentMethod) row[0]
                                        )
                                        .transactionCount(
                                                ((Number) row[1])
                                                        .longValue()
                                        )
                                        .collectedAmount(
                                                row[2] != null
                                                        ? (BigDecimal) row[2]
                                                        : BigDecimal.ZERO
                                        )
                                        .build()
                        )
                        .toList();

        AccountantDashboardResponse response =
                AccountantDashboardResponse.builder()
                        .totalBills(totalBills)
                        .totalBilledAmount(
                                totalBilledAmount
                        )
                        .totalPaidAmount(
                                totalPaidAmount
                        )
                        .totalOutstandingAmount(
                                totalOutstandingAmount
                        )
                        .outstandingBills(
                                outstandingBills
                        )
                        .paymentMethodCollection(
                                paymentMethodCollection
                        )
                        .build();

        return ApiResponse
                .<AccountantDashboardResponse>builder()
                .success(true)
                .message(
                        "Accountant dashboard fetched successfully"
                )
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<PaymentResponse> payBill(
            Long billId,
            PaymentRequest request) {

        getActiveAccountant();

        ApiResponse<PaymentResponse> response =
                billingService.payBill(
                        billId,
                        request
                );

        log.info(
                "Bill payment processed by accountant: billId={}, hospitalId={}",
                billId,
                getCurrentHospitalId()
        );

        return response;
    }
    
    
    
    private Accountant getAccountant(
            Long accountantId) {

        Long hospitalId =
                getCurrentHospitalId();

        return accountantRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        accountantId,
                        hospitalId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Accountant not found"
                        ));
    }

    private Accountant getActiveAccountant() {

        Long hospitalId =
                getCurrentHospitalId();

        User currentUser =
                getCurrentUser();

        Accountant accountant =
                accountantRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only accountants can access financial data"
                                ));

        if (accountant.getHospital() == null
                || !accountant.getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (accountant.getStatus()
                != AccountantStatus.ACTIVE) {

            throw new BusinessException(
                    "Inactive accountants cannot access financial data"
            );
        }

        return accountant;
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
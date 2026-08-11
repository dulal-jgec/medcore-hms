package com.medcore.features.accountant.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;

import com.medcore.features.accountant.dto.request.CreateAccountantRequest;
import com.medcore.features.accountant.dto.request.UpdateAccountantRequest;
import com.medcore.features.accountant.dto.response.AccountantDashboardResponse;
import com.medcore.features.accountant.dto.response.AccountantResponse;
import com.medcore.features.accountant.dto.response.FinancialReportResponse;
import com.medcore.features.accountant.dto.response.FinancialSummaryResponse;
import com.medcore.features.accountant.entity.Accountant;
import com.medcore.features.accountant.enums.AccountantStatus;
import com.medcore.features.accountant.mapper.AccountantMapper;
import com.medcore.features.accountant.repository.AccountantRepository;
import com.medcore.features.accountant.service.AccountantService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import com.medcore.features.accountant.dto.response.PaymentMethodCollectionResponse;
import com.medcore.features.billing.enums.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;
 import java.time.LocalDate;
import java.time.LocalDateTime;
 import com.medcore.common.response.PageResponse;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.dto.response.PaymentResponse;
import com.medcore.features.billing.enums.BillingStatus;
import com.medcore.features.billing.repository.BillRepository;
import com.medcore.features.billing.service.BillingService;
@Service
@RequiredArgsConstructor
public class AccountantServiceImpl
        implements AccountantService {

    private final AccountantRepository accountantRepository;
    private final UserRepository userRepository;
    private final AccountantMapper accountantMapper;
    private final BillingService billingService;
    private final BillRepository billRepository;

     // Create Accountant
    

    @Override
    public ApiResponse<AccountantResponse> createAccountant(
            CreateAccountantRequest request) {

        User currentUser = getCurrentUser();

        if (currentUser.getHospital() == null) {

            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        User user =
                userRepository
                        .findById(request.getUserId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        if (user.getHospital() == null
                || !user.getHospital().getId()
                        .equals(
                                currentUser
                                        .getHospital()
                                        .getId()
                        )) {

            throw new BusinessException(
                    "User does not belong to your hospital"
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

        return ApiResponse.<AccountantResponse>builder()
                .success(true)
                .message("Accountant created successfully")
                .data(
                        accountantMapper.toResponse(
                                savedAccountant
                        )
                )
                .build();
    }


     // Get Accountant
 
    @Override
    public ApiResponse<AccountantResponse> getAccountantById(
            Long accountantId) {

        User currentUser = getCurrentUser();

        Accountant accountant =
                getAccountant(accountantId);

        validateHospitalAccess(
                accountant,
                currentUser
        );

        return ApiResponse.<AccountantResponse>builder()
                .success(true)
                .message("Accountant fetched successfully")
                .data(
                        accountantMapper.toResponse(
                                accountant
                        )
                )
                .build();
    }


     // Get All Accountants
 
    @Override
    public ApiResponse<List<AccountantResponse>>
    getAllAccountants() {

        User currentUser = getCurrentUser();

        if (currentUser.getHospital() == null) {

            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        Long hospitalId =
                currentUser
                        .getHospital()
                        .getId();

        List<AccountantResponse> accountants =
                accountantRepository
                        .findAll()
                        .stream()
                        .filter(accountant ->
                                accountant.getDeletedAt() == null
                        )
                        .filter(accountant ->
                                accountant.getHospital() != null
                                        && accountant
                                                .getHospital()
                                                .getId()
                                                .equals(hospitalId)
                        )
                        .map(
                                accountantMapper::toResponse
                        )
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


     // Update Accountant
 
    @Override
    public ApiResponse<AccountantResponse> updateAccountant(
            Long accountantId,
            UpdateAccountantRequest request) {

        User currentUser = getCurrentUser();

        Accountant accountant =
                getAccountant(accountantId);

        validateHospitalAccess(
                accountant,
                currentUser
        );

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
                .message("Accountant updated successfully")
                .data(
                        accountantMapper.toResponse(
                                updatedAccountant
                        )
                )
                .build();
    }


     // Delete Accountant
 
    @Override
    public ApiResponse<Void> deleteAccountant(
            Long accountantId) {

        User currentUser = getCurrentUser();

        Accountant accountant =
                getAccountant(accountantId);

        validateHospitalAccess(
                accountant,
                currentUser
        );

        accountant.setDeletedAt(
                LocalDateTime.now()
        );

        accountantRepository.save(
                accountant
        );

        return ApiResponse.<Void>builder()
                .success(true)
                .message(
                        "Accountant deleted successfully"
                )
                .data(null)
                .build();
    }


     // Activate Accountant
 
    @Override
    public ApiResponse<AccountantResponse>
    activateAccountant(
            Long accountantId) {

        User currentUser = getCurrentUser();

        Accountant accountant =
                getAccountant(accountantId);

        validateHospitalAccess(
                accountant,
                currentUser
        );

        accountant.setStatus(
                AccountantStatus.ACTIVE
        );

        Accountant savedAccountant =
                accountantRepository.save(
                        accountant
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


     // Deactivate Accountant
 
    @Override
    public ApiResponse<AccountantResponse>
    deactivateAccountant(
            Long accountantId) {

        User currentUser = getCurrentUser();

        Accountant accountant =
                getAccountant(accountantId);

        validateHospitalAccess(
                accountant,
                currentUser
        );

        accountant.setStatus(
                AccountantStatus.INACTIVE
        );

        Accountant savedAccountant =
                accountantRepository.save(
                        accountant
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


     // Helpers
 
    private Accountant getAccountant(
            Long accountantId) {

        return accountantRepository
                .findByIdAndDeletedAtIsNull(
                        accountantId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Accountant not found"
                        )
                );
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


    private void validateHospitalAccess(
            Accountant accountant,
            User currentUser) {

        if (currentUser.getHospital() == null
                || accountant.getHospital() == null
                || !accountant
                        .getHospital()
                        .getId()
                        .equals(
                                currentUser
                                        .getHospital()
                                        .getId()
                        )) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }
    }
@Override
public ApiResponse<PageResponse<BillResponse>> getHospitalBills(
        int page,
        int size,
        String sortBy,
        String sortDir) {

    User currentUser = getCurrentUser();

    Accountant accountant =
            accountantRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only accountants can access financial data"
                            ));

    if (accountant.getStatus()
            != AccountantStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive accountants cannot access financial data"
        );
    }

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    return billingService.getHospitalBills(
            page,
            size,
            sortBy,
            sortDir
    );
}		

@Override
public ApiResponse<PageResponse<BillResponse>> getOutstandingBills(
        int page,
        int size,
        String sortBy,
        String sortDir) {

    User currentUser = getCurrentUser();

    Accountant accountant =
            accountantRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only accountants can access financial data"
                            ));

    if (accountant.getStatus()
            != AccountantStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive accountants cannot access financial data"
        );
    }

    if (currentUser.getHospital() == null) {
        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    return billingService.getOutstandingBills(
            page,
            size,
            sortBy,
            sortDir
    );
}		
@Override
public ApiResponse<FinancialSummaryResponse> getFinancialSummary() {

    User currentUser = getCurrentUser();

    Accountant accountant =
            accountantRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only accountants can access financial data"
                            ));

    if (accountant.getStatus()
            != AccountantStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive accountants cannot access financial data"
        );
    }

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    Long hospitalId =
            currentUser.getHospital().getId();

    Object[] result =
            billRepository.getFinancialSummary(
                    hospitalId,
                    BillingStatus.CANCELLED
            );

    long totalBills =
            ((Number) result[0]).longValue();

    BigDecimal totalBilledAmount =
            (BigDecimal) result[1];

    BigDecimal totalPaidAmount =
            (BigDecimal) result[2];

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
public ApiResponse<FinancialReportResponse> getFinancialReport(
        LocalDate fromDate,
        LocalDate toDate) {

    User currentUser = getCurrentUser();

    Accountant accountant =
            accountantRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only accountants can access financial data"
                            ));

    if (accountant.getStatus()
            != AccountantStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive accountants cannot access financial data"
        );
    }

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    if (fromDate == null || toDate == null) {

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
            currentUser.getHospital().getId();

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
            (BigDecimal) result[1];

    BigDecimal totalPaidAmount =
            (BigDecimal) result[2];

    BigDecimal totalOutstandingAmount =
            totalBilledAmount.subtract(
                    totalPaidAmount
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

    User currentUser = getCurrentUser();

    Accountant accountant =
            accountantRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only accountants can access financial data"
                            ));

    if (accountant.getStatus()
            != AccountantStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive accountants cannot access financial data"
        );
    }

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    Long hospitalId =
            currentUser.getHospital().getId();

    List<Object[]> results =
            billRepository.getPaymentMethodCollection(
                    hospitalId,
                    BillingStatus.CANCELLED
            );

    List<PaymentMethodCollectionResponse> response =
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
                                            (BigDecimal) row[2]
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
public ApiResponse<AccountantDashboardResponse> getDashboard() {

    User currentUser = getCurrentUser();

    Accountant accountant =
            accountantRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only accountants can access financial data"
                            ));

    if (accountant.getStatus()
            != AccountantStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive accountants cannot access financial data"
        );
    }

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    Long hospitalId =
            currentUser.getHospital().getId();

    /*
     * Financial Summary
     */

    Object[] summary =
            billRepository.getFinancialSummary(
                    hospitalId,
                    BillingStatus.CANCELLED
            );

    long totalBills =
            ((Number) summary[0]).longValue();

    BigDecimal totalBilledAmount =
            (BigDecimal) summary[1];

    BigDecimal totalPaidAmount =
            (BigDecimal) summary[2];

    BigDecimal totalOutstandingAmount =
            totalBilledAmount.subtract(
                    totalPaidAmount
            );


    /*
     * Outstanding Bill Count
     */

    long outstandingBills =
            billRepository
                    .countByHospitalIdAndStatusInAndDeletedAtIsNull(
                            hospitalId,
                            List.of(
                                    BillingStatus.PENDING,
                                    BillingStatus.PARTIALLY_PAID
                            )
                    );


    /*
     * Payment Method Collection
     */

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
                                            (BigDecimal) row[2]
                                    )
                                    .build()
                    )
                    .toList();


     
     // Dashboard Response
      

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

    User currentUser = getCurrentUser();

    Accountant accountant =
            accountantRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only accountants can process payments"
                            ));

    if (accountant.getStatus()
            != AccountantStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive accountants cannot process payments"
        );
    }

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    return billingService.payBill(
            billId,
            request
    );
}
}
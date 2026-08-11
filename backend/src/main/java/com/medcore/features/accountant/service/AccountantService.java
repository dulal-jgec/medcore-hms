package com.medcore.features.accountant.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.accountant.dto.request.CreateAccountantRequest;
import com.medcore.features.accountant.dto.request.UpdateAccountantRequest;
import com.medcore.features.accountant.dto.response.AccountantDashboardResponse;
import com.medcore.features.accountant.dto.response.AccountantResponse;
import com.medcore.features.accountant.dto.response.FinancialReportResponse;
import com.medcore.features.accountant.dto.response.FinancialSummaryResponse;
import com.medcore.features.accountant.dto.response.PaymentMethodCollectionResponse;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.dto.response.PaymentResponse;

import java.time.LocalDate;
import java.util.List;

public interface AccountantService {

    ApiResponse<AccountantResponse> createAccountant(
            CreateAccountantRequest request
    );

    ApiResponse<AccountantResponse> getAccountantById(
            Long accountantId
    );

    ApiResponse<List<AccountantResponse>> getAllAccountants();

    ApiResponse<AccountantResponse> updateAccountant(
            Long accountantId,
            UpdateAccountantRequest request
    );

    ApiResponse<Void> deleteAccountant(
            Long accountantId
    );

    ApiResponse<AccountantResponse> activateAccountant(
            Long accountantId
    );

    ApiResponse<AccountantResponse> deactivateAccountant(
            Long accountantId
    );
    
    ApiResponse<PageResponse<BillResponse>> getHospitalBills(
            int page,
            int size,
            String sortBy,
            String sortDir
    );
    
    ApiResponse<PageResponse<BillResponse>> getOutstandingBills(
            int page,
            int size,
            String sortBy,
            String sortDir
    );
    
    ApiResponse<FinancialSummaryResponse> getFinancialSummary();
    
    ApiResponse<FinancialReportResponse> getFinancialReport(
            LocalDate fromDate,
            LocalDate toDate
    );
    
    ApiResponse<List<PaymentMethodCollectionResponse>>
    getPaymentMethodCollection();
    
    ApiResponse<AccountantDashboardResponse>
    getDashboard();
    
    ApiResponse<PaymentResponse> payBill(
            Long billId,
            PaymentRequest request
    );
}
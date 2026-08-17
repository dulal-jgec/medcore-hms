package com.medcore.features.accountant.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.accountant.dto.request.CreateAccountantRequest;
import com.medcore.features.accountant.dto.request.UpdateAccountantRequest;
import com.medcore.features.accountant.dto.response.AccountantDashboardResponse;
import com.medcore.features.accountant.dto.response.AccountantResponse;
import com.medcore.features.accountant.dto.response.FinancialReportResponse;
import com.medcore.features.accountant.dto.response.FinancialSummaryResponse;
import com.medcore.features.accountant.dto.response.PaymentMethodCollectionResponse;
import com.medcore.features.accountant.service.AccountantService;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.dto.response.PaymentResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
@RestController
@RequestMapping("/api/v1/accountants")
@RequiredArgsConstructor
public class AccountantController {

    private final AccountantService accountantService;

    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    @PostMapping
    public ApiResponse<AccountantResponse> createAccountant(
            @Valid @RequestBody CreateAccountantRequest request) {
        return accountantService.createAccountant(request);
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @GetMapping
    public ApiResponse<List<AccountantResponse>> getAllAccountants() {
        return accountantService.getAllAccountants();
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @GetMapping("/{accountantId}")
    public ApiResponse<AccountantResponse> getAccountantById(
            @PathVariable Long accountantId) {
        return accountantService.getAccountantById(accountantId);
    }

    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    @PutMapping("/{accountantId}")
    public ApiResponse<AccountantResponse> updateAccountant(
            @PathVariable Long accountantId,
            @Valid @RequestBody UpdateAccountantRequest request) {
        return accountantService.updateAccountant(
                accountantId,
                request
        );
    }

    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    @DeleteMapping("/{accountantId}")
    public ApiResponse<Void> deleteAccountant(
            @PathVariable Long accountantId) {
        return accountantService.deleteAccountant(accountantId);
    }

    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    @PatchMapping("/{accountantId}/activate")
    public ApiResponse<AccountantResponse> activateAccountant(
            @PathVariable Long accountantId) {
        return accountantService.activateAccountant(accountantId);
    }

    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    @PatchMapping("/{accountantId}/deactivate")
    public ApiResponse<AccountantResponse> deactivateAccountant(
            @PathVariable Long accountantId) {
        return accountantService.deactivateAccountant(accountantId);
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @GetMapping("/bills")
    public ApiResponse<PageResponse<BillResponse>> getHospitalBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "billDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        return accountantService.getHospitalBills(
                page, size, sortBy, sortDir
        );
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @GetMapping("/bills/outstanding")
    public ApiResponse<PageResponse<BillResponse>> getOutstandingBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "billDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        return accountantService.getOutstandingBills(
                page, size, sortBy, sortDir
        );
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @GetMapping("/financial-summary")
    public ApiResponse<FinancialSummaryResponse>
    getFinancialSummary() {
        return accountantService.getFinancialSummary();
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @GetMapping("/financial-report")
    public ApiResponse<FinancialReportResponse>
    getFinancialReport(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate) {

        return accountantService.getFinancialReport(
                fromDate, toDate
        );
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @GetMapping("/payment-method-collection")
    public ApiResponse<List<PaymentMethodCollectionResponse>>
    getPaymentMethodCollection() {

        return accountantService.getPaymentMethodCollection();
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @GetMapping("/dashboard")
    public ApiResponse<AccountantDashboardResponse>
    getDashboard() {

        return accountantService.getDashboard();
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @PostMapping("/bills/{billId}/payment")
    public ApiResponse<PaymentResponse> payBill(
            @PathVariable Long billId,
            @Valid @RequestBody PaymentRequest request) {

        return accountantService.payBill(
                billId, request
        );
    }
}
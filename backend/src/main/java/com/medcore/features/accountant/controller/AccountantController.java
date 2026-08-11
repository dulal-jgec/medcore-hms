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
@PreAuthorize("hasRole('ACCOUNTANT')")
public class AccountantController {

    private final AccountantService accountantService;


     // Create Accountant
 
    @PostMapping
    public ApiResponse<AccountantResponse> createAccountant(
            @Valid @RequestBody CreateAccountantRequest request) {

        return accountantService.createAccountant(request);
    }


     // Get All Accountants
 
    @GetMapping
    public ApiResponse<List<AccountantResponse>> getAllAccountants() {

        return accountantService.getAllAccountants();
    }


     // Get Accountant By ID
 
    @GetMapping("/{accountantId}")
    public ApiResponse<AccountantResponse> getAccountantById(
            @PathVariable Long accountantId) {

        return accountantService.getAccountantById(
                accountantId
        );
    }


     // Update Accountant
 
    @PutMapping("/{accountantId}")
    public ApiResponse<AccountantResponse> updateAccountant(
            @PathVariable Long accountantId,
            @Valid @RequestBody UpdateAccountantRequest request) {

        return accountantService.updateAccountant(
                accountantId,
                request
        );
    }


     
    // Delete Accountant
 
    @DeleteMapping("/{accountantId}")
    public ApiResponse<Void> deleteAccountant(
            @PathVariable Long accountantId) {

        return accountantService.deleteAccountant(
                accountantId
        );
    }


    
    // Activate Accountant
     

    @PatchMapping("/{accountantId}/activate")
    public ApiResponse<AccountantResponse>
    activateAccountant(
            @PathVariable Long accountantId) {

        return accountantService.activateAccountant(
                accountantId
        );
    }


     
    // Deactivate Accountant
     
    @PatchMapping("/{accountantId}/deactivate")
    public ApiResponse<AccountantResponse>
    deactivateAccountant(
            @PathVariable Long accountantId) {

        return accountantService.deactivateAccountant(
                accountantId
        );
    }
    
    @GetMapping("/bills")
    public ApiResponse<PageResponse<BillResponse>> getHospitalBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "billDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        return accountantService.getHospitalBills(
                page,
                size,
                sortBy,
                sortDir
        );
    }
    
    @GetMapping("/bills/outstanding")
    public ApiResponse<PageResponse<BillResponse>> getOutstandingBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "billDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        return accountantService.getOutstandingBills(
                page,
                size,
                sortBy,
                sortDir
        );
    }
    
    @GetMapping("/financial-summary")
    public ApiResponse<FinancialSummaryResponse>
    getFinancialSummary() {

        return accountantService.getFinancialSummary();
    }
    
    @GetMapping("/financial-report")
    public ApiResponse<FinancialReportResponse>
    getFinancialReport(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate) {

        return accountantService.getFinancialReport(
                fromDate,
                toDate
        );
    }
    
    @GetMapping("/payment-method-collection")
    public ApiResponse<List<PaymentMethodCollectionResponse>>
    getPaymentMethodCollection() {

        return accountantService
                .getPaymentMethodCollection();
    }
    
    @GetMapping("/dashboard")
    public ApiResponse<AccountantDashboardResponse>
    getDashboard() {

        return accountantService.getDashboard();
    }
    
    @PostMapping("/bills/{billId}/payment")
    public ApiResponse<PaymentResponse> payBill(
            @PathVariable Long billId,
            @Valid @RequestBody PaymentRequest request) {

        return accountantService.payBill(
                billId,
                request
        );
    }
}
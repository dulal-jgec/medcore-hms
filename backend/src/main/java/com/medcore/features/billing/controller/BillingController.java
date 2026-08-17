package com.medcore.features.billing.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.billing.dto.request.AddBillItemRequest;
import com.medcore.features.billing.dto.request.CreateBillRequest;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.BillItemResponse;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.dto.response.PaymentResponse;
import com.medcore.features.billing.service.BillingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;


    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'ACCOUNTANT')")
    public ApiResponse<BillResponse> createBill(
            @Valid @RequestBody CreateBillRequest request) {

        return billingService.createBill(request);
    }


    // =========================================================
    // ADD BILL ITEM
    // =========================================================

    @PostMapping("/{billId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'ACCOUNTANT')")
    public ApiResponse<BillItemResponse> addBillItem(
            @PathVariable Long billId,
            @Valid @RequestBody AddBillItemRequest request) {

        return billingService.addBillItem(
                billId,
                request
        );
    }


     

    @GetMapping("/{billId}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'ACCOUNTANT')")
    public ApiResponse<BillResponse> getBillById(
            @PathVariable Long billId) {

        return billingService.getBillById(
                billId
        );
    }


    
    @PutMapping("/{billId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'ACCOUNTANT')")
    public ApiResponse<BillItemResponse> updateBillItem(
            @PathVariable Long billId,
            @PathVariable Long itemId,
            @Valid @RequestBody AddBillItemRequest request) {

        return billingService.updateBillItem(
                billId,
                itemId,
                request
        );
    }


     
    @DeleteMapping("/{billId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'ACCOUNTANT')")
    public ApiResponse<Void> deleteBillItem(
            @PathVariable Long billId,
            @PathVariable Long itemId) {

        return billingService.deleteBillItem(
                billId,
                itemId
        );
    }


     

    @PostMapping("/{billId}/payments")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ApiResponse<PaymentResponse> payBill(
            @PathVariable Long billId,
            @Valid @RequestBody PaymentRequest request) {

        return billingService.payBill(
                billId,
                request
        );
    }
}
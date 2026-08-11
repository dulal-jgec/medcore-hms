package com.medcore.features.billing.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.billing.dto.request.AddBillItemRequest;
import com.medcore.features.billing.dto.request.CreateBillRequest;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.BillItemResponse;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.dto.response.PaymentResponse;

public interface BillingService {

    ApiResponse<BillResponse> createBill(
            CreateBillRequest request
    );

    ApiResponse<BillItemResponse> addBillItem(
            Long billId,
            AddBillItemRequest request
    );

    ApiResponse<BillResponse> getBillById(
            Long billId
    );

    ApiResponse<BillItemResponse> updateBillItem(
            Long billId,
            Long itemId,
            AddBillItemRequest request
    );

    ApiResponse<Void> deleteBillItem(
            Long billId,
            Long itemId
    );
    
    ApiResponse<PaymentResponse> payBill(
            Long billId,
            PaymentRequest request
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
}
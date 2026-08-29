package com.medcore.features.pharmacy.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.AddInventoryRequest;
import com.medcore.features.pharmacy.dto.request.UpdateInventoryStockRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyInventoryResponse;
import com.medcore.features.pharmacy.entity.DispensingRequest;

import java.util.List;
import com.medcore.common.response.PageResponse;

public interface PharmacyInventoryService {

    ApiResponse<PharmacyInventoryResponse> addInventory(
            AddInventoryRequest request
    );

    ApiResponse<PageResponse<PharmacyInventoryResponse>> getInventory(
            int page,
            int size,
            String sortBy,
            String sortDir
    );
    ApiResponse<PharmacyInventoryResponse> updateStock(
            Long inventoryId,
            UpdateInventoryStockRequest request
    );
 }
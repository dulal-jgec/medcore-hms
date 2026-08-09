package com.medcore.features.pharmacy.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.AddInventoryRequest;
import com.medcore.features.pharmacy.dto.request.UpdateInventoryStockRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyInventoryResponse;

import java.util.List;

public interface PharmacyInventoryService {

    ApiResponse<PharmacyInventoryResponse> addInventory(
            AddInventoryRequest request
    );

    ApiResponse<List<PharmacyInventoryResponse>> getInventory();

    ApiResponse<PharmacyInventoryResponse> updateStock(
            Long inventoryId,
            UpdateInventoryStockRequest request
    );
}
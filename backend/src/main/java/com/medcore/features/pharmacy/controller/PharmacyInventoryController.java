package com.medcore.features.pharmacy.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.AddInventoryRequest;
import com.medcore.features.pharmacy.dto.request.UpdateInventoryStockRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyInventoryResponse;
import com.medcore.features.pharmacy.service.PharmacyInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacies/inventory")
@RequiredArgsConstructor
public class PharmacyInventoryController {

    private final PharmacyInventoryService inventoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PharmacyInventoryResponse> addInventory(
            @Valid @RequestBody AddInventoryRequest request) {

        return inventoryService.addInventory(request);
    }

    @GetMapping
    public ApiResponse<List<PharmacyInventoryResponse>> getInventory() {

        return inventoryService.getInventory();
    }
    
    @PatchMapping("/{inventoryId}/stock")
    public ApiResponse<PharmacyInventoryResponse> updateStock(
            @PathVariable Long inventoryId,
            @Valid @RequestBody UpdateInventoryStockRequest request) {

        return inventoryService.updateStock(
                inventoryId,
                request
        );
    }
}
package com.medcore.features.pharmacy.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.dto.request.AddInventoryRequest;
import com.medcore.features.pharmacy.dto.request.UpdateInventoryStockRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyInventoryResponse;
import com.medcore.features.pharmacy.service.PharmacyInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.medcore.features.pharmacy.entity.DispensingRequest;
import java.util.List;
import com.medcore.common.response.PageResponse;

@RestController
@RequestMapping("/api/v1/pharmacies/inventory")
@RequiredArgsConstructor
public class PharmacyInventoryController {

    private final PharmacyInventoryService inventoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PHARMACIST')")
    public ApiResponse<PharmacyInventoryResponse> addInventory(
            @Valid @RequestBody AddInventoryRequest request) {

        return inventoryService.addInventory(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('PHARMACIST')")
    public ApiResponse<PageResponse<PharmacyInventoryResponse>> getInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expiryDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return inventoryService.getInventory(
                page,
                size,
                sortBy,
                sortDir
        );
    }

    @PatchMapping("/{inventoryId}/stock")
    @PreAuthorize("hasRole('PHARMACIST')")
    public ApiResponse<PharmacyInventoryResponse> updateStock(
            @PathVariable Long inventoryId,
            @Valid @RequestBody UpdateInventoryStockRequest request) {

        return inventoryService.updateStock(
                inventoryId,
                request
        );
    }
    
   
}
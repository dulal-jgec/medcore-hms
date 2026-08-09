package com.medcore.features.pharmacy.mapper;

import com.medcore.features.pharmacy.dto.request.AddInventoryRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyInventoryResponse;
import com.medcore.features.pharmacy.entity.PharmacyInventory;
import com.medcore.features.prescription.entity.Medicine;
import com.medcore.features.pharmacy.entity.Pharmacy;
import org.springframework.stereotype.Component;

@Component
public class PharmacyInventoryMapper {

    public PharmacyInventory toEntity(
            AddInventoryRequest request,
            Pharmacy pharmacy,
            Medicine medicine) {

        return PharmacyInventory.builder()
                .pharmacy(pharmacy)
                .medicine(medicine)
                .batchNumber(request.getBatchNumber())
                .stockQuantity(request.getStockQuantity())
                .sellingPrice(request.getSellingPrice())
                .expiryDate(request.getExpiryDate())
                .active(true)
                .build();
    }

    public PharmacyInventoryResponse toResponse(
            PharmacyInventory inventory) {

        Medicine medicine = inventory.getMedicine();

        return PharmacyInventoryResponse.builder()
                .id(inventory.getId())
                .pharmacyId(
                        inventory.getPharmacy().getId()
                )
                .medicineId(
                        medicine.getId()
                )
                .medicineName(
                        medicine.getName()
                )
                .strength(
                        medicine.getStrength()
                )
                .batchNumber(
                        inventory.getBatchNumber()
                )
                .stockQuantity(
                        inventory.getStockQuantity()
                )
                .sellingPrice(
                        inventory.getSellingPrice()
                )
                .expiryDate(
                        inventory.getExpiryDate()
                )
                .active(
                        inventory.getActive()
                )
                .build();
    }
}
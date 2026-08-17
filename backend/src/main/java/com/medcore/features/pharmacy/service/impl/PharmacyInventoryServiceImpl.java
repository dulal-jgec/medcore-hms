package com.medcore.features.pharmacy.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.pharmacy.dto.request.AddInventoryRequest;
import com.medcore.features.pharmacy.dto.request.UpdateInventoryStockRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyInventoryResponse;

import com.medcore.features.pharmacy.entity.DispensingRequest;
import com.medcore.features.pharmacy.entity.Pharmacy;
import com.medcore.features.pharmacy.entity.PharmacyInventory;

import com.medcore.features.pharmacy.enums.DispensingStatus;

import com.medcore.features.pharmacy.mapper.PharmacyInventoryMapper;

import com.medcore.features.pharmacy.repository.DispensingRequestRepository;
import com.medcore.features.pharmacy.repository.PharmacistRepository;
import com.medcore.features.pharmacy.repository.PharmacyInventoryRepository;
import com.medcore.features.pharmacy.repository.PharmacyRepository;

import com.medcore.features.pharmacy.service.PharmacyInventoryService;

import com.medcore.features.prescription.entity.Medicine;
import com.medcore.features.prescription.repository.MedicineRepository;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PharmacyInventoryServiceImpl
        implements PharmacyInventoryService {

    private final PharmacyInventoryRepository inventoryRepository;
    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;

    private final UserRepository userRepository;

    private final PharmacyInventoryMapper inventoryMapper;

    private final PharmacistRepository pharmacistRepository;
    private final DispensingRequestRepository dispensingRequestRepository;

    private final TenantContextService tenantContextService;


    @Override
    public ApiResponse<PharmacyInventoryResponse> addInventory(
            AddInventoryRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Pharmacy pharmacy =
                pharmacyRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found"
                                ));

        Medicine medicine =
                medicineRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getMedicineId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine not found"
                                ));

        if (!Boolean.TRUE.equals(
                medicine.getActive())) {

            throw new BusinessException(
                    "This medicine is not active"
            );
        }

        if (inventoryRepository
                .findByPharmacyIdAndMedicineIdAndBatchNumberAndDeletedAtIsNull(
                        pharmacy.getId(),
                        medicine.getId(),
                        request.getBatchNumber()
                )
                .isPresent()) {

            throw new BusinessException(
                    "This medicine batch already exists in inventory"
            );
        }

        PharmacyInventory inventory =
                inventoryMapper.toEntity(
                        request,
                        pharmacy,
                        medicine
                );

        PharmacyInventory savedInventory =
                inventoryRepository.save(
                        inventory
                );

        return ApiResponse
                .<PharmacyInventoryResponse>builder()
                .success(true)
                .message(
                        "Medicine added to pharmacy inventory successfully"
                )
                .data(
                        inventoryMapper.toResponse(
                                savedInventory
                        )
                )
                .build();
    }


    @Override
    public ApiResponse<List<PharmacyInventoryResponse>>
    getInventory() {

        Long hospitalId =
                getCurrentHospitalId();

        Pharmacy pharmacy =
                pharmacyRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found"
                                ));

        List<PharmacyInventoryResponse> inventory =
                inventoryRepository
                        .findByPharmacyIdAndDeletedAtIsNull(
                                pharmacy.getId()
                        )
                        .stream()
                        .map(inventoryMapper::toResponse)
                        .toList();

        return ApiResponse
                .<List<PharmacyInventoryResponse>>builder()
                .success(true)
                .message(
                        "Pharmacy inventory fetched successfully"
                )
                .data(inventory)
                .build();
    }


    @Override
    public ApiResponse<PharmacyInventoryResponse> updateStock(
            Long inventoryId,
            UpdateInventoryStockRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Pharmacy pharmacy =
                pharmacyRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found"
                                ));

        PharmacyInventory inventory =
                inventoryRepository
                        .findByIdAndDeletedAtIsNull(
                                inventoryId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory item not found"
                                ));

        if (!inventory.getPharmacy()
                .getId()
                .equals(pharmacy.getId())) {

            throw new BusinessException(
                    "You are not authorized to modify this inventory"
            );
        }

        if (!Boolean.TRUE.equals(
                inventory.getActive())) {

            throw new BusinessException(
                    "This inventory item is inactive"
            );
        }

        if (inventory.getExpiryDate()
                .isBefore(LocalDate.now())) {

            throw new BusinessException(
                    "Cannot add stock to an expired medicine batch"
            );
        }

        inventory.setStockQuantity(
                inventory.getStockQuantity()
                        + request.getQuantity()
        );

        PharmacyInventory savedInventory =
                inventoryRepository.save(
                        inventory
                );

        return ApiResponse
                .<PharmacyInventoryResponse>builder()
                .success(true)
                .message(
                        "Medicine stock updated successfully"
                )
                .data(
                        inventoryMapper.toResponse(
                                savedInventory
                        )
                )
                .build();
    }


    @Override
    public ApiResponse<List<DispensingRequest>>
    getPendingRequests() {

        User currentUser =
                getCurrentUser();

        Long hospitalId =
                getCurrentHospitalId();

        pharmacistRepository
                .findByUserId(
                        currentUser.getId()
                )
                .orElseThrow(() ->
                        new BusinessException(
                                "Only pharmacists can view dispensing requests"
                        ));

        List<DispensingRequest> requests =
                dispensingRequestRepository
                        .findByHospitalIdAndStatusAndDeletedAtIsNull(
                                hospitalId,
                                DispensingStatus.PENDING
                        );

        return ApiResponse
                .<List<DispensingRequest>>builder()
                .success(true)
                .message(
                        "Pending dispensing requests fetched successfully"
                )
                .data(requests)
                .build();
    }


    private User getCurrentUser() {

        String email =
                SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }


    private Long getCurrentHospitalId() {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {

            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return hospitalId;
    }
}
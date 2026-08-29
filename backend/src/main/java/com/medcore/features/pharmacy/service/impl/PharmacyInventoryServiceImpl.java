package com.medcore.features.pharmacy.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PharmacyInventoryServiceImpl
        implements PharmacyInventoryService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    PharmacyInventoryServiceImpl.class
            );

    private final PharmacyInventoryRepository inventoryRepository;
    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;

    private final UserRepository userRepository;

    private final PharmacyInventoryMapper inventoryMapper;

    private final PharmacistRepository pharmacistRepository;
    private final DispensingRequestRepository dispensingRequestRepository;

    private final TenantContextService tenantContextService;


    @Override
    @Transactional
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

        String batchNumber =
                request.getBatchNumber().trim();

        if (batchNumber.isEmpty()) {

            throw new BusinessException(
                    "Batch number cannot be empty"
            );
        }

        if (request.getStockQuantity() == null
                || request.getStockQuantity() < 0) {

            throw new BusinessException(
                    "Stock quantity cannot be negative"
            );
        }

        if (request.getSellingPrice() == null
                || request.getSellingPrice().signum() <= 0) {

            throw new BusinessException(
                    "Selling price must be greater than zero"
            );
        }

        if (request.getExpiryDate() == null
                || !request.getExpiryDate()
                .isAfter(LocalDate.now())) {

            throw new BusinessException(
                    "Expiry date must be in the future"
            );
        }

        if (inventoryRepository
                .findByPharmacyIdAndMedicineIdAndBatchNumberAndDeletedAtIsNull(
                        pharmacy.getId(),
                        medicine.getId(),
                        batchNumber
                )
                .isPresent()) {

            throw new BusinessException(
                    "This medicine batch already exists in inventory"
            );
        }

        request.setBatchNumber(batchNumber);

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

        log.info(
                "Inventory added: inventoryId={}, pharmacyId={}, medicineId={}, hospitalId={}, stockQuantity={}",
                savedInventory.getId(),
                pharmacy.getId(),
                medicine.getId(),
                hospitalId,
                savedInventory.getStockQuantity()
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
    public ApiResponse<PageResponse<PharmacyInventoryResponse>> getInventory(
            int page,
            int size,
            String sortBy,
            String sortDir) {

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

        Sort sort =
                sortDir.equalsIgnoreCase("desc")
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort
                );

        Page<PharmacyInventory> inventoryPage =
                inventoryRepository
                        .findByPharmacyIdAndDeletedAtIsNull(
                                pharmacy.getId(),
                                pageable
                        );

        List<PharmacyInventoryResponse> content =
                inventoryPage
                        .getContent()
                        .stream()
                        .map(inventoryMapper::toResponse)
                        .toList();

        PageResponse<PharmacyInventoryResponse> pageResponse =
                PageResponse.<PharmacyInventoryResponse>builder()
                        .items(content)
                        .page(inventoryPage.getNumber())
                        .size(inventoryPage.getSize())
                        .totalElements(
                                inventoryPage.getTotalElements()
                        )
                        .totalPages(
                                inventoryPage.getTotalPages()
                        )
                        .first(
                                inventoryPage.isFirst()
                        )
                        .last(
                                inventoryPage.isLast()
                        )
                        .hasNext(
                                inventoryPage.hasNext()
                        )
                        .hasPrevious(
                                inventoryPage.hasPrevious()
                        )
                        .build();

        log.debug(
                "Inventory fetched: pharmacyId={}, hospitalId={}, page={}, size={}, totalElements={}",
                pharmacy.getId(),
                hospitalId,
                page,
                size,
                inventoryPage.getTotalElements()
        );

        return ApiResponse
                .<PageResponse<PharmacyInventoryResponse>>builder()
                .success(true)
                .message(
                        "Pharmacy inventory fetched successfully"
                )
                .data(pageResponse)
                .build();
    }


    @Override
    @Transactional
    public ApiResponse<PharmacyInventoryResponse> updateStock(
            Long inventoryId,
            UpdateInventoryStockRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        if (request.getQuantity() == null
                || request.getQuantity() < 1) {

            throw new BusinessException(
                    "Stock quantity must be at least 1"
            );
        }

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
                        .findByIdForUpdate(inventoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory item not found"
                                ));

        if (inventory.getPharmacy() == null
                || !inventory.getPharmacy()
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

        int oldStock =
                inventory.getStockQuantity();

        int newStock =
                oldStock + request.getQuantity();

        if (newStock < oldStock) {

            throw new BusinessException(
                    "Stock quantity overflow"
            );
        }

        inventory.setStockQuantity(
                newStock
        );

        PharmacyInventory savedInventory =
                inventoryRepository.save(
                        inventory
                );

        log.info(
                "Inventory stock updated: inventoryId={}, pharmacyId={}, hospitalId={}, oldStock={}, addedQuantity={}, newStock={}",
                savedInventory.getId(),
                pharmacy.getId(),
                hospitalId,
                oldStock,
                request.getQuantity(),
                savedInventory.getStockQuantity()
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
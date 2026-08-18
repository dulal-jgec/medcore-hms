package com.medcore.features.pharmacy.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.repository.PatientRepository;

import com.medcore.features.prescription.entity.Prescription;
import com.medcore.features.prescription.entity.PrescriptionItem;
import com.medcore.features.prescription.enums.PrescriptionStatus;
import com.medcore.features.prescription.repository.PrescriptionItemRepository;
import com.medcore.features.prescription.repository.PrescriptionRepository;

import com.medcore.features.pharmacy.dto.request.CreateDispensingRequest;
import com.medcore.features.pharmacy.entity.DispensingRequest;
import com.medcore.features.pharmacy.entity.Pharmacy;
import com.medcore.features.pharmacy.entity.PharmacyInventory;
import com.medcore.features.pharmacy.enums.DispensingStatus;
import com.medcore.features.pharmacy.repository.DispensingRequestRepository;
import com.medcore.features.pharmacy.repository.PharmacyInventoryRepository;
import com.medcore.features.pharmacy.repository.PharmacyRepository;
import com.medcore.features.pharmacy.repository.PharmacistRepository;
import com.medcore.features.pharmacy.service.DispensingService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DispensingServiceImpl
        implements DispensingService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;

    private final DispensingRequestRepository dispensingRequestRepository;

    private final PharmacyRepository pharmacyRepository;
    private final PharmacyInventoryRepository pharmacyInventoryRepository;

    private final PharmacistRepository pharmacistRepository;

    private final TenantContextService tenantContextService;

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
                tenantContextService.getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return hospitalId;
    }

    @Override
    public ApiResponse<DispensingRequest> createDispensingRequest(
            CreateDispensingRequest request) {

        User currentUser =
                getCurrentUser();

        Long hospitalId =
                getCurrentHospitalId();

        Patient patient =
                patientRepository
                        .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                                currentUser.getId(),
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only patients can request prescription dispensing"
                                ));

        Prescription prescription =
                prescriptionRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getPrescriptionId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Prescription not found"
                                ));

        
        if (prescription.getHospital() == null
                || !prescription.getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (prescription.getStatus()
                != PrescriptionStatus.FINALIZED) {

            throw new BusinessException(
                    "Only finalized prescriptions can be dispensed"
            );
        }

        if (!Boolean.TRUE.equals(
                prescription.getSharedWithPatient())) {

            throw new BusinessException(
                    "Prescription has not been shared with you yet"
            );
        }

        if (dispensingRequestRepository
                .existsByPrescriptionIdAndDeletedAtIsNull(
                        prescription.getId()
                )) {

            throw new BusinessException(
                    "Dispensing request already exists for this prescription"
            );
        }

        DispensingRequest dispensingRequest =
                DispensingRequest.builder()
                        .prescription(prescription)
                        .patient(patient)
                        .hospital(prescription.getHospital())
                        .status(DispensingStatus.PENDING)
                        .requestedAt(LocalDateTime.now())
                        .build();

        DispensingRequest savedRequest =
                dispensingRequestRepository.save(
                        dispensingRequest
                );

        return ApiResponse.<DispensingRequest>builder()
                .success(true)
                .message(
                        "Prescription dispensing request created successfully"
                )
                .data(savedRequest)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<DispensingRequest> dispensePrescription(
            Long dispensingRequestId) {

        User currentUser =
                getCurrentUser();

        Long hospitalId =
                getCurrentHospitalId();

        DispensingRequest dispensingRequest =
                dispensingRequestRepository
                        .findByIdAndDeletedAtIsNull(
                                dispensingRequestId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Dispensing request not found"
                                ));

        if (dispensingRequest.getStatus()
                != DispensingStatus.PENDING) {

            throw new BusinessException(
                    "Only pending dispensing requests can be dispensed"
            );
        }

        if (dispensingRequest.getHospital() == null
                || !dispensingRequest
                .getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        pharmacistRepository
        .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                currentUser.getId(),
                hospitalId
        )
        .orElseThrow(() ->
                new BusinessException(
                        "Only pharmacists can dispense prescriptions"
                ));

        Pharmacy pharmacy =
                pharmacyRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found for this hospital"
                                ));

        Prescription prescription =
                dispensingRequest.getPrescription();

        List<PrescriptionItem> items =
                prescriptionItemRepository
                        .findByPrescriptionIdAndDeletedAtIsNull(
                                prescription.getId()
                        );

        if (items.isEmpty()) {

            throw new BusinessException(
                    "Prescription contains no medicines"
            );
        }

        for (PrescriptionItem item : items) {

            if (item.getMedicine() == null) {

                throw new BusinessException(
                        "Medicine '"
                                + item.getMedicineName()
                                + "' is not available in pharmacy inventory"
                );
            }

            Long medicineId =
                    item.getMedicine().getId();

            int requiredQuantity =
                    item.getQuantity();

            List<PharmacyInventory> inventories =
                    pharmacyInventoryRepository
                            .findAvailableInventory(
                                    pharmacy.getId(),
                                    medicineId,
                                    LocalDate.now()
                            );

            int availableStock =
                    inventories.stream()
                            .mapToInt(
                                    PharmacyInventory::getStockQuantity
                            )
                            .sum();

            if (availableStock < requiredQuantity) {

                throw new BusinessException(
                        "Insufficient stock for medicine: "
                                + item.getMedicineName()
                                + ". Required: "
                                + requiredQuantity
                                + ", Available: "
                                + availableStock
                );
            }

            int remaining =
                    requiredQuantity;

            for (PharmacyInventory inventory :
                    inventories) {

                if (remaining <= 0) {
                    break;
                }

                int currentStock =
                        inventory.getStockQuantity();

                int deducted =
                        Math.min(
                                currentStock,
                                remaining
                        );

                inventory.setStockQuantity(
                        currentStock - deducted
                );

                if (inventory.getStockQuantity() == 0) {
                    inventory.setActive(false);
                }

                pharmacyInventoryRepository.save(
                        inventory
                );

                remaining -= deducted;
            }
        }

        dispensingRequest.setStatus(
                DispensingStatus.DISPENSED
        );

        dispensingRequest.setDispensedAt(
                LocalDateTime.now()
        );

        DispensingRequest savedRequest =
                dispensingRequestRepository.save(
                        dispensingRequest
                );

        return ApiResponse.<DispensingRequest>builder()
                .success(true)
                .message(
                        "Prescription dispensed successfully and pharmacy stock updated"
                )
                .data(savedRequest)
                .build();
    }

    @Override
    public ApiResponse<List<DispensingRequest>> getPendingRequests() {

        Long hospitalId =
                getCurrentHospitalId();

        User currentUser =
                getCurrentUser();

        pharmacistRepository
        .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                currentUser.getId(),
                hospitalId
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

        return ApiResponse.<List<DispensingRequest>>builder()
                .success(true)
                .message(
                        "Pending dispensing requests fetched successfully"
                )
                .data(requests)
                .build();
    }
}
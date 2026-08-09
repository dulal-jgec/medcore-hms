package com.medcore.features.pharmacy.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;

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


    // =========================================================
    // Helper Method
    // =========================================================

    private User getCurrentUser() {

        String email = SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }


    // =========================================================
    // 1. CREATE DISPENSING REQUEST
    // Patient requests pharmacy to dispense prescription
    // =========================================================

    @Override
    public ApiResponse<DispensingRequest> createDispensingRequest(
            CreateDispensingRequest request) {

        // 1. Get logged-in user
        User currentUser = getCurrentUser();

        // 2. User must be a patient
        Patient patient = patientRepository
                .findByUserId(currentUser.getId())
                .orElseThrow(() ->
                        new BusinessException(
                                "Only patients can request prescription dispensing"
                        ));

        // 3. Find prescription
        Prescription prescription =
                prescriptionRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getPrescriptionId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Prescription not found"
                                ));

        // 4. Prescription must belong to patient
        if (!prescription.getPatient()
                .getId()
                .equals(patient.getId())) {

            throw new BusinessException(
                    "You are not authorized to request this prescription"
            );
        }

        // 5. Hospital isolation
        if (currentUser.getHospital() == null
                || prescription.getHospital() == null
                || !prescription.getHospital()
                        .getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        // 6. Prescription must be finalized
        if (prescription.getStatus()
                != PrescriptionStatus.FINALIZED) {

            throw new BusinessException(
                    "Only finalized prescriptions can be dispensed"
            );
        }

        // 7. Prescription must be shared
        if (!Boolean.TRUE.equals(
                prescription.getSharedWithPatient())) {

            throw new BusinessException(
                    "Prescription has not been shared with you yet"
            );
        }

        // 8. Prevent duplicate dispensing request
        if (dispensingRequestRepository
                .existsByPrescriptionIdAndDeletedAtIsNull(
                        prescription.getId()
                )) {

            throw new BusinessException(
                    "Dispensing request already exists for this prescription"
            );
        }

        // 9. Build dispensing request
        DispensingRequest dispensingRequest =
                DispensingRequest.builder()
                        .prescription(prescription)
                        .patient(patient)
                        .hospital(prescription.getHospital())
                        .status(DispensingStatus.PENDING)
                        .requestedAt(LocalDateTime.now())
                        .build();

        // 10. Save
        DispensingRequest savedRequest =
                dispensingRequestRepository.save(
                        dispensingRequest
                );

        // 11. Response
        return ApiResponse.<DispensingRequest>builder()
                .success(true)
                .message(
                        "Prescription dispensing request created successfully"
                )
                .data(savedRequest)
                .build();
    }


    // =========================================================
    // 2. DISPENSE PRESCRIPTION
    // Pharmacist dispenses medicine and stock decreases
    // =========================================================

    @Override
    @Transactional
    public ApiResponse<DispensingRequest> dispensePrescription(
            Long dispensingRequestId) {

        // 1. Get logged-in user
        User currentUser = getCurrentUser();

        // 2. Find dispensing request
        DispensingRequest dispensingRequest =
                dispensingRequestRepository
                        .findByIdAndDeletedAtIsNull(
                                dispensingRequestId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Dispensing request not found"
                                ));

        // 3. Request must be PENDING
        if (dispensingRequest.getStatus()
                != DispensingStatus.PENDING) {

            throw new BusinessException(
                    "Only pending dispensing requests can be dispensed"
            );
        }

        // 4. Hospital isolation
        if (currentUser.getHospital() == null
                || dispensingRequest.getHospital() == null
                || !dispensingRequest
                        .getHospital()
                        .getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        // 5. Current user must be a pharmacist
        pharmacistRepository
                .findByUserId(currentUser.getId())
                .orElseThrow(() ->
                        new BusinessException(
                                "Only pharmacists can dispense prescriptions"
                        ));

        // 6. Find pharmacy of this hospital
        Pharmacy pharmacy =
                pharmacyRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                dispensingRequest
                                        .getHospital()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found for this hospital"
                                ));

        // 7. Get prescription
        Prescription prescription =
                dispensingRequest.getPrescription();

        // 8. Get prescription medicines
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

        // =====================================================
        // 9. Process every medicine
        // =====================================================

        for (PrescriptionItem item : items) {

            // Manual medicines cannot be automatically dispensed
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

            // 10. Find inventory batches
            List<PharmacyInventory> inventories =
                    pharmacyInventoryRepository
                            .findByPharmacyIdAndMedicineIdAndActiveTrueAndDeletedAtIsNullOrderByExpiryDateAsc(
                                    pharmacy.getId(),
                                    medicineId
                            );

            // 11. Calculate total available stock
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

            // =================================================
            // 12. Decrease stock
            // =================================================

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

                // If stock becomes zero, deactivate batch
                if (inventory.getStockQuantity() == 0) {

                    inventory.setActive(false);
                }

                pharmacyInventoryRepository.save(
                        inventory
                );

                remaining -= deducted;
            }
        }

        // =====================================================
        // 13. Mark request as DISPENSED
        // =====================================================

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

        // =====================================================
        // 14. Response
        // =====================================================

        return ApiResponse.<DispensingRequest>builder()
                .success(true)
                .message(
                        "Prescription dispensed successfully and pharmacy stock updated"
                )
                .data(savedRequest)
                .build();
    }


    // =========================================================
    // 3. GET PENDING DISPENSING REQUESTS
    // Pharmacist sees pending requests
    // =========================================================

    @Override
    public ApiResponse<List<DispensingRequest>> getPendingRequests() {

        // 1. Get logged-in user
        User currentUser = getCurrentUser();

        // 2. Only pharmacists can view requests
        pharmacistRepository
                .findByUserId(currentUser.getId())
                .orElseThrow(() ->
                        new BusinessException(
                                "Only pharmacists can view dispensing requests"
                        ));

        // 3. Hospital isolation
        if (currentUser.getHospital() == null) {

            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        // 4. Get pending requests
        List<DispensingRequest> requests =
                dispensingRequestRepository
                        .findByHospitalIdAndStatusAndDeletedAtIsNull(
                                currentUser.getHospital().getId(),
                                DispensingStatus.PENDING
                        );

        // 5. Response
        return ApiResponse.<List<DispensingRequest>>builder()
                .success(true)
                .message(
                        "Pending dispensing requests fetched successfully"
                )
                .data(requests)
                .build();
    }
}
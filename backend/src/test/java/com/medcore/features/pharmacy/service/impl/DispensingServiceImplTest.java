package com.medcore.features.pharmacy.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.entity.Patient;

import com.medcore.features.patient.repository.PatientRepository;

import com.medcore.features.pharmacy.dto.request.CreateDispensingRequest;
import com.medcore.features.pharmacy.entity.DispensingRequest;
import com.medcore.features.pharmacy.entity.Pharmacy;
import com.medcore.features.pharmacy.entity.PharmacyInventory;
import com.medcore.features.pharmacy.enums.DispensingStatus;
import com.medcore.features.pharmacy.repository.DispensingRequestRepository;
import com.medcore.features.pharmacy.repository.PharmacistRepository;
import com.medcore.features.pharmacy.repository.PharmacyInventoryRepository;
import com.medcore.features.pharmacy.repository.PharmacyRepository;

import com.medcore.features.prescription.entity.Medicine;
import com.medcore.features.prescription.entity.Prescription;
import com.medcore.features.prescription.entity.PrescriptionItem;
import com.medcore.features.prescription.enums.PrescriptionStatus;
import com.medcore.features.prescription.repository.PrescriptionItemRepository;
import com.medcore.features.prescription.repository.PrescriptionRepository;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DispensingServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private DispensingRequestRepository dispensingRequestRepository;

    @Mock
    private PharmacyRepository pharmacyRepository;

    @Mock
    private PharmacyInventoryRepository pharmacyInventoryRepository;

    @Mock
    private PharmacistRepository pharmacistRepository;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private DispensingServiceImpl dispensingService;

    private User user;
    private Patient patient;
    private Hospital hospital;
    private Prescription prescription;
    private Pharmacy pharmacy;
    private Medicine medicine;
    private PrescriptionItem prescriptionItem;
    private PharmacyInventory inventory;
    private DispensingRequest dispensingRequest;

    @BeforeEach
    void setUp() {

        user = new User();
        user.setId(1L);
        user.setEmail("patient@test.com");

        hospital = new Hospital();
        hospital.setId(100L);

        patient = new Patient();
        patient.setId(10L);
        patient.setUser(user);
        patient.setHospital(hospital);

        medicine = new Medicine();
        medicine.setId(20L);
        medicine.setName("Paracetamol");
        medicine.setStrength("500mg");
        medicine.setActive(true);

        prescription = new Prescription();
        prescription.setId(30L);
        prescription.setHospital(hospital);
        prescription.setPatient(patient);
        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );
        prescription.setSharedWithPatient(true);

        prescriptionItem = new PrescriptionItem();
        prescriptionItem.setId(40L);
        prescriptionItem.setPrescription(prescription);
        prescriptionItem.setMedicine(medicine);
        prescriptionItem.setMedicineName("Paracetamol");
        prescriptionItem.setQuantity(10);

        pharmacy = new Pharmacy();
        pharmacy.setId(50L);
        pharmacy.setHospital(hospital);
        pharmacy.setName("MedCore Pharmacy");
        pharmacy.setActive(true);

        inventory = new PharmacyInventory();
        inventory.setId(60L);
        inventory.setPharmacy(pharmacy);
        inventory.setMedicine(medicine);
        inventory.setBatchNumber("B001");
        inventory.setStockQuantity(50);
        inventory.setSellingPrice(
                new BigDecimal("25.00")
        );
        inventory.setExpiryDate(
                LocalDate.now().plusMonths(6)
        );
        inventory.setActive(true);

        dispensingRequest = DispensingRequest.builder()
                .prescription(prescription)
                .patient(patient)
                .hospital(hospital)
                .status(DispensingStatus.PENDING)
                .build();

        dispensingRequest.setId(70L);
    }

    @Test
    void createDispensingRequest_shouldCreateSuccessfully() {

        CreateDispensingRequest request =
                new CreateDispensingRequest();

        request.setPrescriptionId(30L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "patient@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(patient)
                );

        when(prescriptionRepository
                .findByIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        Optional.of(prescription)
                );

        when(dispensingRequestRepository
                .existsByPrescriptionIdAndDeletedAtIsNull(30L))
                .thenReturn(false);

        when(dispensingRequestRepository
                .save(any(DispensingRequest.class)))
                .thenReturn(dispensingRequest);

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@test.com");

            ApiResponse<DispensingRequest> response =
                    dispensingService.createDispensingRequest(
                            request
                    );

            assertTrue(response.isSuccess());

            assertEquals(
                    "Prescription dispensing request created successfully",
                    response.getMessage()
            );

            assertNotNull(response.getData());

            assertEquals(
                    DispensingStatus.PENDING,
                    response.getData().getStatus()
            );

            verify(dispensingRequestRepository)
                    .save(any(DispensingRequest.class));
        }
    }

    @Test
    void createDispensingRequest_shouldThrowWhenPrescriptionNotFound() {

        CreateDispensingRequest request =
                new CreateDispensingRequest();

        request.setPrescriptionId(30L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "patient@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(patient)
                );

        when(prescriptionRepository
                .findByIdAndDeletedAtIsNull(30L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@test.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> dispensingService
                            .createDispensingRequest(request)
            );

            verify(dispensingRequestRepository, never())
                    .save(any());
        }
    }

    @Test
    void createDispensingRequest_shouldRejectWrongHospital() {

        CreateDispensingRequest request =
                new CreateDispensingRequest();

        request.setPrescriptionId(30L);

        Hospital anotherHospital =
                new Hospital();

        anotherHospital.setId(999L);

        prescription.setHospital(
                anotherHospital
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "patient@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(patient)
                );

        when(prescriptionRepository
                .findByIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        Optional.of(prescription)
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .createDispensingRequest(request)
            );

            verify(dispensingRequestRepository, never())
                    .save(any());
        }
    }

    @Test
    void createDispensingRequest_shouldRejectPrescriptionBelongingToAnotherPatient() {

        CreateDispensingRequest request =
                new CreateDispensingRequest();

        request.setPrescriptionId(30L);

        Patient anotherPatient =
                new Patient();

        anotherPatient.setId(999L);

        prescription.setPatient(
                anotherPatient
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "patient@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(patient)
                );

        when(prescriptionRepository
                .findByIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        Optional.of(prescription)
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .createDispensingRequest(request)
            );

            verify(dispensingRequestRepository, never())
                    .save(any());
        }
    }

    @Test
    void createDispensingRequest_shouldRejectNonFinalizedPrescription() {

        CreateDispensingRequest request =
                new CreateDispensingRequest();

        request.setPrescriptionId(30L);

        prescription.setStatus(
                PrescriptionStatus.DRAFT
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "patient@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(patient)
                );

        when(prescriptionRepository
                .findByIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        Optional.of(prescription)
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .createDispensingRequest(request)
            );

            verify(dispensingRequestRepository, never())
                    .save(any());
        }
    }

    @Test
    void createDispensingRequest_shouldRejectWhenPrescriptionNotShared() {

        CreateDispensingRequest request =
                new CreateDispensingRequest();

        request.setPrescriptionId(30L);

        prescription.setSharedWithPatient(false);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "patient@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(patient)
                );

        when(prescriptionRepository
                .findByIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        Optional.of(prescription)
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .createDispensingRequest(request)
            );

            verify(dispensingRequestRepository, never())
                    .save(any());
        }
    }

    @Test
    void createDispensingRequest_shouldRejectDuplicateRequest() {

        CreateDispensingRequest request =
                new CreateDispensingRequest();

        request.setPrescriptionId(30L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "patient@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(patient)
                );

        when(prescriptionRepository
                .findByIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        Optional.of(prescription)
                );

        when(dispensingRequestRepository
                .existsByPrescriptionIdAndDeletedAtIsNull(30L))
                .thenReturn(true);

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .createDispensingRequest(request)
            );

            verify(dispensingRequestRepository, never())
                    .save(any());
        }
    }

    @Test
    void dispensePrescription_shouldDispenseSuccessfully() {

        User pharmacistUser =
                new User();

        pharmacistUser.setId(2L);
        pharmacistUser.setEmail("pharmacist@test.com");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(pharmacistUser)
        );

        when(dispensingRequestRepository
                .findByIdAndDeletedAtIsNull(70L))
                .thenReturn(
                        Optional.of(dispensingRequest)
                );

        when(pharmacistRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        2L,
                        100L
                ))
                .thenReturn(
                        Optional.of(mock(
                                com.medcore.features.pharmacy.entity.Pharmacist.class
                        ))
                );

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(
                        Optional.of(pharmacy)
                );

        when(prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        List.of(prescriptionItem)
                );

        when(pharmacyInventoryRepository
                .findAvailableInventory(
                        eq(50L),
                        eq(20L),
                        any(LocalDate.class)
                ))
                .thenReturn(
                        List.of(inventory)
                );

        when(pharmacyInventoryRepository
                .save(inventory))
                .thenReturn(inventory);

        when(dispensingRequestRepository
                .save(dispensingRequest))
                .thenReturn(dispensingRequest);

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            ApiResponse<DispensingRequest> response =
                    dispensingService
                            .dispensePrescription(70L);

            assertTrue(response.isSuccess());

            assertEquals(
                    DispensingStatus.DISPENSED,
                    dispensingRequest.getStatus()
            );

            assertEquals(
                    40,
                    inventory.getStockQuantity()
            );

            assertNotNull(
                    dispensingRequest.getDispensedAt()
            );

            verify(pharmacyInventoryRepository)
                    .save(inventory);

            verify(dispensingRequestRepository)
                    .save(dispensingRequest);
        }
    }

    @Test
    void dispensePrescription_shouldRejectNonPendingRequest() {

        dispensingRequest.setStatus(
                DispensingStatus.DISPENSED
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(dispensingRequestRepository
                .findByIdAndDeletedAtIsNull(70L))
                .thenReturn(
                        Optional.of(dispensingRequest)
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .dispensePrescription(70L)
            );

            verify(pharmacyInventoryRepository, never())
                    .save(any());
        }
    }

    @Test
    void dispensePrescription_shouldRejectWrongHospital() {

        Hospital anotherHospital =
                new Hospital();

        anotherHospital.setId(999L);

        dispensingRequest.setHospital(
                anotherHospital
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(dispensingRequestRepository
                .findByIdAndDeletedAtIsNull(70L))
                .thenReturn(
                        Optional.of(dispensingRequest)
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .dispensePrescription(70L)
            );

            verify(pharmacyInventoryRepository, never())
                    .save(any());
        }
    }

    @Test
    void dispensePrescription_shouldRejectWhenPharmacistNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(dispensingRequestRepository
                .findByIdAndDeletedAtIsNull(70L))
                .thenReturn(
                        Optional.of(dispensingRequest)
                );

        when(pharmacistRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.empty()
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .dispensePrescription(70L)
            );

            verify(pharmacyInventoryRepository, never())
                    .save(any());
        }
    }

    @Test
    void dispensePrescription_shouldRejectWhenPharmacyNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(dispensingRequestRepository
                .findByIdAndDeletedAtIsNull(70L))
                .thenReturn(
                        Optional.of(dispensingRequest)
                );

        when(pharmacistRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(mock(
                                com.medcore.features.pharmacy.entity.Pharmacist.class
                        ))
                );

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(
                        Optional.empty()
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> dispensingService
                            .dispensePrescription(70L)
            );

            verify(pharmacyInventoryRepository, never())
                    .save(any());
        }
    }

    @Test
    void dispensePrescription_shouldRejectEmptyPrescription() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(dispensingRequestRepository
                .findByIdAndDeletedAtIsNull(70L))
                .thenReturn(
                        Optional.of(dispensingRequest)
                );

        when(pharmacistRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(mock(
                                com.medcore.features.pharmacy.entity.Pharmacist.class
                        ))
                );

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(
                        Optional.of(pharmacy)
                );

        when(prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        List.of()
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .dispensePrescription(70L)
            );

            verify(pharmacyInventoryRepository, never())
                    .save(any());
        }
    }

    @Test
    void dispensePrescription_shouldRejectInsufficientStock() {

        inventory.setStockQuantity(5);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(dispensingRequestRepository
                .findByIdAndDeletedAtIsNull(70L))
                .thenReturn(
                        Optional.of(dispensingRequest)
                );

        when(pharmacistRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(mock(
                                com.medcore.features.pharmacy.entity.Pharmacist.class
                        ))
                );

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(
                        Optional.of(pharmacy)
                );

        when(prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        List.of(prescriptionItem)
                );

        when(pharmacyInventoryRepository
                .findAvailableInventory(
                        eq(50L),
                        eq(20L),
                        any(LocalDate.class)
                ))
                .thenReturn(
                        List.of(inventory)
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .dispensePrescription(70L)
            );

            assertEquals(
                    5,
                    inventory.getStockQuantity()
            );

            verify(pharmacyInventoryRepository, never())
                    .save(any());
        }
    }

    @Test
    void dispensePrescription_shouldRejectMedicineWithoutMedicineEntity() {

        prescriptionItem.setMedicine(null);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(dispensingRequestRepository
                .findByIdAndDeletedAtIsNull(70L))
                .thenReturn(
                        Optional.of(dispensingRequest)
                );

        when(pharmacistRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.of(mock(
                                com.medcore.features.pharmacy.entity.Pharmacist.class
                        ))
                );

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(
                        Optional.of(pharmacy)
                );

        when(prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(30L))
                .thenReturn(
                        List.of(prescriptionItem)
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .dispensePrescription(70L)
            );

            verify(pharmacyInventoryRepository, never())
                    .save(any());
        }
    }

    @Test
    void getPendingRequests_shouldReturnPaginatedRequests() {

        User pharmacistUser =
                new User();

        pharmacistUser.setId(2L);
        pharmacistUser.setEmail(
                "pharmacist@test.com"
        );

        Page<DispensingRequest> page =
                new PageImpl<>(
                        List.of(dispensingRequest),
                        PageRequest.of(0, 10),
                        1
                );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "pharmacist@test.com"
        )).thenReturn(
                Optional.of(pharmacistUser)
        );

        when(pharmacistRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        2L,
                        100L
                ))
                .thenReturn(
                        Optional.of(mock(
                                com.medcore.features.pharmacy.entity.Pharmacist.class
                        ))
                );

        when(dispensingRequestRepository
                .findByHospitalIdAndStatusAndDeletedAtIsNull(
                        eq(100L),
                        eq(DispensingStatus.PENDING),
                        any(Pageable.class)
                ))
                .thenReturn(page);

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("pharmacist@test.com");

            ApiResponse<PageResponse<DispensingRequest>>
                    response =
                    dispensingService.getPendingRequests(
                            0,
                            10,
                            "requestedAt",
                            "desc"
                    );

            assertTrue(response.isSuccess());

            assertNotNull(response.getData());

            assertEquals(
                    1,
                    response.getData()
                            .getItems()
                            .size()
            );

            assertEquals(
                    1,
                    response.getData()
                            .getTotalElements()
            );

            assertEquals(
                    1,
                    response.getData()
                            .getTotalPages()
            );

            assertTrue(
                    response.getData().isFirst()
            );

            assertTrue(
                    response.getData().isLast()
            );
        }
    }

    @Test
    void getPendingRequests_shouldRejectNonPharmacist() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByEmail(
                "user@test.com"
        )).thenReturn(
                Optional.of(user)
        );

        when(pharmacistRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        1L,
                        100L
                ))
                .thenReturn(
                        Optional.empty()
                );

        try (MockedStatic<SecurityUtil> securityUtil =
                     mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("user@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> dispensingService
                            .getPendingRequests(
                                    0,
                                    10,
                                    "requestedAt",
                                    "desc"
                            )
            );

            verify(dispensingRequestRepository, never())
                    .findByHospitalIdAndStatusAndDeletedAtIsNull(
                            anyLong(),
                            any(),
                            any(Pageable.class)
                    );
        }
    }
}
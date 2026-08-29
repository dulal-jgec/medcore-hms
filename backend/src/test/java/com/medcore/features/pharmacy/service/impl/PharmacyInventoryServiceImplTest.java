package com.medcore.features.pharmacy.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.features.pharmacy.dto.request.AddInventoryRequest;
import com.medcore.features.pharmacy.dto.request.UpdateInventoryStockRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyInventoryResponse;
import com.medcore.features.pharmacy.entity.Pharmacy;
import com.medcore.features.pharmacy.entity.PharmacyInventory;
import com.medcore.features.pharmacy.mapper.PharmacyInventoryMapper;
import com.medcore.features.pharmacy.repository.DispensingRequestRepository;
import com.medcore.features.pharmacy.repository.PharmacistRepository;
import com.medcore.features.pharmacy.repository.PharmacyInventoryRepository;
import com.medcore.features.pharmacy.repository.PharmacyRepository;
import com.medcore.features.pharmacy.service.impl.PharmacyInventoryServiceImpl;
import com.medcore.features.prescription.entity.Medicine;
import com.medcore.features.prescription.repository.MedicineRepository;
import com.medcore.common.security.TenantContextService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PharmacyInventoryServiceImplTest {

    @Mock
    private PharmacyInventoryRepository inventoryRepository;

    @Mock
    private PharmacyRepository pharmacyRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private com.medcore.features.user.repository.UserRepository userRepository;

    @Mock
    private PharmacyInventoryMapper inventoryMapper;

    @Mock
    private PharmacistRepository pharmacistRepository;

    @Mock
    private DispensingRequestRepository dispensingRequestRepository;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private PharmacyInventoryServiceImpl inventoryService;

    private Pharmacy pharmacy;
    private Medicine medicine;
    private PharmacyInventory inventory;
    private PharmacyInventoryResponse inventoryResponse;

    @BeforeEach
    void setUp() {

        pharmacy = new Pharmacy();
        pharmacy.setId(1L);

        medicine = new Medicine();
        medicine.setId(10L);
        medicine.setName("Paracetamol");
        medicine.setStrength("500mg");
        medicine.setActive(true);

        inventory = new PharmacyInventory();
        inventory.setId(100L);
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

        inventoryResponse =
                PharmacyInventoryResponse.builder()
                        .id(100L)
                        .pharmacyId(1L)
                        .medicineId(10L)
                        .medicineName("Paracetamol")
                        .strength("500mg")
                        .batchNumber("B001")
                        .stockQuantity(50)
                        .sellingPrice(
                                new BigDecimal("25.00")
                        )
                        .expiryDate(
                                inventory.getExpiryDate()
                        )
                        .active(true)
                        .build();
    }

    @Test
    void addInventory_shouldCreateSuccessfully() {

        AddInventoryRequest request =
                AddInventoryRequest.builder()
                        .medicineId(10L)
                        .batchNumber("B001")
                        .stockQuantity(50)
                        .sellingPrice(
                                new BigDecimal("25.00")
                        )
                        .expiryDate(
                                LocalDate.now().plusMonths(6)
                        )
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(medicineRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository
                .findByPharmacyIdAndMedicineIdAndBatchNumberAndDeletedAtIsNull(
                        1L,
                        10L,
                        "B001"
                ))
                .thenReturn(Optional.empty());

        when(inventoryMapper.toEntity(
                request,
                pharmacy,
                medicine
        )).thenReturn(inventory);

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        when(inventoryMapper.toResponse(inventory))
                .thenReturn(inventoryResponse);

        var response =
                inventoryService.addInventory(request);

        assertTrue(response.isSuccess());
        assertEquals(
                "Medicine added to pharmacy inventory successfully",
                response.getMessage()
        );
        assertNotNull(response.getData());
        assertEquals(
                100L,
                response.getData().getId()
        );

        verify(inventoryRepository)
                .save(inventory);
    }

    @Test
    void addInventory_shouldThrowWhenPharmacyNotFound() {

        AddInventoryRequest request =
                AddInventoryRequest.builder()
                        .medicineId(10L)
                        .batchNumber("B001")
                        .stockQuantity(50)
                        .sellingPrice(
                                new BigDecimal("25.00")
                        )
                        .expiryDate(
                                LocalDate.now().plusMonths(6)
                        )
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> inventoryService.addInventory(request)
        );

        verify(inventoryRepository, never())
                .save(any());
    }

    @Test
    void addInventory_shouldThrowWhenMedicineNotFound() {

        AddInventoryRequest request =
                AddInventoryRequest.builder()
                        .medicineId(10L)
                        .batchNumber("B001")
                        .stockQuantity(50)
                        .sellingPrice(
                                new BigDecimal("25.00")
                        )
                        .expiryDate(
                                LocalDate.now().plusMonths(6)
                        )
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(medicineRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> inventoryService.addInventory(request)
        );

        verify(inventoryRepository, never())
                .save(any());
    }

    @Test
    void addInventory_shouldRejectInactiveMedicine() {

        AddInventoryRequest request =
                AddInventoryRequest.builder()
                        .medicineId(10L)
                        .batchNumber("B001")
                        .stockQuantity(50)
                        .sellingPrice(
                                new BigDecimal("25.00")
                        )
                        .expiryDate(
                                LocalDate.now().plusMonths(6)
                        )
                        .build();

        medicine.setActive(false);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(medicineRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(medicine));

        assertThrows(
                BusinessException.class,
                () -> inventoryService.addInventory(request)
        );

        verify(inventoryRepository, never())
                .save(any());
    }

    @Test
    void addInventory_shouldRejectDuplicateBatch() {

        AddInventoryRequest request =
                AddInventoryRequest.builder()
                        .medicineId(10L)
                        .batchNumber("B001")
                        .stockQuantity(50)
                        .sellingPrice(
                                new BigDecimal("25.00")
                        )
                        .expiryDate(
                                LocalDate.now().plusMonths(6)
                        )
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(medicineRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(medicine));

        when(inventoryRepository
                .findByPharmacyIdAndMedicineIdAndBatchNumberAndDeletedAtIsNull(
                        1L,
                        10L,
                        "B001"
                ))
                .thenReturn(Optional.of(inventory));

        assertThrows(
                BusinessException.class,
                () -> inventoryService.addInventory(request)
        );

        verify(inventoryRepository, never())
                .save(any());
    }

    @Test
    void getInventory_shouldReturnPaginatedInventory() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        org.springframework.data.domain.Page<PharmacyInventory>
                page =
                new org.springframework.data.domain.PageImpl<>(
                        List.of(inventory),
                        org.springframework.data.domain.PageRequest.of(
                                0,
                                10
                        ),
                        1
                );

        when(inventoryRepository
                .findByPharmacyIdAndDeletedAtIsNull(
                        eq(1L),
                        any(org.springframework.data.domain.Pageable.class)
                ))
                .thenReturn(page);

        when(inventoryMapper.toResponse(inventory))
                .thenReturn(inventoryResponse);

        var response =
                inventoryService.getInventory(
                        0,
                        10,
                        "createdAt",
                        "desc"
                );

        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals(
                1,
                response.getData().getItems().size()
        );
        assertEquals(
                1,
                response.getData().getTotalElements()
        );
        assertEquals(
                1,
                response.getData().getTotalPages()
        );
    }

    @Test
    void updateStock_shouldIncreaseStockSuccessfully() {

        UpdateInventoryStockRequest request =
                UpdateInventoryStockRequest.builder()
                        .quantity(20)
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(inventoryRepository
                .findByIdForUpdate(100L))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        when(inventoryMapper.toResponse(inventory))
                .thenReturn(inventoryResponse);

        var response =
                inventoryService.updateStock(
                        100L,
                        request
                );

        assertTrue(response.isSuccess());
        assertEquals(
                70,
                inventory.getStockQuantity()
        );

        verify(inventoryRepository)
                .findByIdForUpdate(100L);

        verify(inventoryRepository)
                .save(inventory);
    }

    @Test
    void updateStock_shouldRejectInventoryFromAnotherPharmacy() {

        UpdateInventoryStockRequest request =
                UpdateInventoryStockRequest.builder()
                        .quantity(20)
                        .build();

        Pharmacy anotherPharmacy =
                new Pharmacy();

        anotherPharmacy.setId(999L);

        inventory.setPharmacy(
                anotherPharmacy
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(inventoryRepository
                .findByIdForUpdate(100L))
                .thenReturn(Optional.of(inventory));

        assertThrows(
                BusinessException.class,
                () -> inventoryService.updateStock(
                        100L,
                        request
                )
        );

        verify(inventoryRepository, never())
                .save(any());
    }

    @Test
    void updateStock_shouldRejectInactiveInventory() {

        UpdateInventoryStockRequest request =
                UpdateInventoryStockRequest.builder()
                        .quantity(20)
                        .build();

        inventory.setActive(false);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(inventoryRepository
                .findByIdForUpdate(100L))
                .thenReturn(Optional.of(inventory));

        assertThrows(
                BusinessException.class,
                () -> inventoryService.updateStock(
                        100L,
                        request
                )
        );

        verify(inventoryRepository, never())
                .save(any());
    }

    @Test
    void updateStock_shouldRejectExpiredInventory() {

        UpdateInventoryStockRequest request =
                UpdateInventoryStockRequest.builder()
                        .quantity(20)
                        .build();

        inventory.setExpiryDate(
                LocalDate.now().minusDays(1)
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(inventoryRepository
                .findByIdForUpdate(100L))
                .thenReturn(Optional.of(inventory));

        assertThrows(
                BusinessException.class,
                () -> inventoryService.updateStock(
                        100L,
                        request
                )
        );

        verify(inventoryRepository, never())
                .save(any());
    }

    @Test
    void updateStock_shouldThrowWhenInventoryNotFound() {

        UpdateInventoryStockRequest request =
                UpdateInventoryStockRequest.builder()
                        .quantity(20)
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(inventoryRepository
                .findByIdForUpdate(100L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> inventoryService.updateStock(
                        100L,
                        request
                )
        );

        verify(inventoryRepository, never())
                .save(any());
    }
}
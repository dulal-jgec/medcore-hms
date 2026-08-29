package com.medcore.features.pharmacy.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.pharmacy.dto.request.CreatePharmacyRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyResponse;
import com.medcore.features.pharmacy.entity.Pharmacy;
import com.medcore.features.pharmacy.mapper.PharmacyMapper;
import com.medcore.features.pharmacy.repository.PharmacyRepository;
import com.medcore.common.security.TenantContextService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PharmacyServiceImplTest {

    @Mock
    private PharmacyRepository pharmacyRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private PharmacyMapper pharmacyMapper;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private PharmacyServiceImpl pharmacyService;

    private Hospital hospital;
    private Pharmacy pharmacy;
    private PharmacyResponse pharmacyResponse;

    @BeforeEach
    void setUp() {

        hospital = new Hospital();
        hospital.setId(100L);

        pharmacy = new Pharmacy();
        pharmacy.setId(1L);
        pharmacy.setName("MedCore Pharmacy");
        pharmacy.setHospital(hospital);
        pharmacy.setActive(true);

        pharmacyResponse = PharmacyResponse.builder()
                .id(1L)
                .name("MedCore Pharmacy")
                .hospitalId(100L)
                .active(true)
                .build();
    }

    @Test
    void createPharmacy_shouldCreateSuccessfully() {

        CreatePharmacyRequest request =
                CreatePharmacyRequest.builder()
                        .name("MedCore Pharmacy")
                        .address("Main Road")
                        .phone("9876543210")
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(hospital));

        when(pharmacyRepository
                .existsByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(false);

        when(pharmacyMapper.toEntity(
                request,
                hospital
        )).thenReturn(pharmacy);

        when(pharmacyRepository.save(pharmacy))
                .thenReturn(pharmacy);

        when(pharmacyMapper.toResponse(pharmacy))
                .thenReturn(pharmacyResponse);

        var response =
                pharmacyService.createPharmacy(request);

        assertTrue(response.isSuccess());
        assertEquals(
                "Pharmacy created successfully",
                response.getMessage()
        );
        assertNotNull(response.getData());
        assertEquals(
                1L,
                response.getData().getId()
        );

        verify(pharmacyRepository)
                .save(pharmacy);
    }

    @Test
    void createPharmacy_shouldRejectWhenHospitalContextMissing() {

        CreatePharmacyRequest request =
                CreatePharmacyRequest.builder()
                        .name("MedCore Pharmacy")
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(null);

        assertThrows(
                BusinessException.class,
                () -> pharmacyService.createPharmacy(request)
        );

        verifyNoInteractions(
                hospitalRepository,
                pharmacyRepository,
                pharmacyMapper
        );
    }

    @Test
    void createPharmacy_shouldThrowWhenHospitalNotFound() {

        CreatePharmacyRequest request =
                CreatePharmacyRequest.builder()
                        .name("MedCore Pharmacy")
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> pharmacyService.createPharmacy(request)
        );

        verify(pharmacyRepository, never())
                .save(any());
    }

    @Test
    void createPharmacy_shouldRejectDuplicatePharmacy() {

        CreatePharmacyRequest request =
                CreatePharmacyRequest.builder()
                        .name("MedCore Pharmacy")
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(hospital));

        when(pharmacyRepository
                .existsByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> pharmacyService.createPharmacy(request)
        );

        verify(pharmacyRepository, never())
                .save(any());

        verifyNoInteractions(pharmacyMapper);
    }

    @Test
    void getMyPharmacy_shouldReturnPharmacySuccessfully() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(pharmacy));

        when(pharmacyMapper.toResponse(pharmacy))
                .thenReturn(pharmacyResponse);

        var response =
                pharmacyService.getMyPharmacy();

        assertTrue(response.isSuccess());
        assertEquals(
                "Pharmacy fetched successfully",
                response.getMessage()
        );
        assertNotNull(response.getData());
        assertEquals(
                1L,
                response.getData().getId()
        );

        verify(pharmacyRepository)
                .findByHospitalIdAndDeletedAtIsNull(100L);
    }

    @Test
    void getMyPharmacy_shouldThrowWhenPharmacyNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(pharmacyRepository
                .findByHospitalIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> pharmacyService.getMyPharmacy()
        );

        verifyNoInteractions(pharmacyMapper);
    }

    @Test
    void getMyPharmacy_shouldRejectWhenHospitalContextMissing() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(null);

        assertThrows(
                BusinessException.class,
                () -> pharmacyService.getMyPharmacy()
        );

        verifyNoInteractions(
                pharmacyRepository,
                pharmacyMapper
        );
    }
}
package com.medcore.features.hospital.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalStatusRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.mapper.HospitalMapper;
import com.medcore.features.hospital.repository.HospitalRepository;
import static org.mockito.Mockito.*;
 import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
 
@ExtendWith(MockitoExtension.class)
class HospitalServiceImplTest {

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private HospitalMapper hospitalMapper;

    @InjectMocks
    private HospitalServiceImpl hospitalService;


     // CREATE HOSPITAL
 
    @Test
    void createHospital_shouldCreateSuccessfully() {

        CreateHospitalRequest request =
                new CreateHospitalRequest();

        request.setEmail("  TEST@GMAIL.COM  ");
        request.setLicenseNumber(" LIC-001 ");
        request.setPhone(" 9876543210 ");

        Hospital hospital = new Hospital();

        CreateHospitalResponse response =
                mock(CreateHospitalResponse.class);

        when(hospitalRepository
                .existsByEmailAndDeletedAtIsNull("test@gmail.com"))
                .thenReturn(false);

        when(hospitalRepository
                .existsByLicenseNumberAndDeletedAtIsNull("LIC-001"))
                .thenReturn(false);

        when(hospitalRepository
                .existsByPhoneAndDeletedAtIsNull("9876543210"))
                .thenReturn(false);

        when(hospitalMapper.toEntity(request))
                .thenReturn(hospital);

        when(hospitalRepository.save(hospital))
                .thenReturn(hospital);

        when(hospitalMapper.toResponse(hospital))
                .thenReturn(response);

        var result =
                hospitalService.createHospital(request);

        assertTrue(result.isSuccess());
        assertEquals(
                "Hospital created successfully",
                result.getMessage()
        );
        assertEquals(response, result.getData());

        assertEquals(
                "test@gmail.com",
                hospital.getEmail()
        );

        assertEquals(
                "LIC-001",
                hospital.getLicenseNumber()
        );

        assertEquals(
                "9876543210",
                hospital.getPhone()
        );

        verify(hospitalRepository).save(hospital);
    }


    @Test
    void createHospital_shouldThrowWhenEmailAlreadyExists() {

        CreateHospitalRequest request =
                new CreateHospitalRequest();

        request.setEmail("TEST@GMAIL.COM");
        request.setLicenseNumber("LIC-001");
        request.setPhone("9876543210");

        when(hospitalRepository
                .existsByEmailAndDeletedAtIsNull("test@gmail.com"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> hospitalService.createHospital(request)
        );

        verify(hospitalRepository, never()).save(any());
    }


    @Test
    void createHospital_shouldThrowWhenLicenseAlreadyExists() {

        CreateHospitalRequest request =
                new CreateHospitalRequest();

        request.setEmail("test@gmail.com");
        request.setLicenseNumber("LIC-001");
        request.setPhone("9876543210");

        when(hospitalRepository
                .existsByEmailAndDeletedAtIsNull("test@gmail.com"))
                .thenReturn(false);

        when(hospitalRepository
                .existsByLicenseNumberAndDeletedAtIsNull("LIC-001"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> hospitalService.createHospital(request)
        );

        verify(hospitalRepository, never()).save(any());
    }


    @Test
    void createHospital_shouldThrowWhenPhoneAlreadyExists() {

        CreateHospitalRequest request =
                new CreateHospitalRequest();

        request.setEmail("test@gmail.com");
        request.setLicenseNumber("LIC-001");
        request.setPhone("9876543210");

        when(hospitalRepository
                .existsByEmailAndDeletedAtIsNull("test@gmail.com"))
                .thenReturn(false);

        when(hospitalRepository
                .existsByLicenseNumberAndDeletedAtIsNull("LIC-001"))
                .thenReturn(false);

        when(hospitalRepository
                .existsByPhoneAndDeletedAtIsNull("9876543210"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> hospitalService.createHospital(request)
        );

        verify(hospitalRepository, never()).save(any());
    }


     // GET ALL
 
    @Test
    void getAllHospitals_shouldReturnHospitalsSuccessfully() {

        Hospital hospital =
                new Hospital();

        CreateHospitalResponse response =
                mock(CreateHospitalResponse.class);

        Page<Hospital> page =
                new PageImpl<>(
                        List.of(hospital)
                );

        when(hospitalRepository.findByDeletedAtIsNull(
                any(PageRequest.class)
        )).thenReturn(page);

        when(hospitalMapper.toResponse(hospital))
                .thenReturn(response);

        var result =
                hospitalService.getAllHospitals(
                        0,
                        10,
                        "name",
                        "asc"
                );

        assertTrue(result.isSuccess());
        assertEquals(
                "Hospitals fetched successfully",
                result.getMessage()
        );

        assertEquals(
                1,
                result.getData().getTotalElements()
        );

        verify(hospitalRepository)
                .findByDeletedAtIsNull(
                        any(PageRequest.class)
                );
    }


    @Test
    void getAllHospitals_shouldRejectInvalidPageSize() {

        assertThrows(
                BusinessException.class,
                () -> hospitalService.getAllHospitals(
                        0,
                        101,
                        "name",
                        "asc"
                )
        );

        verifyNoInteractions(hospitalRepository);
    }


    @Test
    void getAllHospitals_shouldRejectInvalidSortField() {

        assertThrows(
                BusinessException.class,
                () -> hospitalService.getAllHospitals(
                        0,
                        10,
                        "password",
                        "asc"
                )
        );

        verifyNoInteractions(hospitalRepository);
    }


     // GET BY ID
 
    @Test
    void getHospitalById_shouldReturnHospital() {

        Hospital hospital =
                new Hospital();

        CreateHospitalResponse response =
                mock(CreateHospitalResponse.class);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospitalMapper.toResponse(hospital))
                .thenReturn(response);

        var result =
                hospitalService.getHospitalById(1L);

        assertTrue(result.isSuccess());
        assertEquals(
                response,
                result.getData()
        );
    }


    @Test
    void getHospitalById_shouldThrowWhenNotFound() {

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> hospitalService.getHospitalById(1L)
        );
    }


     // UPDATE
 
    @Test
    void updateHospital_shouldUpdateSuccessfully() {

        Hospital hospital =
                new Hospital();

        hospital.setEmail("old@gmail.com");
        hospital.setLicenseNumber("OLD-001");
        hospital.setPhone("1111111111");

        UpdateHospitalRequest request =
                new UpdateHospitalRequest();

        request.setEmail("new@gmail.com");
        request.setLicenseNumber("NEW-001");
        request.setPhone("2222222222");

        CreateHospitalResponse response =
                mock(CreateHospitalResponse.class);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospitalRepository
                .existsByEmailAndDeletedAtIsNull("new@gmail.com"))
                .thenReturn(false);

        when(hospitalRepository
                .existsByLicenseNumberAndDeletedAtIsNull("NEW-001"))
                .thenReturn(false);

        when(hospitalRepository
                .existsByPhoneAndDeletedAtIsNull("2222222222"))
                .thenReturn(false);

        when(hospitalRepository.save(hospital))
                .thenReturn(hospital);

        when(hospitalMapper.toResponse(hospital))
                .thenReturn(response);

        var result =
                hospitalService.updateHospital(
                        1L,
                        request
                );

        assertTrue(result.isSuccess());
        assertEquals(
                "Hospital updated successfully",
                result.getMessage()
        );

        verify(hospitalMapper)
                .updateEntity(hospital, request);

        verify(hospitalRepository)
                .save(hospital);
    }


    @Test
    void updateHospital_shouldThrowWhenHospitalNotFound() {

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        UpdateHospitalRequest request =
                new UpdateHospitalRequest();

        assertThrows(
                ResourceNotFoundException.class,
                () -> hospitalService.updateHospital(
                        1L,
                        request
                )
        );
    }


     // STATUS
 
    @Test
    void updateHospitalStatus_shouldUpdateSuccessfully() {

        Hospital hospital =
                new Hospital();

        UpdateHospitalStatusRequest request =
                new UpdateHospitalStatusRequest();

        request.setStatus(
                HospitalStatus.INACTIVE
        );

        CreateHospitalResponse response =
                mock(CreateHospitalResponse.class);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospitalRepository.save(hospital))
                .thenReturn(hospital);

        when(hospitalMapper.toResponse(hospital))
                .thenReturn(response);

        var result =
                hospitalService.updateHospitalStatus(
                        1L,
                        request
                );

        assertTrue(result.isSuccess());
        assertEquals(
                "Hospital status updated successfully",
                result.getMessage()
        );

        assertEquals(
                HospitalStatus.INACTIVE,
                hospital.getStatus()
        );
    }


     // SEARCH
 
    @Test
    void searchHospitals_shouldReturnResults() {

        Hospital hospital =
                new Hospital();

        Page<Hospital> page =
                new PageImpl<>(
                        List.of(hospital)
                );

        CreateHospitalResponse response =
                mock(CreateHospitalResponse.class);

        when(hospitalRepository.searchHospitals(
                eq("apollo"),
                any(PageRequest.class)
        )).thenReturn(page);

        when(hospitalMapper.toResponse(hospital))
                .thenReturn(response);

        var result =
                hospitalService.searchHospitals(
                        "  apollo  ",
                        0,
                        10
                );

        assertTrue(result.isSuccess());

        assertEquals(
                1,
                result.getData().getTotalElements()
        );

        verify(hospitalRepository)
                .searchHospitals(
                        eq("apollo"),
                        any(PageRequest.class)
                );
    }


    @Test
    void searchHospitals_shouldRejectEmptyKeyword() {

        assertThrows(
                BusinessException.class,
                () -> hospitalService.searchHospitals(
                        "   ",
                        0,
                        10
                )
        );

        verifyNoInteractions(hospitalRepository);
    }


     // DELETE
 
    @Test
    void deleteHospital_shouldSoftDeleteSuccessfully() {

        Hospital hospital =
                new Hospital();

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospitalRepository.save(hospital))
                .thenReturn(hospital);

        var result =
                hospitalService.deleteHospital(1L);

        assertTrue(result.isSuccess());

        assertEquals(
                "Hospital deleted successfully",
                result.getMessage()
        );

        assertEquals(
                "Deleted",
                result.getData()
        );

        assertNotNull(
                hospital.getDeletedAt()
        );

        verify(hospitalRepository)
                .save(hospital);
    }


     // RESTORE
 
    @Test
    void restoreHospital_shouldRestoreSuccessfully() {

        Hospital hospital =
                new Hospital();

        hospital.setDeletedAt(
                LocalDateTime.now()
        );

        when(hospitalRepository
                .findById(1L))
                .thenReturn(Optional.of(hospital));

        when(hospitalRepository.save(hospital))
                .thenReturn(hospital);

        var result =
                hospitalService.restoreHospital(1L);

        assertTrue(result.isSuccess());

        assertEquals(
                "Hospital restored successfully",
                result.getMessage()
        );

        assertEquals(
                "Restored",
                result.getData()
        );

        assertNull(
                hospital.getDeletedAt()
        );

        verify(hospitalRepository)
                .save(hospital);
    }


    @Test
    void restoreHospital_shouldThrowWhenAlreadyActive() {

        Hospital hospital =
                new Hospital();

        hospital.setDeletedAt(null);

        when(hospitalRepository
                .findById(1L))
                .thenReturn(Optional.of(hospital));

        assertThrows(
                BusinessException.class,
                () -> hospitalService.restoreHospital(1L)
        );

        verify(hospitalRepository, never())
                .save(any());
    }
}
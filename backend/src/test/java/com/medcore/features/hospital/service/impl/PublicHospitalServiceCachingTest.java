
package com.medcore.features.hospital.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.features.hospital.dto.response.PublicHospitalResponse;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.mapper.PublicHospitalMapper;
import com.medcore.features.hospital.repository.HospitalRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicHospitalServiceCachingTest {

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private PublicHospitalMapper publicHospitalMapper;

    @InjectMocks
    private PublicHospitalServiceImpl service;

    @Test
    void getHospitals_shouldReturnActiveHospitalPage() {
        Hospital hospital = new Hospital();

        PublicHospitalResponse response =
                mock(PublicHospitalResponse.class);

        Page<Hospital> hospitalPage =
                new PageImpl<>(List.of(hospital));

        when(hospitalRepository.findByStatusAndDeletedAtIsNull(
                eq(HospitalStatus.ACTIVE),
                any(PageRequest.class)
        )).thenReturn(hospitalPage);

        when(publicHospitalMapper.toResponse(hospital))
                .thenReturn(response);

        var result = service.getHospitals(
                0, 10, "name", "asc"
        );

        assertTrue(result.isSuccess());
        assertEquals(1, result.getData().getTotalElements());

        verify(hospitalRepository).findByStatusAndDeletedAtIsNull(
                eq(HospitalStatus.ACTIVE),
                any(PageRequest.class)
        );

        verify(publicHospitalMapper).toResponse(hospital);
    }

    @Test
    void getHospital_shouldThrowWhenNotFound() {
        when(hospitalRepository.findByIdAndStatusAndDeletedAtIsNull(
                1L, HospitalStatus.ACTIVE
        )).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.getHospital(1L)
        );
    }

    @Test
    void getHospital_shouldRejectNullId() {
        assertThrows(
                BusinessException.class,
                () -> service.getHospital(null)
        );

        verifyNoInteractions(hospitalRepository);
    }

    @Test
    void getHospitals_shouldRejectInvalidPageSize() {
        assertThrows(
                BusinessException.class,
                () -> service.getHospitals(
                        0, 101, "name", "asc"
                )
        );

        verifyNoInteractions(hospitalRepository);
    }

    @Test
    void getHospitals_shouldRejectInvalidSortDirection() {
        assertThrows(
                BusinessException.class,
                () -> service.getHospitals(
                        0, 10, "name", "invalid"
                )
        );

        verifyNoInteractions(hospitalRepository);
    }
}

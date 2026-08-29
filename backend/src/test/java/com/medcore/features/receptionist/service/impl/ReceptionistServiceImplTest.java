package com.medcore.features.receptionist.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.receptionist.dto.request.CreateReceptionistRequest;
import com.medcore.features.receptionist.entity.Receptionist;
import com.medcore.features.receptionist.enums.ReceptionistStatus;
import com.medcore.features.receptionist.mapper.ReceptionistMapper;
import com.medcore.features.receptionist.repository.ReceptionistRepository;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.enums.RoleName;

@ExtendWith(MockitoExtension.class)
class ReceptionistServiceImplTest {

    @Mock
    private ReceptionistRepository receptionistRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReceptionistMapper receptionistMapper;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private ReceptionistServiceImpl receptionistService;

    private User user;
    private Receptionist receptionist;

    @BeforeEach
    void setUp() {

        user = new User();
        user.setId(10L);

        Role role = new Role();
        role.setName(RoleName.RECEPTIONIST);
        user.setRole(role);

        receptionist = new Receptionist();
        receptionist.setId(1L);
        receptionist.setUser(user);
        receptionist.setStatus(ReceptionistStatus.ACTIVE);
    }

    @Test
    void createReceptionist_shouldCreateSuccessfully() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setUserId(10L);
        request.setDesignation("Front Desk");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        var hospital = new com.medcore.features.hospital.entity.Hospital();
        hospital.setId(100L);

        user.setHospital(hospital);

        when(userRepository.findByIdAndHospitalIdAndDeletedAtIsNull(10L, 100L))
        .thenReturn(Optional.of(user));

        when(receptionistRepository
                .existsByUserIdAndDeletedAtIsNull(10L))
                .thenReturn(false);

        when(receptionistMapper.toEntity(request, user))
                .thenReturn(receptionist);

        when(receptionistRepository.save(receptionist))
                .thenReturn(receptionist);

        var response =
                receptionistService.createReceptionist(request);

        assertTrue(response.isSuccess());

        verify(receptionistRepository)
                .save(receptionist);
    }

    @Test
    void createReceptionist_shouldThrowWhenUserNotFound() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setUserId(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository.findByIdAndHospitalIdAndDeletedAtIsNull(10L, 100L))
        .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> receptionistService
                        .createReceptionist(request)
        );

        verify(receptionistRepository, never())
                .save(any());
    }

    @Test
    void createReceptionist_shouldRejectUserFromAnotherHospital() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setUserId(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        var hospital = new com.medcore.features.hospital.entity.Hospital();
        hospital.setId(200L);

        user.setHospital(hospital);

        when(userRepository.findByIdAndHospitalIdAndDeletedAtIsNull(10L, 100L))
        .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> receptionistService
                        .createReceptionist(request)
        );

        verify(receptionistRepository, never())
                .save(any());
    }

    @Test
    void createReceptionist_shouldRejectDuplicateProfile() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setUserId(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        var hospital = new com.medcore.features.hospital.entity.Hospital();
        hospital.setId(100L);

        user.setHospital(hospital);

        when(userRepository.findByIdAndHospitalIdAndDeletedAtIsNull(10L, 100L))
        .thenReturn(Optional.of(user));

        when(receptionistRepository
                .existsByUserIdAndDeletedAtIsNull(10L))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> receptionistService
                        .createReceptionist(request)
        );

        verify(receptionistRepository, never())
                .save(any());
    }
    
    @Test
    void createReceptionist_shouldRejectNonReceptionistUser() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setUserId(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        Hospital hospital = new Hospital();
        hospital.setId(100L);

        Role role = new Role();
        role.setName(RoleName.DOCTOR);

        user.setHospital(hospital);
        user.setRole(role);

        when(userRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(10L, 100L))
                .thenReturn(Optional.of(user));

        assertThrows(
                BusinessException.class,
                () -> receptionistService
                        .createReceptionist(request)
        );

        verify(receptionistRepository, never())
                .save(any());
    }
}
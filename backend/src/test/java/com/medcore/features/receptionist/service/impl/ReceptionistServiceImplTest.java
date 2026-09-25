package com.medcore.features.receptionist.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.receptionist.dto.request.CreateReceptionistRequest;
import com.medcore.features.receptionist.entity.Receptionist;
import com.medcore.features.receptionist.enums.ReceptionistStatus;
import com.medcore.features.receptionist.mapper.ReceptionistMapper;
import com.medcore.features.receptionist.repository.ReceptionistRepository;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;
import com.medcore.features.notification.service.EmailService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ReceptionistServiceImpl receptionistService;

    private User user;
    private Receptionist receptionist;
    private Hospital hospital;
    private Role receptionistRole;

    @BeforeEach
    void setUp() {

        hospital = new Hospital();
        hospital.setId(100L);
        hospital.setName("MedCore Hospital");
 
        receptionistRole = new Role();
        receptionistRole.setName(RoleName.RECEPTIONIST);

        user = new User();
        user.setId(10L);
        user.setFullName("John Doe");
        user.setEmail("john@test.com");
        user.setPhone("9876543210");
        user.setRole(receptionistRole);
        user.setHospital(hospital);

        receptionist = new Receptionist();
        receptionist.setId(1L);
        receptionist.setUser(user);
        receptionist.setHospital(hospital);
        receptionist.setStatus(ReceptionistStatus.ACTIVE);
    }

    @Test
    void createReceptionist_shouldCreateSuccessfully() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setFullName("John Doe");
        request.setEmail("john@test.com");
        request.setPhone("9876543210");
        request.setDesignation("Front Desk");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.existsByEmail("john@test.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(roleRepository.findByName(RoleName.RECEPTIONIST))
                .thenReturn(Optional.of(receptionistRole));

        when(passwordEncoder.encode(anyString()))
                .thenReturn("encoded-password");

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        when(receptionistMapper.toEntity(request, user))
                .thenReturn(receptionist);

        when(receptionistRepository.save(receptionist))
                .thenReturn(receptionist);

        var response =
                receptionistService.createReceptionist(request);

        assertTrue(response.isSuccess());

        verify(userRepository)
                .save(any(User.class));

        verify(receptionistRepository)
                .save(receptionist);

        verify(emailService)
                .sendReceptionistCredentials(
                        eq("john@test.com"),
                        eq("John Doe"),
                        anyString(),
                        eq("MedCore Hospital")
                );
    }

    @Test
    void createReceptionist_shouldThrowWhenHospitalNotFound() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> receptionistService
                        .createReceptionist(request)
        );

        verify(userRepository, never())
                .save(any());

        verify(receptionistRepository, never())
                .save(any());
    }

    @Test
    void createReceptionist_shouldRejectDuplicateEmail() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setEmail("john@test.com");
        request.setPhone("9876543210");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.existsByEmail("john@test.com"))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> receptionistService
                        .createReceptionist(request)
        );

        verify(userRepository, never())
                .save(any());

        verify(roleRepository, never())
                .findByName(any());
    }

    @Test
    void createReceptionist_shouldRejectDuplicatePhone() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setEmail("john@test.com");
        request.setPhone("9876543210");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.existsByEmail("john@test.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> receptionistService
                        .createReceptionist(request)
        );

        verify(userRepository, never())
                .save(any());

        verify(roleRepository, never())
                .findByName(any());
    }

    @Test
    void createReceptionist_shouldThrowWhenReceptionistRoleNotFound() {

        CreateReceptionistRequest request =
                new CreateReceptionistRequest();

        request.setEmail("john@test.com");
        request.setPhone("9876543210");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(100L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.existsByEmail("john@test.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(roleRepository.findByName(RoleName.RECEPTIONIST))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> receptionistService
                        .createReceptionist(request)
        );

        verify(userRepository, never())
                .save(any());

        verify(receptionistRepository, never())
                .save(any());
    }
}
package com.medcore.features.superadmin.service.impl;

import com.medcore.common.exception.BusinessException;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalStatusRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.hospital.service.HospitalService;
import com.medcore.features.superadmin.dto.response.SuperAdminDashboardResponse;
import com.medcore.features.superadmin.dto.response.SuperAdminResponse;
import com.medcore.features.superadmin.entity.SuperAdmin;
import com.medcore.features.superadmin.enums.SuperAdminStatus;
import com.medcore.features.superadmin.mapper.SuperAdminMapper;
import com.medcore.features.superadmin.repository.SuperAdminRepository;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.junit.jupiter.api.AfterEach;


@ExtendWith(MockitoExtension.class)
class SuperAdminServiceImplTest {

    @Mock
    private SuperAdminRepository superAdminRepository;

    @Mock
    private SuperAdminMapper superAdminMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HospitalService hospitalService;

    @Mock
    private HospitalRepository hospitalRepository;

    @InjectMocks
    private SuperAdminServiceImpl superAdminService;
    
    
    
    
    @BeforeEach
    void setUpSecurityContext() {

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                		"admin@test.com",
                        null,
                        java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                        "ROLE_SUPER_ADMIN"
                                )
                        )
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }
    
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }


    @Test
    void getCurrentSuperAdmin_shouldReturnProfile_whenSuperAdminIsActive() {

        User user = mock(User.class);
        SuperAdmin superAdmin = mock(SuperAdmin.class);
        SuperAdminResponse response = mock(SuperAdminResponse.class);

        when(user.getId()).thenReturn(1L);

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(user));

        when(superAdminRepository
                .findByUserIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(superAdmin));

        when(superAdmin.getStatus())
                .thenReturn(SuperAdminStatus.ACTIVE);

        when(superAdminMapper.toResponse(superAdmin))
                .thenReturn(response);

        try (MockedStatic<SecurityUtil> securityUtil =
                     Mockito.mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("admin@test.com");

            ApiResponse<SuperAdminResponse> result =
                    superAdminService.getCurrentSuperAdmin();

            assertTrue(result.isSuccess());
            assertEquals(response, result.getData());

            verify(superAdminMapper)
                    .toResponse(superAdmin);
        }
    }


    @Test
    void getCurrentSuperAdmin_shouldThrowException_whenUserNotFound() {

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityUtil =
                     Mockito.mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("admin@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> superAdminService.getCurrentSuperAdmin()
            );
        }
    }


    @Test
    void getCurrentSuperAdmin_shouldThrowException_whenProfileNotFound() {

        User user = mock(User.class);

        when(user.getId()).thenReturn(1L);

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(user));

        when(superAdminRepository
                .findByUserIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityUtil =
                     Mockito.mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("admin@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> superAdminService.getCurrentSuperAdmin()
            );
        }
    }


    @Test
    void getCurrentSuperAdmin_shouldThrowException_whenSuperAdminIsInactive() {

        User user = mock(User.class);
        SuperAdmin superAdmin = mock(SuperAdmin.class);

        when(user.getId()).thenReturn(1L);

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(user));

        when(superAdminRepository
                .findByUserIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(superAdmin));

        when(superAdmin.getStatus())
                .thenReturn(SuperAdminStatus.INACTIVE);

        try (MockedStatic<SecurityUtil> securityUtil =
                     Mockito.mockStatic(SecurityUtil.class)) {

            securityUtil
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("admin@test.com");

            assertThrows(
                    BusinessException.class,
                    () -> superAdminService.getCurrentSuperAdmin()
            );
        }
    }


    @Test
    void createHospital_shouldDelegateToHospitalService() {

        CreateHospitalRequest request =
                mock(CreateHospitalRequest.class);

        ApiResponse<CreateHospitalResponse> response =
                mock(ApiResponse.class);

        mockActiveSuperAdmin();

        when(hospitalService.createHospital(request))
                .thenReturn(response);

        ApiResponse<CreateHospitalResponse> result =
                superAdminService.createHospital(request);

        assertEquals(response, result);

        verify(hospitalService)
                .createHospital(request);
    }


    @Test
    void getAllHospitals_shouldDelegateToHospitalService() {

        mockActiveSuperAdmin();

        ApiResponse response =
                mock(ApiResponse.class);

        when(hospitalService.getAllHospitals(
                0,
                10,
                "createdAt",
                "desc"
        )).thenReturn(response);

        ApiResponse result =
                superAdminService.getAllHospitals(
                        0,
                        10,
                        "createdAt",
                        "desc"
                );

        assertEquals(response, result);

        verify(hospitalService)
                .getAllHospitals(
                        0,
                        10,
                        "createdAt",
                        "desc"
                );
    }
 

    @Test
    void getHospitalById_shouldDelegateToHospitalService() {

        mockActiveSuperAdmin();

        ApiResponse<CreateHospitalResponse> response =
                mock(ApiResponse.class);

        when(hospitalService.getHospitalById(1L))
                .thenReturn(response);

        ApiResponse<CreateHospitalResponse> result =
                superAdminService.getHospitalById(1L);

        assertEquals(response, result);

        verify(hospitalService)
                .getHospitalById(1L);
    }

 
    @Test
    void updateHospital_shouldDelegateToHospitalService() {

        UpdateHospitalRequest request =
                mock(UpdateHospitalRequest.class);

        ApiResponse<CreateHospitalResponse> response =
                mock(ApiResponse.class);

        mockActiveSuperAdmin();

        when(hospitalService.updateHospital(1L, request))
                .thenReturn(response);

        ApiResponse<CreateHospitalResponse> result =
                superAdminService.updateHospital(
                        1L,
                        request
                );

        assertEquals(response, result);

        verify(hospitalService)
                .updateHospital(1L, request);
    }
 

    @Test
    void updateHospitalStatus_shouldDelegateToHospitalService() {

        UpdateHospitalStatusRequest request =
                mock(UpdateHospitalStatusRequest.class);

        ApiResponse<CreateHospitalResponse> response =
                mock(ApiResponse.class);

        mockActiveSuperAdmin();

        when(hospitalService.updateHospitalStatus(
                1L,
                request
        )).thenReturn(response);

        ApiResponse<CreateHospitalResponse> result =
                superAdminService.updateHospitalStatus(
                        1L,
                        request
                );

        assertEquals(response, result);

        verify(hospitalService)
                .updateHospitalStatus(1L, request);
    }
 

    @Test
    void searchHospitals_shouldDelegateToHospitalService() {

        mockActiveSuperAdmin();

        ApiResponse response =
                mock(ApiResponse.class);

        when(hospitalService.searchHospitals(
                "apollo",
                0,
                10
        )).thenReturn(response);

        ApiResponse result =
                superAdminService.searchHospitals(
                        "apollo",
                        0,
                        10
                );

        assertEquals(response, result);

        verify(hospitalService)
                .searchHospitals(
                        "apollo",
                        0,
                        10
                );
    }
 

    @Test
    void deleteHospital_shouldDelegateToHospitalService() {

        mockActiveSuperAdmin();

        ApiResponse<String> response =
                mock(ApiResponse.class);

        when(hospitalService.deleteHospital(1L))
                .thenReturn(response);

        ApiResponse<String> result =
                superAdminService.deleteHospital(1L);

        assertEquals(response, result);

        verify(hospitalService)
                .deleteHospital(1L);
    }

 

    @Test
    void restoreHospital_shouldDelegateToHospitalService() {

        mockActiveSuperAdmin();

        ApiResponse<String> response =
                mock(ApiResponse.class);

        when(hospitalService.restoreHospital(1L))
                .thenReturn(response);

        ApiResponse<String> result =
                superAdminService.restoreHospital(1L);

        assertEquals(response, result);

        verify(hospitalService)
                .restoreHospital(1L);
    }
 
    @Test
    void getDashboard_shouldReturnCorrectCounts() {

        mockActiveSuperAdmin();

        when(hospitalRepository.countByDeletedAtIsNull())
                .thenReturn(10L);

        when(hospitalRepository
                .countByStatusAndDeletedAtIsNull(
                        HospitalStatus.ACTIVE
                ))
                .thenReturn(7L);

        when(hospitalRepository
                .countByStatusAndDeletedAtIsNull(
                        HospitalStatus.INACTIVE
                ))
                .thenReturn(3L);

        when(hospitalRepository.countByDeletedAtIsNotNull())
                .thenReturn(2L);

        ApiResponse<SuperAdminDashboardResponse> result =
                superAdminService.getDashboard();

        assertTrue(result.isSuccess());

        SuperAdminDashboardResponse data =
                result.getData();

        assertEquals(10L, data.getTotalHospitals());
        assertEquals(7L, data.getActiveHospitals());
        assertEquals(3L, data.getInactiveHospitals());
        assertEquals(2L, data.getDeletedHospitals());
    }

 

    private void mockActiveSuperAdmin() {

        User user = mock(User.class);
        SuperAdmin superAdmin = mock(SuperAdmin.class);

        when(user.getId()).thenReturn(1L);

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(user));

        when(superAdminRepository
                .findByUserIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(superAdmin));

        when(superAdmin.getStatus())
                .thenReturn(SuperAdminStatus.ACTIVE);
    }
}
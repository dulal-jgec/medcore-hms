package com.medcore.features.auth.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.security.jwt.JwtProperties;
import com.medcore.common.security.jwt.JwtService;
import com.medcore.features.auth.dto.request.LoginRequest;
import com.medcore.features.auth.dto.request.RefreshTokenRequest;
import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.auth.dto.response.RefreshTokenResult;
import com.medcore.features.auth.entity.RefreshToken;
import com.medcore.features.auth.service.RefreshTokenService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthServiceImpl authService;

    private Hospital hospital;
    private Role patientRole;
    private User user;

    @BeforeEach
    void setUp() {

        hospital = new Hospital();
        hospital.setId(1L);
        hospital.setName("MedCore Hospital");
        hospital.setStatus(HospitalStatus.ACTIVE);

        patientRole = new Role();
        patientRole.setId(1L);
        patientRole.setName(RoleName.PATIENT);

        user = new User();
        user.setId(100L);
        user.setEmail("test@example.com");
        user.setFullName("Test User");
        user.setPhone("9876543210");
        user.setRole(patientRole);
        user.setHospital(hospital);
        user.setStatus(UserStatus.ACTIVE);
    }


     // REGISTER
 
    @Test
    void register_shouldRegisterUserSuccessfully() {

    	RegisterRequest request = new RegisterRequest();

    	request.setFullName("Test User");
    	request.setEmail(" Test@Example.com ");
    	request.setPhone("9876543210");
    	request.setPassword("password123");
    	request.setConfirmPassword("password123");
    	request.setHospitalId(1L);

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(hospitalRepository.findById(1L))
                .thenReturn(Optional.of(hospital));

        when(roleRepository.findByName(RoleName.PATIENT))
                .thenReturn(Optional.of(patientRole));

        when(passwordEncoder.encode("password123"))
                .thenReturn("encoded-password");

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        var response = authService.register(request);

        assertTrue(response.isSuccess());
        assertEquals(
                "User registered successfully",
                response.getMessage()
        );
        assertEquals(
                "Registration completed",
                response.getData()
        );

        verify(userRepository)
                .save(any(User.class));

        verify(passwordEncoder)
                .encode("password123");
    }


    @Test
    void register_shouldRejectPasswordMismatch() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("password123");
        request.setConfirmPassword("different");
        request.setHospitalId(1L);

        assertThrows(
                BusinessException.class,
                () -> authService.register(request)
        );

        verifyNoInteractions(
                userRepository,
                hospitalRepository,
                roleRepository,
                passwordEncoder
        );
    }


    @Test
    void register_shouldRejectDuplicateEmail() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail(" Test@Example.com ");
        request.setPhone("9876543210");
        request.setPassword("password123");
        request.setConfirmPassword("password123");
        request.setHospitalId(1L);

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> authService.register(request)
        );

        verify(userRepository)
                .existsByEmail("test@example.com");

        verifyNoInteractions(
                hospitalRepository,
                roleRepository,
                passwordEncoder
        );
    }


    @Test
    void register_shouldRejectDuplicatePhone() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("password123");
        request.setConfirmPassword("password123");
        request.setHospitalId(1L);

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> authService.register(request)
        );

        verify(userRepository)
                .existsByPhone("9876543210");

        verifyNoInteractions(
                hospitalRepository,
                roleRepository,
                passwordEncoder
        );
    }


    @Test
    void register_shouldRejectWhenHospitalNotFound() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("password123");
        request.setConfirmPassword("password123");
        request.setHospitalId(1L);

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(hospitalRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> authService.register(request)
        );

        verifyNoInteractions(
                roleRepository,
                passwordEncoder
        );
    }


    @Test
    void register_shouldRejectInactiveHospital() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("password123");
        request.setConfirmPassword("password123");
        request.setHospitalId(1L);

        hospital.setStatus(HospitalStatus.INACTIVE);

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(hospitalRepository.findById(1L))
                .thenReturn(Optional.of(hospital));

        assertThrows(
                BusinessException.class,
                () -> authService.register(request)
        );

        verifyNoInteractions(
                roleRepository,
                passwordEncoder
        );
    }


    @Test
    void register_shouldRejectDeletedHospital() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("password123");
        request.setConfirmPassword("password123");
        request.setHospitalId(1L);

        hospital.setDeletedAt(LocalDateTime.now());

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(hospitalRepository.findById(1L))
                .thenReturn(Optional.of(hospital));

        assertThrows(
                BusinessException.class,
                () -> authService.register(request)
        );
    }


    @Test
    void register_shouldRejectWhenPatientRoleNotFound() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("password123");
        request.setConfirmPassword("password123");
        request.setHospitalId(1L);

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(hospitalRepository.findById(1L))
                .thenReturn(Optional.of(hospital));

        when(roleRepository.findByName(RoleName.PATIENT))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> authService.register(request)
        );

        verifyNoInteractions(passwordEncoder);
    }


     // LOGIN
 
    @Test
    void login_shouldLoginSuccessfully() {

        LoginRequest request = new LoginRequest();

        request.setEmail(" TEST@EXAMPLE.COM ");
        request.setPassword("password123");

        when(authenticationManager.authenticate(any()))
                .thenReturn(mock(Authentication.class));

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(jwtService.generateAccessToken("test@example.com"))
                .thenReturn("access-token");

        RefreshToken refreshToken = new RefreshToken();

        RefreshTokenResult refreshResult =
                new RefreshTokenResult(
                        "refresh-token",
                        refreshToken
                );

        when(refreshTokenService.createRefreshToken(user))
                .thenReturn(refreshResult);

        when(jwtProperties.getAccessTokenExpiration())
                .thenReturn(900000L);

        var response = authService.login(request);

        assertTrue(response.isSuccess());
        assertEquals(
                "Login successful",
                response.getMessage()
        );

        assertNotNull(response.getData());
        assertEquals(
                "access-token",
                response.getData().getAccessToken()
        );
        assertEquals(
                "refresh-token",
                response.getData().getRefreshToken()
        );
        assertEquals(
                "Bearer",
                response.getData().getTokenType()
        );

        verify(authenticationManager)
                .authenticate(any(
                        UsernamePasswordAuthenticationToken.class
                ));

        verify(jwtService)
                .generateAccessToken("test@example.com");

        verify(refreshTokenService)
                .createRefreshToken(user);
    }


    @Test
    void login_shouldThrowWhenUserNotFound() {

        LoginRequest request = new LoginRequest();

        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(authenticationManager.authenticate(any()))
                .thenReturn(mock(Authentication.class));

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> authService.login(request)
        );

        verifyNoInteractions(
                jwtService,
                refreshTokenService
        );
    }


     // REFRESH TOKEN
 
    @Test
    void refreshToken_shouldGenerateNewTokensSuccessfully() {

        RefreshTokenRequest request =
                new RefreshTokenRequest();

        request.setRefreshToken("old-refresh-token");

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setRevoked(false);
        refreshToken.setExpiryDate(
                LocalDateTime.now().plusDays(1)
        );

        when(refreshTokenService.verifyRefreshToken(
                "old-refresh-token"
        )).thenReturn(refreshToken);

        when(jwtService.generateAccessToken(
                "test@example.com"
        )).thenReturn("new-access-token");

        RefreshToken newRefreshToken =
                new RefreshToken();

        RefreshTokenResult result =
                new RefreshTokenResult(
                        "new-refresh-token",
                        newRefreshToken
                );

        when(refreshTokenService.createRefreshToken(user))
                .thenReturn(result);

        when(jwtProperties.getAccessTokenExpiration())
                .thenReturn(900000L);

        var response =
                authService.refreshToken(request);

        assertTrue(response.isSuccess());

        assertEquals(
                "new-access-token",
                response.getData().getAccessToken()
        );

        assertEquals(
                "new-refresh-token",
                response.getData().getRefreshToken()
        );

        verify(refreshTokenService)
                .verifyRefreshToken("old-refresh-token");

        verify(refreshTokenService)
                .revokeRefreshToken(refreshToken);

        verify(refreshTokenService)
                .createRefreshToken(user);
    }


    @Test
    void refreshToken_shouldRejectInactiveUser() {

        RefreshTokenRequest request =
                new RefreshTokenRequest();

        request.setRefreshToken("old-refresh-token");

        user.setStatus(UserStatus.INACTIVE);

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setUser(user);

        when(refreshTokenService.verifyRefreshToken(
                "old-refresh-token"
        )).thenReturn(refreshToken);

        assertThrows(
                BusinessException.class,
                () -> authService.refreshToken(request)
        );

        verify(refreshTokenService)
                .verifyRefreshToken("old-refresh-token");

        verify(refreshTokenService, never())
                .revokeRefreshToken(any(RefreshToken.class));

        verifyNoInteractions(jwtService);
    }


     // CURRENT USER
 
    @Test
    void getCurrentUser_shouldReturnUserProfile() {

        Authentication authentication =
                mock(Authentication.class);

        when(authentication.getName())
                .thenReturn("test@example.com");

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        var response =
                authService.getCurrentUser();

        assertTrue(response.isSuccess());

        assertEquals(
                100L,
                response.getData().getId()
        );

        assertEquals(
                "Test User",
                response.getData().getFullName()
        );

        assertEquals(
                "test@example.com",
                response.getData().getEmail()
        );

        assertEquals(
                "PATIENT",
                response.getData().getRole()
        );

        assertEquals(
                "MedCore Hospital",
                response.getData().getHospitalName()
        );

        SecurityContextHolder.clearContext();
    }


     // LOGOUT
 
    @Test
    void logout_shouldRevokeUserRefreshTokens() {

        Authentication authentication =
                mock(Authentication.class);

        when(authentication.getName())
                .thenReturn("test@example.com");

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        var response = authService.logout();

        assertTrue(response.isSuccess());

        assertEquals(
                "Logout successful",
                response.getMessage()
        );

        verify(refreshTokenService)
                .revokeRefreshToken(user);

        assertNull(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
        );
    }
}
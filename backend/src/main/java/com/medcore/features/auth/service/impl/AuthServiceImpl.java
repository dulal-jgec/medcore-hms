package com.medcore.features.auth.service.impl;

import com.medcore.common.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.jwt.JwtProperties;
import com.medcore.common.security.jwt.JwtService;
import com.medcore.features.auth.dto.request.LoginRequest;
import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.auth.dto.response.AuthResponse;
import com.medcore.features.auth.dto.response.RefreshTokenResult;
import com.medcore.features.auth.mapper.AuthMapper;
import com.medcore.features.auth.service.AuthService;
import com.medcore.features.auth.service.RefreshTokenService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.medcore.features.auth.dto.response.UserProfileResponse;
import com.medcore.features.auth.entity.RefreshToken;
import com.medcore.features.auth.dto.request.RefreshTokenRequest;
import com.medcore.features.hospital.enums.HospitalStatus;
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
	
	private static final Logger log= 
			LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @Override
    public ApiResponse<String> register(RegisterRequest request) {

         
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Passwords do not match");
        }

        String email = request.getEmail().trim().toLowerCase();
        
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already exists");
        }
        
        String phone = request.getPhone().trim();
        
        if (userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Phone number already exists");
        }

        Hospital hospital = hospitalRepository
                .findById(request.getHospitalId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        if (hospital.getDeletedAt() != null) {
            throw new BusinessException("Hospital is not available");
        }

        if (hospital.getStatus() != HospitalStatus.ACTIVE) {
            throw new BusinessException("Hospital is not active");
        }
        
         
        Role role = roleRepository.findByName(RoleName.PATIENT)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient role not found"));

        // Encode Password
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // DTO -> Entity
        User user = AuthMapper.toUser(
                request,
                hospital,
                role,
                encodedPassword,
                email
        );

        // Save User
        userRepository.save(user);
        
        log.info(
        		"User registered successfully: userId={}, role={}",
        		user.getId(),
        		role.getName()
        		);

        // Response
        return ApiResponse.<String>builder()
                .success(true)
                .message("User registered successfully")
                .data("Registration completed")
                .build();
    }
    
    @Override
    public ApiResponse<AuthResponse> login(LoginRequest request) {
    	
    	String email = request.getEmail().trim().toLowerCase();

    	authenticationManager.authenticate(
    	        new UsernamePasswordAuthenticationToken(
    	                email,
    	                request.getPassword()
    	        )
    	);
    	
    	log.info(
    			"User authentication successful: email={}",
    			email
    			);

    	User user = userRepository.findByEmail(email)
    	        .orElseThrow(() ->
    	                new ResourceNotFoundException("User not found"));

    	String accessToken = jwtService.generateAccessToken(user.getEmail());
    		
    		RefreshTokenResult refreshTokenResult =
    		        refreshTokenService.createRefreshToken(user);
    		
    		log.info(
    		        "Login successful: userId={}",
    		        user.getId()
    		);
    		
    		AuthResponse authResponse = AuthResponse.builder()
    		        .accessToken(accessToken)
    		        .refreshToken(refreshTokenResult.getRawToken())
    		        .tokenType("Bearer")
    		        .expiresIn(jwtProperties.getAccessTokenExpiration())
    		        .build();

    		return ApiResponse.<AuthResponse>builder()
    		        .success(true)
    		        .message("Login successful")
    		        .data(authResponse)
    		        .build();
    }
    
    @Override
    public ApiResponse<UserProfileResponse> getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        UserProfileResponse response = UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName().name())
                .hospitalName(user.getHospital().getName())
                .build();

        return ApiResponse.<UserProfileResponse>builder()
                .success(true)
                .message("User profile fetched successfully")
                .data(response)
                .build();
    }

    	
    @Override
    @Transactional
    public ApiResponse<AuthResponse> refreshToken(
            RefreshTokenRequest request) {

        RefreshToken refreshToken =
                refreshTokenService.verifyRefreshToken(
                        request.getRefreshToken()
                );
        
        log.info(
                "Refresh token verified: userId={}",
                refreshToken.getUser().getId()
        );

        User user = refreshToken.getUser();

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(
                    "User account is not active"
            );
        }

        refreshTokenService.revokeRefreshToken(
                refreshToken
        );

        String accessToken =
                jwtService.generateAccessToken(
                        user.getEmail()
                );

        RefreshTokenResult refreshTokenResult =
                refreshTokenService.createRefreshToken(user);
        
        log.info(
                "Access token refreshed successfully: userId={}",
                user.getId()
        );

        AuthResponse authResponse =
                AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(
                                refreshTokenResult.getRawToken()
                        )
                        .tokenType("Bearer")
                        .expiresIn(
                                jwtProperties
                                        .getAccessTokenExpiration()
                        )
                        .build();

        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message(
                        "Access token refreshed successfully"
                )
                .data(authResponse)
                .build();
    }
    
    @Override
    public ApiResponse<String> logout() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        refreshTokenService.revokeRefreshToken(user);

        SecurityContextHolder.clearContext();
        
        log.info(
                "User logged out successfully: userId={}",
                user.getId()
        );

        return ApiResponse.<String>builder()
                .success(true)
                .message("Logout successful")
                .data("Logged out successfully")
                .build();
    }
}
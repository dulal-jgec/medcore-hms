package com.medcore.features.auth.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.auth.mapper.AuthMapper;
import com.medcore.features.auth.service.AuthService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiResponse<String> register(RegisterRequest request) {

        // Password Match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Passwords do not match");
        }

        // Email Exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        // Phone Exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already exists");
        }

        // Hospital Exists
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        // Default Role = PATIENT
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
                encodedPassword
        );

        // Save User
        userRepository.save(user);

        // Response
        return ApiResponse.<String>builder()
                .success(true)
                .message("User registered successfully")
                .data("Registration completed")
                .build();
    }
}
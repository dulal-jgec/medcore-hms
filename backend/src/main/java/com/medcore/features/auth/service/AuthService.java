package com.medcore.features.auth.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.auth.dto.request.LoginRequest;
import com.medcore.features.auth.dto.request.RefreshTokenRequest;
import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.auth.dto.response.AuthResponse;
import com.medcore.features.auth.dto.response.UserProfileResponse;

public interface AuthService {

    ApiResponse<String> register(RegisterRequest request);

    ApiResponse<AuthResponse> login(LoginRequest request);

    ApiResponse<UserProfileResponse> getCurrentUser();

    ApiResponse<AuthResponse> refreshToken(RefreshTokenRequest request);

    ApiResponse<String> logout();
}
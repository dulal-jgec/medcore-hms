package com.medcore.features.auth.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.auth.dto.request.RegisterRequest;

public interface AuthService {

	ApiResponse<String> register(RegisterRequest request);
}
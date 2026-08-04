package com.medcore.features.auth.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.auth.service.AuthService;
 
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medcore.features.auth.dto.request.LoginRequest;
import com.medcore.features.auth.dto.request.RefreshTokenRequest;
import com.medcore.features.auth.dto.response.AuthResponse;
import com.medcore.features.auth.dto.response.UserProfileResponse;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
 
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
            @Valid @RequestBody RegisterRequest request) {

        ApiResponse<String> response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {

        return ResponseEntity.ok(authService.getCurrentUser());
    }
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {

        return ResponseEntity.ok(authService.logout());
    }
}
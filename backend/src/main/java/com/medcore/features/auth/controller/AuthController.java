package com.medcore.features.auth.controller;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.response.ApiResponse;
import com.medcore.features.auth.dto.request.LoginRequest;
import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.auth.dto.response.AuthResponse;
import com.medcore.features.auth.dto.response.UserProfileResponse;
import com.medcore.features.auth.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
            @Valid @RequestBody RegisterRequest request) {

        ApiResponse<String> response =
                authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        ApiResponse<AuthResponse> result =
                authService.login(request);

        AuthResponse authResponse =
                result.getData();

        ResponseCookie refreshCookie =
                createRefreshTokenCookie(
                        authResponse.getRefreshToken()
                );

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                refreshCookie.toString()
        );

        // Do not expose refresh token in JSON.
        authResponse.setRefreshToken(null);

        return ResponseEntity.ok(result);
    }

    // =========================
    // CURRENT USER
    // =========================

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>>
    getCurrentUser() {

        return ResponseEntity.ok(
                authService.getCurrentUser()
        );
    }

    // =========================
    // REFRESH TOKEN
    // =========================

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>>
    refreshToken(
            @CookieValue(
                    value = "refresh_token",
                    required = false
            ) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException(
                    "Refresh token is missing"
            );
        }

        ApiResponse<AuthResponse> result =
                authService.refreshToken(refreshToken);

        AuthResponse authResponse =
                result.getData();

        ResponseCookie refreshCookie =
                createRefreshTokenCookie(
                        authResponse.getRefreshToken()
                );

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                refreshCookie.toString()
        );

        // Do not expose refresh token in JSON.
        authResponse.setRefreshToken(null);

        return ResponseEntity.ok(result);
    }

    // =========================
    // LOGOUT
    // =========================

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            HttpServletResponse response) {

        ApiResponse<String> result =
                authService.logout();

        ResponseCookie deleteCookie =
                ResponseCookie.from(
                        "refresh_token",
                        ""
                )
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                deleteCookie.toString()
        );

        return ResponseEntity.ok(result);
    }

    // =========================
    // REFRESH TOKEN COOKIE
    // =========================

    private ResponseCookie createRefreshTokenCookie(
            String refreshToken) {

        return ResponseCookie.from(
                "refresh_token",
                refreshToken
        )
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(7 * 24 * 60 * 60)
                .build();
    }
}
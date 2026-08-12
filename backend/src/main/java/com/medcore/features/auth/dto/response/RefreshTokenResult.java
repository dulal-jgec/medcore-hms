package com.medcore.features.auth.dto.response;

import com.medcore.features.auth.entity.RefreshToken;
import lombok.AllArgsConstructor;
import lombok.Getter;
@Getter
@AllArgsConstructor
public class RefreshTokenResult {

    private final String rawToken;
    private final RefreshToken refreshToken;
}
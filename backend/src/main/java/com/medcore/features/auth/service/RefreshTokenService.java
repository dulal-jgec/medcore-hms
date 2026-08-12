package com.medcore.features.auth.service;

import com.medcore.features.auth.dto.response.RefreshTokenResult;
import com.medcore.features.auth.entity.RefreshToken;
import com.medcore.features.user.entity.User;

public interface RefreshTokenService {

    RefreshTokenResult createRefreshToken(User user);

    RefreshToken verifyRefreshToken(String token);

    void revokeRefreshToken(User user);

    void revokeRefreshToken(RefreshToken refreshToken);
}
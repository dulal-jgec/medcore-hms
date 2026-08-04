package com.medcore.features.auth.service;

import com.medcore.features.auth.entity.RefreshToken;
import com.medcore.features.user.entity.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyRefreshToken(String token);

    void revokeRefreshToken(User user);

}
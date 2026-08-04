package com.medcore.features.auth.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.features.auth.entity.RefreshToken;
import com.medcore.features.auth.repository.RefreshTokenRepository;
import com.medcore.features.auth.service.RefreshTokenService;
import com.medcore.common.security.jwt.JwtProperties;
import com.medcore.common.security.jwt.JwtService;
import com.medcore.features.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    @Override
    public RefreshToken createRefreshToken(User user) {

        refreshTokenRepository.findByUser(user)
                .ifPresent(refreshTokenRepository::delete);

        refreshTokenRepository.flush();   // <-- Very Important

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(jwtService.generateRefreshToken(user.getEmail()))
                .expiryDate(LocalDateTime.now()
                        .plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public RefreshToken verifyRefreshToken(String token) {

        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() ->
                        new BusinessException("Refresh token not found"));

        if (refreshToken.getRevoked()) {
            throw new BusinessException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Refresh token has expired");
        }

        return refreshToken;
    }

    @Override
    public void revokeRefreshToken(User user) {

        refreshTokenRepository.findByUser(user)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }
}
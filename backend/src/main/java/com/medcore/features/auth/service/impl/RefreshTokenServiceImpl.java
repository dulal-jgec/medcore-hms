package com.medcore.features.auth.service.impl;

import com.medcore.common.exception.BusinessException;

import com.medcore.features.auth.dto.response.RefreshTokenResult;
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
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
@Transactional
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {
	
	private static final Logger log =
	        LoggerFactory.getLogger(RefreshTokenServiceImpl.class);

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    @Override
    public RefreshTokenResult createRefreshToken(User user) {

        String rawToken = jwtService.generateRefreshToken();

        String hashedToken =
                jwtService.hashRefreshToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(hashedToken)
                .expiryDate(
                        LocalDateTime.now()
                                .plusSeconds(
                                        jwtProperties.getRefreshTokenExpiration() / 1000
                                )
                )
                .revoked(false)
                .build();

        RefreshToken savedToken =
                refreshTokenRepository.save(refreshToken);
        
        log.debug(
                "Refresh token created: userId={}, tokenId={}",
                user.getId(),
                savedToken.getId()
        );  // not actual token , it is only database token Id 

        return new RefreshTokenResult(
                rawToken,
                savedToken
        );
    }

@Override
public RefreshToken verifyRefreshToken(String token) {

    String hashedToken =
            jwtService.hashRefreshToken(token);

    RefreshToken refreshToken =
            refreshTokenRepository.findByToken(hashedToken)
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Refresh token not found"
                            ));

    if (refreshToken.getRevoked()) {
        throw new BusinessException(
                "Refresh token is invalid"
        );
    }

    if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
        throw new BusinessException(
                "Refresh token is invalid"
        );
    }
    return refreshToken;
}

    @Override
    public void revokeRefreshToken(User user) {

        List<RefreshToken>tokens = 
        		refreshTokenRepository.findByUser(user);
        tokens.forEach(token-> token.setRevoked(true));
        
        refreshTokenRepository.saveAll(tokens);
        
        log.debug(
                "All refresh tokens revoked: userId={}, count={}",
                user.getId(),
                tokens.size()
        );
    }
    
    @Override
    public void revokeRefreshToken(RefreshToken refreshToken) {

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        
        refreshTokenRepository.save(refreshToken);

        log.debug(
                "Refresh token revoked: tokenId={}, userId={}",
                refreshToken.getId(),
                refreshToken.getUser().getId()
        );
    }
}
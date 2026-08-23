package com.medcore.common.websocket;

import com.medcore.common.security.jwt.JwtService;
import com.medcore.common.security.userdetails.CustomUserDetails;
import com.medcore.common.security.userdetails.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtWebSocketInterceptor
        implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(
                accessor.getCommand())) {

            String authorization =
                    accessor.getFirstNativeHeader(
                            "Authorization"
                    );

            if (authorization != null
                    && authorization.startsWith("Bearer ")) {

                String token =
                        authorization.substring(7);

                if (jwtService.isTokenValid(token)) {

                    String email =
                            jwtService.extractUsername(token);

                    var userDetails =
                            userDetailsService
                                    .loadUserByUsername(email);

                    CustomUserDetails customUserDetails =
                            (CustomUserDetails) userDetails;

                    Authentication authentication =
                            new UsernamePasswordAuthenticationToken(
                                    customUserDetails.getUser().getId().toString(),
                                    null,
                                    customUserDetails.getAuthorities()
                            );

                    accessor.setUser(authentication);

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }
        }

        return message;
    }
}
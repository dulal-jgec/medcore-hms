package com.medcore.common.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter
        extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path =
                request.getRequestURI();

        int maxRequests;

        if (path.equals("/api/v1/auth/login")) {

            maxRequests = 10;

        } else if (path.equals("/api/v1/auth/register")) {

            maxRequests = 5;

        } else if (path.equals("/api/v1/auth/refresh")) {

            maxRequests = 20;

        } else {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String clientIp =
                request.getRemoteAddr();

        boolean allowed =
                rateLimitService.isAllowed(
                        clientIp,
                        maxRequests
                );

        if (!allowed) {

            response.setStatus(429);

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again later.\"}"
            );

            return;
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}
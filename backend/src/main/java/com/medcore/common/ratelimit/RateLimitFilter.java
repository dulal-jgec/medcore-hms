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
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String action = resolveAction(request.getRequestURI());

        // Not a rate-limited endpoint → pass through
        if (action == null) {
            filterChain.doFilter(request, response);
            return;
        }

        int maxRequests = maxRequestsFor(action);
        String clientIp = request.getRemoteAddr();

        boolean allowed = rateLimitService.isAllowed(clientIp, action, maxRequests);

        if (!allowed) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again later.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Maps a request URI to a logical action name.
     * Trailing slash is normalized so "/auth/login/" and "/auth/login"
     * are treated the same — prevents trivial rate-limit bypass.
     */
    private String resolveAction(String path) {
        String normalized =
                (path.length() > 1 && path.endsWith("/"))
                        ? path.substring(0, path.length() - 1)
                        : path;

        return switch (normalized) {
            case "/api/v1/auth/login"    -> "login";
            case "/api/v1/auth/register" -> "register";
            case "/api/v1/auth/refresh"  -> "refresh";
            default -> null;
        };
    }

    private int maxRequestsFor(String action) {
        return switch (action) {
            case "login"    -> 10;
            case "register" -> 5;
            case "refresh"  -> 20;
            default -> throw new IllegalArgumentException("Unknown action: " + action);
        };
    }
}
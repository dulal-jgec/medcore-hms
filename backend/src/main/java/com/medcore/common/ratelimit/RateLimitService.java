package com.medcore.common.ratelimit;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;

    private static final Duration WINDOW =
            Duration.ofMinutes(1);

    public boolean isAllowed(
            String clientKey,
            int maxRequests) {

        String key =
                "rate_limit:" + clientKey;

        Long count =
                redisTemplate
                        .opsForValue()
                        .increment(key);

        if (count != null && count == 1) {

            redisTemplate.expire(
                    key,
                    WINDOW
            );
        }

        return count != null
                && count <= maxRequests;
    }
}
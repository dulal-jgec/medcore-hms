package com.medcore.common.ratelimit;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;

    private static final Duration WINDOW = Duration.ofMinutes(1);

    /**
     * Runs entirely INSIDE Redis (single-threaded, atomic).
     * INCR + EXPIRE happen as one unit — no crash/failover window.
     * KEYS[1] = the counter key, ARGV[1] = TTL in seconds.
     */
    private static final RedisScript<Long> RATE_LIMIT_SCRIPT =
            new DefaultRedisScript<>(
                    """
                    local current = redis.call('INCR', KEYS[1])
                    if current == 1 then
                        redis.call('EXPIRE', KEYS[1], ARGV[1])
                    end
                    return current
                    """,
                    Long.class
            );

    public boolean isAllowed(String clientKey, String action, int maxRequests) {

        String key = "rate_limit:" + action + ":" + clientKey;

        Long count = redisTemplate.execute(
                RATE_LIMIT_SCRIPT,
                List.of(key),
                String.valueOf(WINDOW.getSeconds())
        );

        return count != null && count <= maxRequests;
    }
}
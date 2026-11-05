package com.medcore.common.cache;

import com.medcore.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantCacheEvictService {

    private final StringRedisTemplate redisTemplate;

    public void evictTenantCache(String cacheName, Long hospitalId) {

        if (hospitalId == null) {
            throw new BusinessException(
                    "Hospital context is required"
            );
        }

        String pattern =
                cacheName + "::hospital:" + hospitalId + ":*";

        redisTemplate.execute((RedisCallback<Void>) connection -> {

            try (var cursor = connection.scan(
                    ScanOptions.scanOptions()
                            .match(pattern)
                            .count(500)
                            .build()
            )) {

                List<byte[]> batch = new ArrayList<>();

                while (cursor.hasNext()) {

                    batch.add(cursor.next());

                    if (batch.size() >= 500) {
                        connection.del(batch.toArray(new byte[0][]));
                        batch.clear();
                    }
                }

                if (!batch.isEmpty()) {
                    connection.del(batch.toArray(new byte[0][]));
                }
            }

            return null;
        });
    }
}
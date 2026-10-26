
package com.medcore.features.hospital.service;

import com.medcore.config.RedisConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringJUnitConfig(
        classes = RedisCachingIntegrationTest.TestConfig.class
)
class RedisCachingIntegrationTest {

    @jakarta.annotation.Resource
    private CacheManager cacheManager;

    @jakarta.annotation.Resource
    private TestCacheService testCacheService;

    @BeforeEach
    void clearCache() {
        cacheManager.getCache("hospitalList").clear();
        testCacheService.reset();
    }

    @Test
    void repeatedRequest_shouldReturnCachedValue() {
        String first = testCacheService.load("integration-test");
        String second = testCacheService.load("integration-test");

        assertEquals(first, second);
        assertEquals(1, testCacheService.getCallCount());
    }

    @Test
    void evictCache_shouldForceFreshExecution() {
        String first = testCacheService.load("integration-test");

        testCacheService.evict("integration-test");

        String second = testCacheService.load("integration-test");

        assertNotEquals(first, second);
        assertEquals(2, testCacheService.getCallCount());
    }

    @Configuration
    @Import(RedisConfig.class)
    static class TestConfig {

        @Bean
        RedisConnectionFactory redisConnectionFactory() {
            return new LettuceConnectionFactory(
                    "localhost",
                    6379
            );
        }

        @Bean
        TestCacheService testCacheService() {
            return new TestCacheService();
        }
    }

    static class TestCacheService {

        private final AtomicInteger callCount =
                new AtomicInteger();

        @Cacheable(cacheNames = "hospitalList", key = "#p0")
        public String load(String key) {
            return "result-" + callCount.incrementAndGet();
        }

        @CacheEvict(cacheNames = "hospitalList", key = "#p0")
        public void evict(String key) {
            // Spring clears the matching cache entry.
        }

        public int getCallCount() {
            return callCount.get();
        }

        public void reset() {
            callCount.set(0);
        }
    }
}

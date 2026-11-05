package com.medcore.features.department.service;

import com.medcore.common.cache.TenantCacheEvictService;
import com.medcore.common.cache.TenantCacheKeyGenerator;
import com.medcore.common.exception.BusinessException;
import com.medcore.common.security.TenantContextService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringJUnitConfig(
        classes = DepartmentCacheIntegrationTest.TestConfig.class
)
class DepartmentCacheIntegrationTest {

    private static final Long HOSPITAL_1 = 1L;
    private static final Long HOSPITAL_2 = 2L;

    @jakarta.annotation.Resource
    private CacheManager cacheManager;

    @jakarta.annotation.Resource
    private TenantContextService tenantContextService;

    @jakarta.annotation.Resource
    private DepartmentCacheService departmentCacheService;

    @jakarta.annotation.Resource
    private CachedDepartmentReader cachedDepartmentReader;

    @BeforeEach
    void setUp() {

        cacheManager.getCache("departments").clear();
        cacheManager.getCache("publicDepartments").clear();
        cacheManager.getCache("publicDepartmentById").clear();

        cachedDepartmentReader.reset();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_1);
    }

    // Test 1: Repeated requests should use cached data.

    @Test
    void repeatedRequest_shouldReadFromCache() {

        String first =
                cachedDepartmentReader.load(0, 10);

        String second =
                cachedDepartmentReader.load(0, 10);

        assertEquals(first, second);

        assertEquals(
                1,
                cachedDepartmentReader.getCallCount()
        );
    }

    // Test 2: Different hospitals should have separate cache entries.

    @Test
    void cacheKeys_shouldBeIsolatedBetweenHospitals() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_1);

        String hospital1First =
                cachedDepartmentReader.load(0, 10);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_2);

        String hospital2First =
                cachedDepartmentReader.load(0, 10);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_1);

        String hospital1Second =
                cachedDepartmentReader.load(0, 10);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_2);

        String hospital2Second =
                cachedDepartmentReader.load(0, 10);

        assertEquals(hospital1First, hospital1Second);
        assertEquals(hospital2First, hospital2Second);

        assertEquals(
                2,
                cachedDepartmentReader.getCallCount()
        );
    }

    // Test 3: Evicting Hospital 1 must not evict Hospital 2.

    @Test
    void evictingHospital1_shouldNotEvictHospital2Cache() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_1);

        cachedDepartmentReader.load(0, 10);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_2);

        cachedDepartmentReader.load(0, 10);

        // Evict only Hospital 1 cache.
        departmentCacheService.evictDepartmentCaches(HOSPITAL_1);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_1);

        cachedDepartmentReader.load(0, 10);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(HOSPITAL_2);

        cachedDepartmentReader.load(0, 10);

        // Hospital 1 reloads; Hospital 2 remains cached.
        assertEquals(
                3,
                cachedDepartmentReader.getCallCount()
        );
    }

    // Test 4: Missing hospital context should be rejected.

    @Test
    void keyGenerator_shouldRejectMissingHospitalContext() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(null);

        assertThrows(
                BusinessException.class,
                () -> cachedDepartmentReader.load(0, 10)
        );
    }

    @Configuration
    @EnableCaching
    static class TestConfig {

        @Bean(destroyMethod = "destroy")
        RedisConnectionFactory redisConnectionFactory() {

            return new LettuceConnectionFactory(
                    "localhost",
                    6379
            );
        }

        @Bean
        StringRedisTemplate stringRedisTemplate(
                RedisConnectionFactory connectionFactory
        ) {

            return new StringRedisTemplate(
                    connectionFactory
            );
        }

        @Bean
        CacheManager cacheManager(
                RedisConnectionFactory connectionFactory
        ) {

            RedisCacheConfiguration configuration =
                    RedisCacheConfiguration.defaultCacheConfig()
                            .entryTtl(Duration.ofMinutes(30));

            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(configuration)
                    .build();
        }

        @Bean
        TenantContextService tenantContextService() {

            return mock(TenantContextService.class);
        }

        @Bean
        KeyGenerator tenantCacheKeyGenerator(
                TenantContextService tenantContextService
        ) {

            return new TenantCacheKeyGenerator(
                    tenantContextService
            );
        }

        @Bean
        TenantCacheEvictService tenantCacheEvictService(
                StringRedisTemplate stringRedisTemplate
        ) {

            return new TenantCacheEvictService(
                    stringRedisTemplate
            );
        }

        @Bean
        DepartmentCacheService departmentCacheService(
                TenantCacheEvictService tenantCacheEvictService
        ) {

            return new DepartmentCacheService(
                    tenantCacheEvictService
            );
        }

        @Bean
        CachedDepartmentReader cachedDepartmentReader() {

            return new CachedDepartmentReader();
        }
    }

    static class CachedDepartmentReader {

        private final AtomicInteger callCount =
                new AtomicInteger();

        @Cacheable(
                cacheNames = "departments",
                keyGenerator = "tenantCacheKeyGenerator"
        )
        public String load(int page, int size) {

            return "department-result-"
                    + callCount.incrementAndGet();
        }

        int getCallCount() {
            return callCount.get();
        }

        void reset() {
            callCount.set(0);
        }
    }
}

package com.medcore.features.hospital.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HospitalCacheServiceTest {

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private HospitalCacheService hospitalCacheService;

    @BeforeEach
    void setUp() {
        when(cacheManager.getCache(anyString())).thenReturn(cache);
    }

    @Test
    void evictHospitalCaches_shouldClearAllHospitalCaches() {
        hospitalCacheService.evictHospitalCaches();

        verify(cacheManager).getCache("hospitalList");
        verify(cacheManager).getCache("hospitalById");
        verify(cacheManager).getCache("hospitalSearch");
        verify(cacheManager).getCache("hospitalProfile");
        verify(cacheManager).getCache("publicHospitalList");
        verify(cacheManager).getCache("publicHospitalById");

        verify(cache, times(6)).clear();
    }

    @Test
    void evictPublicHospitalGalleryCaches_shouldClearGalleryCaches() {
        hospitalCacheService.evictPublicHospitalGalleryCaches();

        verify(cacheManager).getCache("publicHospitalGallery");
        verify(cacheManager).getCache("publicHospitalGalleryByCategory");
        verify(cacheManager).getCache("publicHospitalGalleryImage");

        verify(cache, times(3)).clear();
    }

    @Test
    void evictHospitalProfile_shouldEvictSpecificHospitalProfile() {
        hospitalCacheService.evictHospitalProfile(10L);

        verify(cacheManager).getCache("hospitalProfile");
        verify(cache).evict(
                "hospital:10:getMyHospitalProfile"
        );
    }
}

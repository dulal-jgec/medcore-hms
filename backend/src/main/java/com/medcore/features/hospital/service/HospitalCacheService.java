package com.medcore.features.hospital.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HospitalCacheService {

    private final CacheManager cacheManager;

    public void evictHospitalCaches() {
        evictCache("hospitalList");
        evictCache("hospitalById");
        evictCache("hospitalSearch");
    }

    private void evictCache(String cacheName) {
        var cache = cacheManager.getCache(cacheName);

        if (cache != null) {
            cache.clear();
        }
    }
}
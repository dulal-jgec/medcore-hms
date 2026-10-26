
package com.medcore.features.hospital.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class HospitalCacheService {

    private final CacheManager cacheManager;

    public void evictHospitalCaches() {
        evictCache("hospitalList");
        evictCache("hospitalById");
        evictCache("hospitalSearch");
        evictCache("hospitalProfile");
        evictCache("publicHospitalList");
        evictCache("publicHospitalById");
    }

    public void evictHospitalProfile(Long hospitalId) {
        Cache cache = cacheManager.getCache("hospitalProfile");

        if (cache != null) {
            cache.evict(
                "hospital:" + hospitalId + ":getMyHospitalProfile"
            );
        }
    }

    private void evictCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);

        if (cache != null) {
            cache.clear();
        }
    }
    
    public void evictHospitalProfileAfterCommit(Long hospitalId) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        evictHospitalProfile(hospitalId);
                    }
                }
            );
        } else {
            evictHospitalProfile(hospitalId);
        }
    }
    

    public void evictPublicHospitalGalleryCaches() {
    evictCache("publicHospitalGallery");
    evictCache("publicHospitalGalleryByCategory");
    evictCache("publicHospitalGalleryImage");
}

    public void evictPublicHospitalGalleryCachesAfterCommit() {
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    evictPublicHospitalGalleryCaches();
                }
            }
        );
    } else {
        evictPublicHospitalGalleryCaches();
    }
}

}

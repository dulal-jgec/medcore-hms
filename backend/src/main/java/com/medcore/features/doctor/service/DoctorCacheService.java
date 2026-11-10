package com.medcore.features.doctor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class DoctorCacheService {

    private final CacheManager cacheManager;

    private void evictCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        }
    }

    public void evictDoctorCaches() {
        evictCache("doctorList");
        evictCache("doctorById");
        evictCache("doctorSearch");
        evictCache("doctorProfile");
        evictCache("publicDoctorList");
        evictCache("publicDoctorById");
    }

    public void evictDoctorScheduleCaches() {
        evictCache("doctorSchedules");
    }

    public void evictDoctorCachesAfterCommit() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    evictDoctorCaches();
                }
            });
        } else {
            evictDoctorCaches();
        }
    }

    public void evictDoctorScheduleCachesAfterCommit() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    evictDoctorScheduleCaches();
                }
            });
        } else {
            evictDoctorScheduleCaches();
        }
    }
}
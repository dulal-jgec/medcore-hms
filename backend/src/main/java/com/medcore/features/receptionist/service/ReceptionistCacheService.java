package com.medcore.features.receptionist.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class ReceptionistCacheService {

    private final CacheManager cacheManager;

    private void evictCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        }
    }

    public void evictReceptionistCaches() {
        evictCache("receptionistList");
        evictCache("receptionistById");
        evictCache("receptionistProfile");
        evictCache("receptionistRecentPatients");
    }

    public void evictReceptionistCachesAfterCommit() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    evictReceptionistCaches();
                }
            });
        } else {
            evictReceptionistCaches();
        }
    }
}
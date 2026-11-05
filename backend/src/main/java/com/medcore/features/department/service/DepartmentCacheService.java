package com.medcore.features.department.service;

import com.medcore.common.cache.TenantCacheEvictService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class DepartmentCacheService {

    private final TenantCacheEvictService tenantCacheEvictService;

    public void evictDepartmentCaches(Long hospitalId) {

        tenantCacheEvictService.evictTenantCache(
                "departments", hospitalId
        );

        tenantCacheEvictService.evictTenantCache(
                "publicDepartments", hospitalId
        );

        tenantCacheEvictService.evictTenantCache(
                "publicDepartmentById", hospitalId
        );
    }

    public void evictDepartmentCachesAfterCommit(Long hospitalId) {

        if (TransactionSynchronizationManager.isSynchronizationActive()) {

            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {

                        @Override
                        public void afterCommit() {
                            evictDepartmentCaches(hospitalId);
                        }
                    }
            );

        } else {
            evictDepartmentCaches(hospitalId);
        }
    }
}
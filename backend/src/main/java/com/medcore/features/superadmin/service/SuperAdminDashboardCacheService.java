package com.medcore.features.superadmin.service;

import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.Serializable;

@Service
@RequiredArgsConstructor
public class SuperAdminDashboardCacheService {

    private final HospitalRepository hospitalRepository;

    @Cacheable(cacheNames = "superAdminDashboard", key = "'hospitalCounts'")
    public HospitalCounts getHospitalCounts() {
        long totalHospitals = hospitalRepository.countByDeletedAtIsNull();
        long activeHospitals = hospitalRepository.countByStatusAndDeletedAtIsNull(HospitalStatus.ACTIVE);
        long inactiveHospitals = hospitalRepository.countByStatusAndDeletedAtIsNull(HospitalStatus.INACTIVE);
        long deletedHospitals = hospitalRepository.countByDeletedAtIsNotNull();

        return new HospitalCounts(totalHospitals, activeHospitals, inactiveHospitals, deletedHospitals);
    }

    @CacheEvict(cacheNames = "superAdminDashboard", key = "'hospitalCounts'")
    public void evictHospitalCounts() {
        // Cache eviction logic handled by Spring
    }

    /**
     * Using a standard static class instead of a record to ensure Jackson 
     * can properly deserialize the object from Redis.
     */
    public static class HospitalCounts implements Serializable {
        private long totalHospitals;
        private long activeHospitals;
        private long inactiveHospitals;
        private long deletedHospitals;

        // No-args constructor is required by Jackson for deserialization
        public HospitalCounts() {}

        public HospitalCounts(long totalHospitals, long activeHospitals, long inactiveHospitals, long deletedHospitals) {
            this.totalHospitals = totalHospitals;
            this.activeHospitals = activeHospitals;
            this.inactiveHospitals = inactiveHospitals;
            this.deletedHospitals = deletedHospitals;
        }

        public long getTotalHospitals() { return totalHospitals; }
        public void setTotalHospitals(long totalHospitals) { this.totalHospitals = totalHospitals; }
        
        public long getActiveHospitals() { return activeHospitals; }
        public void setActiveHospitals(long activeHospitals) { this.activeHospitals = activeHospitals; }
        
        public long getInactiveHospitals() { return inactiveHospitals; }
        public void setInactiveHospitals(long inactiveHospitals) { this.inactiveHospitals = inactiveHospitals; }
        
        public long getDeletedHospitals() { return deletedHospitals; }
        public void setDeletedHospitals(long deletedHospitals) { this.deletedHospitals = deletedHospitals; }
    }
}
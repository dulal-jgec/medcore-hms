
package com.medcore.features.superadmin.service;

import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.hospital.enums.HospitalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SuperAdminDashboardCacheService {

    private final HospitalRepository hospitalRepository;

    @Cacheable(cacheNames = "superAdminDashboard", key = "'hospitalCounts'")
    public HospitalCounts getHospitalCounts() {

        long totalHospitals =
                hospitalRepository.countByDeletedAtIsNull();

        long activeHospitals =
                hospitalRepository.countByStatusAndDeletedAtIsNull(
                        HospitalStatus.ACTIVE
                );

        long inactiveHospitals =
                hospitalRepository.countByStatusAndDeletedAtIsNull(
                        HospitalStatus.INACTIVE
                );

        long deletedHospitals =
                hospitalRepository.countByDeletedAtIsNotNull();

        return new HospitalCounts(
                totalHospitals,
                activeHospitals,
                inactiveHospitals,
                deletedHospitals
        );
    }

    public record HospitalCounts(
            long totalHospitals,
            long activeHospitals,
            long inactiveHospitals,
            long deletedHospitals
    ) {}
}

package com.medcore.common.security;

import com.medcore.common.exception.BusinessException;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantContextService {

    private final CurrentUserService currentUserService;
    private final HospitalRepository hospitalRepository;

    public Long getCurrentHospitalId() {

        CurrentUser currentUser =
                currentUserService.getCurrentUser();

        if (currentUser.getHospitalId() == null) {
            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return currentUser.getHospitalId();
    }

    public Hospital getCurrentHospital() {

        Long hospitalId = getCurrentHospitalId();

        return hospitalRepository
                .findByIdAndDeletedAtIsNull(hospitalId)
                .orElseThrow(() ->
                        new BusinessException(
                                "Current hospital not found"
                        ));
    }
}
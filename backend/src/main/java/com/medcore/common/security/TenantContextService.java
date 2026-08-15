package com.medcore.common.security;

import com.medcore.common.exception.BusinessException;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.medcore.features.user.enums.RoleName;
@Service
@RequiredArgsConstructor
public class TenantContextService {

    private final UserRepository userRepository;

    public Hospital getCurrentHospital() {

        String username = SecurityUtil.getCurrentUsername();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() ->
                        new BusinessException("User not found")
                );

        if (user.getRole().getName() == RoleName.SUPER_ADMIN) {
            return null;
        }

        if (user.getHospital() == null) {
            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return user.getHospital();
    }

    public Long getCurrentHospitalId() {

        Hospital hospital = getCurrentHospital();

        return hospital != null ? hospital.getId() : null;
    }
}
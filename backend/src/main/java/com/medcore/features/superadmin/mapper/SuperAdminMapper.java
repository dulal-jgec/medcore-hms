package com.medcore.features.superadmin.mapper;

import com.medcore.features.superadmin.dto.response.SuperAdminResponse;
import com.medcore.features.superadmin.entity.SuperAdmin;

import org.springframework.stereotype.Component;

@Component
public class SuperAdminMapper {

    public SuperAdminResponse toResponse(
            SuperAdmin superAdmin) {

        return SuperAdminResponse.builder()
                .id(superAdmin.getId())
                .userId(
                        superAdmin.getUser().getId()
                )
                .name(
                        superAdmin.getUser().getFullName()
                )
                .email(
                        superAdmin.getUser().getEmail()
                )
                .status(
                        superAdmin.getStatus()
                )
                .build();
    }
}
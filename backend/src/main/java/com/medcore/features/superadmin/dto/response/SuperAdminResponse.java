package com.medcore.features.superadmin.dto.response;

import com.medcore.features.superadmin.enums.SuperAdminStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SuperAdminResponse {

    private Long id;

    private Long userId;

    private String name;

    private String email;

    private SuperAdminStatus status;
}
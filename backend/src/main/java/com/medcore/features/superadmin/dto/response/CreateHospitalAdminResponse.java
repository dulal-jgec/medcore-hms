package com.medcore.features.superadmin.dto.response;

import com.medcore.features.user.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateHospitalAdminResponse {

    private Long userId;

    private String fullName;

    private String email;

    private String phone;

    private Long hospitalId;

    private String hospitalName;

    private UserStatus status;
}
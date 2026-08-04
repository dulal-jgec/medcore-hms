package com.medcore.features.auth.mapper;

import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.UserStatus;

public class AuthMapper {

    private AuthMapper() {
    }

    public static User toUser(RegisterRequest request,
                              Hospital hospital,
                              Role role,
                              String encodedPassword) {

        return User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(encodedPassword)
                .hospital(hospital)
                .role(role)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
    }

}
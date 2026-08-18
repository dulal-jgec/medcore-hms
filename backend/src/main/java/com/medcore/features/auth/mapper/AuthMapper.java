package com.medcore.features.auth.mapper;

import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.UserStatus;

public class AuthMapper {

    private AuthMapper() {
    }

    public static User toUser(
            RegisterRequest request,
            Hospital hospital,
            Role role,
            String encodedPassword,
            String email) {

        return User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(request.getPhone().trim())
                .password(encodedPassword)
                .hospital(hospital)
                .role(role)
                .status(UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
    }

}
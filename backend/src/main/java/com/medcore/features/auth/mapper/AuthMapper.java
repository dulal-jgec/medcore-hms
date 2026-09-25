package com.medcore.features.auth.mapper;

import com.medcore.features.auth.dto.request.RegisterRequest;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.UserStatus;

public class AuthMapper {

    private AuthMapper() {
    }

    public static User toUser(
            RegisterRequest request,
            Role role,
            String encodedPassword,
            String email) {

        return User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(request.getPhone().trim())

                // Common user profile information
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .occupation(request.getOccupation())
                .gender(request.getGender())
                .maritalStatus(request.getMaritalStatus())

                .password(encodedPassword)
                .role(role)
                .status(UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
    }
}
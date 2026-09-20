package com.medcore.features.accountant.dto.response;

import com.medcore.features.accountant.enums.AccountantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AccountantProfileResponse {

    private Long id;
    private Long userId;

    private String name;
    private String email;
    private String phone;

    private String profileImageUrl;
    private String bio;
    private String languages;
    private String emergencyContact;

    private Long hospitalId;
    private String hospitalName;

    private String designation;

    private AccountantStatus status;

    private LocalDateTime createdAt;
}
package com.medcore.features.accountant.dto.response;

import com.medcore.features.accountant.enums.AccountantStatus;
import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.user.enums.UserStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AccountantResponse {

    private Long id;

    private Long userId;

    private String name;

    private String email;

    private Long hospitalId;

    private String designation;

    private AccountantStatus status;
    
    private UserStatus userStatus;

    private EmailOutboxStatus invitationStatus;
}
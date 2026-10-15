package com.medcore.features.nurse.dto.response;

import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.nurse.enums.NurseStatus;
import com.medcore.features.user.enums.UserStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NurseResponse {

    private Long id;

    private Long userId;

    private String name;

    private String email;

    private Long hospitalId;

    private String department;
    
    private String profileImageUrl;

    private String ward;

    private String designation;

    private String qualification;

    private String licenseNumber;

    private NurseStatus status;

    private UserStatus userStatus;

    private EmailOutboxStatus invitationStatus;
}
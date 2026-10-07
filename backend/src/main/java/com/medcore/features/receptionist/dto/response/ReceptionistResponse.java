package com.medcore.features.receptionist.dto.response;

import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.receptionist.enums.ReceptionistStatus;
import com.medcore.features.user.enums.UserStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReceptionistResponse {

    private Long id;

    private Long userId;

    private String name;

    private String email;

    private Long hospitalId;

    private String designation;

    private ReceptionistStatus status;
    
    private UserStatus userStatus;

    private EmailOutboxStatus invitationStatus;
}
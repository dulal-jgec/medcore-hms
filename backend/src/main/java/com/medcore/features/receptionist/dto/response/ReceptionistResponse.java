package com.medcore.features.receptionist.dto.response;

import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.receptionist.enums.ReceptionistStatus;
import com.medcore.features.user.enums.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionistResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private Long hospitalId;
    private String designation;
    private String profileImageUrl;
    private ReceptionistStatus status;
    private UserStatus userStatus;
    private EmailOutboxStatus invitationStatus;
}
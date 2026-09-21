package com.medcore.features.receptionist.dto.response;

import com.medcore.features.receptionist.enums.ReceptionistStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ReceptionistProfileResponse {

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

    private ReceptionistStatus status;

    private LocalDateTime createdAt;
}
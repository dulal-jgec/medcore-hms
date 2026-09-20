package com.medcore.features.nurse.dto.response;

import com.medcore.features.nurse.enums.NurseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class NurseProfileResponse {

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

    private String department;

    private String ward;

    private String designation;

    private String qualification;

    private String licenseNumber;

    private NurseStatus status;

    private LocalDateTime createdAt;
}
package com.medcore.features.accountant.mapper;

import com.medcore.features.accountant.dto.request.CreateAccountantRequest;
import com.medcore.features.accountant.dto.request.UpdateAccountantRequest;
import com.medcore.features.accountant.dto.request.UpdateMyAccountantProfileRequest;
import com.medcore.features.accountant.dto.response.AccountantProfileResponse;
import com.medcore.features.accountant.dto.response.AccountantResponse;
import com.medcore.features.accountant.entity.Accountant;
import com.medcore.features.notification.service.InvitationStatusService;
import com.medcore.features.user.entity.User;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountantMapper {

    private final InvitationStatusService invitationStatusService;

    public Accountant toEntity(
            CreateAccountantRequest request,
            User user) {

        return Accountant.builder()
                .user(user)
                .hospital(user.getHospital())
                .designation(request.getDesignation())
                .build();
    }

    public void updateEntity(
            Accountant accountant,
            UpdateAccountantRequest request) {

        accountant.setDesignation(
                request.getDesignation()
        );
    }

    public AccountantResponse toResponse(
            Accountant accountant) {

        User user = accountant.getUser();

        return AccountantResponse.builder()
                .id(accountant.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .hospitalId(
                        accountant.getHospital() != null
                                ? accountant.getHospital().getId()
                                : null
                )
                .designation(
                        accountant.getDesignation()
                )
                .status(
                        accountant.getStatus()
                )
                .userStatus(
                        user.getStatus()
                )
                .invitationStatus(
                        invitationStatusService
                                .getInvitationStatus(user)
                )
                .build();
    }

    public AccountantProfileResponse toProfileResponse(
            Accountant accountant) {

        User user = accountant.getUser();

        return AccountantProfileResponse.builder()
                .id(accountant.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageUrl(
                        accountant.getProfileImageUrl()
                )
                .bio(
                        accountant.getBio()
                )
                .hospitalId(
                        accountant.getHospital() != null
                                ? accountant.getHospital().getId()
                                : null
                )
                .hospitalName(
                        accountant.getHospital() != null
                                ? accountant.getHospital().getName()
                                : null
                )
                .designation(
                        accountant.getDesignation()
                )
                .status(
                        accountant.getStatus()
                )
                .createdAt(
                        accountant.getCreatedAt()
                )
                .build();
    }

    public void updateMyProfile(
            Accountant accountant,
            UpdateMyAccountantProfileRequest request) {

        if (request.getBio() != null) {
            accountant.setBio(
                    request.getBio().trim()
            );
        }
    }
}
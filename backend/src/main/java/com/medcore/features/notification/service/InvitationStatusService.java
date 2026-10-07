package com.medcore.features.notification.service;

import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.notification.enums.EmailType;
import com.medcore.features.notification.repository.EmailOutboxRepository;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InvitationStatusService {

    private final EmailOutboxRepository emailOutboxRepository;

    public EmailOutboxStatus getInvitationStatus(User user) {

        if (user == null || user.getRole() == null) {
            return null;
        }

        EmailType emailType = resolveEmailType(
                user.getRole().getName()
        );

        if (emailType == null) {
            return null;
        }

        return emailOutboxRepository
                .findTopByUser_IdAndTypeOrderByInvitationAttemptDescCreatedAtDesc(
                        user.getId(),
                        emailType
                )
                .map(EmailOutbox::getStatus)
                .orElse(null);
    }

    private EmailType resolveEmailType(RoleName roleName) {

        return switch (roleName) {

            case DOCTOR ->
                    EmailType.DOCTOR_CREDENTIALS;

            case NURSE ->
                    EmailType.NURSE_CREDENTIALS;

            case RECEPTIONIST ->
                    EmailType.RECEPTIONIST_CREDENTIALS;

            case ACCOUNTANT ->
                    EmailType.ACCOUNTANT_CREDENTIALS;

            default ->
                    null;
        };
    }
}
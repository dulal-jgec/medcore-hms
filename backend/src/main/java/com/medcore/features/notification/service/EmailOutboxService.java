package com.medcore.features.notification.service;

import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.enums.EmailType;
import com.medcore.features.notification.repository.EmailOutboxRepository;
import com.medcore.features.user.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailOutboxService {

    private final EmailOutboxRepository emailOutboxRepository;

    public EmailOutbox createEmail(
            User user,
            EmailType type,
            String recipient,
            String subject,
            String body,
            Integer invitationAttempt
    ) {

        EmailOutbox email = EmailOutbox.builder()
                .user(user)
                .type(type)
                .recipient(recipient)
                .subject(subject)
                .body(body)
                .invitationAttempt(invitationAttempt)
                .build();

        return emailOutboxRepository.save(email);
    }
}
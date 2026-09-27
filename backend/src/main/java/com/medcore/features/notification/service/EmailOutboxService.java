package com.medcore.features.notification.service;

import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.repository.EmailOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailOutboxService {

    private final EmailOutboxRepository emailOutboxRepository;

    public EmailOutbox createEmail(
            String recipient,
            String subject,
            String body
    ) {

        EmailOutbox email = EmailOutbox.builder()
                .recipient(recipient)
                .subject(subject)
                .body(body)
                .build();

        return emailOutboxRepository.save(email);
    }
}
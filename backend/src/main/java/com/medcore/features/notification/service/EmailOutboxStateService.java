package com.medcore.features.notification.service;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.notification.repository.EmailOutboxRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailOutboxStateService {

    private final EmailOutboxRepository emailOutboxRepository;

    @Transactional
    public List<EmailOutbox> claimEmails() {

        LocalDateTime now = LocalDateTime.now();

        List<EmailOutbox> emails =
                emailOutboxRepository.claimPendingEmails(now, 50);

        for (EmailOutbox email : emails) {
            email.setStatus(EmailOutboxStatus.PROCESSING);
            email.setProcessingStartedAt(now);
        }

        emailOutboxRepository.saveAll(emails);

        return emails;
    }

    @Transactional
    public void markAsSent(Long emailId) {

        EmailOutbox email =
                emailOutboxRepository.findById(emailId)
                        .orElseThrow();

        email.setStatus(EmailOutboxStatus.SENT);
        email.setSentAt(LocalDateTime.now());
        email.setProcessingStartedAt(null);
        email.setNextAttemptAt(null);

        emailOutboxRepository.save(email);
    }

    @Transactional
    public void markAsFailed(Long emailId, Exception ex) {

        EmailOutbox email =
                emailOutboxRepository.findById(emailId)
                        .orElseThrow();

        int retryCount = email.getRetryCount() + 1;

        email.setRetryCount(retryCount);
        email.setLastError(ex.getMessage());
        email.setProcessingStartedAt(null);

        if (retryCount >= 5) {

            email.setStatus(EmailOutboxStatus.FAILED);
            email.setNextAttemptAt(null);

        } else {

            email.setStatus(EmailOutboxStatus.PENDING);
            email.setNextAttemptAt(
                    LocalDateTime.now().plusMinutes(5)
            );
        }

        emailOutboxRepository.save(email);
    }

    @Transactional
    public int recoverStaleEmails() {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.minusMinutes(10);

        return emailOutboxRepository
                .recoverStaleEmails(threshold, now);
    }
}

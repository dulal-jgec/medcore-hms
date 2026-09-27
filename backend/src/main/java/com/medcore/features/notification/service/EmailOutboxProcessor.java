package com.medcore.features.notification.service;

import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.notification.repository.EmailOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailOutboxProcessor {

    private final EmailOutboxRepository emailOutboxRepository;
    private final EmailService emailService;
    private static final int MAX_RETRIES = 5;
    
    
    @Scheduled(fixedDelay = 10000)
    public void processPendingEmails() {

        List<EmailOutbox> emails = claimEmails();

        for (EmailOutbox email : emails) {
            processEmail(email);
        }
    }

    @Transactional
    public List<EmailOutbox> claimEmails() {

        List<EmailOutbox> emails =
                emailOutboxRepository.claimPendingEmails(
                        LocalDateTime.now(),
                        50
                );

        for (EmailOutbox email : emails) {
        	email.setStatus(EmailOutboxStatus.PROCESSING);
        	email.setProcessingStartedAt(LocalDateTime.now());        }

        emailOutboxRepository.saveAll(emails);

        return emails;
    }

    public void processEmail(EmailOutbox email) {

        try {

            emailService.send(
                    email.getRecipient(),
                    email.getSubject(),
                    email.getBody()
            );

            markAsSent(email.getId());

        } catch (Exception ex) {

            markAsFailed(email.getId(), ex);

            log.error(
                    "Failed to send email. outboxId={}, retryCount={}",
                    email.getId(),
                    email.getRetryCount(),
                    ex
            );
        }
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
public void markAsFailed(
        Long emailId,
        Exception ex
) {

    EmailOutbox email =
            emailOutboxRepository.findById(emailId)
                    .orElseThrow();

    int retryCount = email.getRetryCount() + 1;

    email.setRetryCount(retryCount);
    email.setLastError(ex.getMessage());
    email.setProcessingStartedAt(null);

    if (retryCount >= MAX_RETRIES) {

        email.setStatus(EmailOutboxStatus.FAILED);
        email.setNextAttemptAt(null);

        log.error(
                "Email permanently failed. outboxId={}, retryCount={}",
                email.getId(),
                retryCount
        );

    } else {

        email.setStatus(EmailOutboxStatus.PENDING);

        email.setNextAttemptAt(
                LocalDateTime.now().plusMinutes(5)
        );
    }

    emailOutboxRepository.save(email);
}
    
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void recoverStaleEmails() {

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime threshold =
                now.minusMinutes(10);

        int recovered = emailOutboxRepository.recoverStaleEmails(
                threshold,
                now,
                EmailOutboxStatus.PENDING,
                EmailOutboxStatus.PROCESSING
        );

        if (recovered > 0) {
            log.warn(
                    "Recovered {} stale email outbox records",
                    recovered
            );
        }
    }
}
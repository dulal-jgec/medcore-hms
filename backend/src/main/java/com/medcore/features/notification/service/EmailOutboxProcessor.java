package com.medcore.features.notification.service;

import com.medcore.features.notification.entity.EmailOutbox;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
 
 import java.util.List;


@Component
@RequiredArgsConstructor
@Slf4j
public class EmailOutboxProcessor {

    private final EmailOutboxStateService stateService;
    private final EmailService emailService;

    @Scheduled(fixedDelay = 10000)
    public void processPendingEmails() {

        List<EmailOutbox> emails =
                stateService.claimEmails();

        for (EmailOutbox email : emails) {
            processEmail(email);
        }
    }

    private void processEmail(EmailOutbox email) {

        try {

            emailService.send(
                    email.getRecipient(),
                    email.getSubject(),
                    email.getBody()
            );

            stateService.markAsSent(email.getId());

        } catch (Exception ex) {

            stateService.markAsFailed(
                    email.getId(),
                    ex
            );

            log.error(
                    "Failed to send email. outboxId={}, retryCount={}",
                    email.getId(),
                    email.getRetryCount(),
                    ex
            );
        }
    }

    @Scheduled(fixedDelay = 60000)
    public void recoverStaleEmails() {

        int recovered =
                stateService.recoverStaleEmails();

        if (recovered > 0) {
            log.warn(
                    "Recovered {} stale email outbox records",
                    recovered
            );
        }
    }
}
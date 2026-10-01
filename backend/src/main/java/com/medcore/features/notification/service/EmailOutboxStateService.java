package com.medcore.features.notification.service;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.notification.repository.EmailOutboxRepository;
import com.medcore.features.user.enums.UserStatus;

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

    if (email.getUser() != null
            && email.getUser().getStatus() == UserStatus.PENDING_VERIFICATION) {

        email.getUser().setStatus(UserStatus.ACTIVE);
    }

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

        email.setStatus(EmailOutboxStatus.EXHAUSTED);
        email.setNextAttemptAt(null);

        if (email.getInvitationAttempt() >= 3
                && email.getUser() != null
                && email.getUser().getStatus()
                == UserStatus.PENDING_VERIFICATION) {

            email.getUser().setStatus(
                    UserStatus.INVITATION_EXPIRED
            );
        }

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

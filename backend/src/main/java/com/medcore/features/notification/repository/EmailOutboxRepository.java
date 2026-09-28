package com.medcore.features.notification.repository;

import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.enums.EmailOutboxStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface EmailOutboxRepository
        extends JpaRepository<EmailOutbox, Long> {

    @Query(
            value = """
                    SELECT *
                    FROM email_outbox
                    WHERE status = 'PENDING'
                      AND (
                            next_attempt_at IS NULL
                            OR next_attempt_at <= :now
                          )
                    ORDER BY created_at ASC
                    LIMIT :limit
                    FOR UPDATE SKIP LOCKED
                    """,
            nativeQuery = true
    )
    List<EmailOutbox> claimPendingEmails(
            LocalDateTime now,
            int limit
    );
    
    @Modifying
    @Query("""
        UPDATE EmailOutbox e
        SET e.status = com.medcore.features.notification.enums.EmailOutboxStatus.PENDING,
            e.nextAttemptAt = :now,
            e.processingStartedAt = NULL
        WHERE e.status = com.medcore.features.notification.enums.EmailOutboxStatus.PROCESSING
          AND e.processingStartedAt < :threshold
    """)
    int recoverStaleEmails(
            @Param("threshold") LocalDateTime threshold,
            @Param("now") LocalDateTime now
    );
}
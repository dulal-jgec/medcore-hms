package com.medcore.features.notification.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.notification.enums.EmailOutboxStatus;
import com.medcore.features.notification.enums.EmailType;
import com.medcore.features.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_outbox")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailOutbox extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String recipient;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private EmailOutboxStatus status = EmailOutboxStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EmailType type;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer invitationAttempt = 1;

    private LocalDateTime sentAt;

    private LocalDateTime nextAttemptAt;

    private LocalDateTime processingStartedAt;
    	
    @Column(nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    @Column(columnDefinition = "TEXT")
    private String lastError;
}
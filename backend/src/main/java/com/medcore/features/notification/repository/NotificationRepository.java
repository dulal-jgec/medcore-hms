package com.medcore.features.notification.repository;

import com.medcore.features.notification.entity.Notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    Page<Notification> findByHospitalIdAndRecipientIdAndDeletedAtIsNull(
            Long hospitalId,
            Long recipientId,
            Pageable pageable
    );

    Page<Notification> findByHospitalIdAndRecipientIdAndReadFalseAndDeletedAtIsNull(
            Long hospitalId,
            Long recipientId,
            Pageable pageable
    );
}
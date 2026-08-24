package com.medcore.features.notification.repository;

import com.medcore.features.notification.entity.NotificationDelivery;
import com.medcore.features.notification.enums.DeliveryStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationDeliveryRepository
extends JpaRepository<NotificationDelivery, Long> {

List<NotificationDelivery> findByStatus(
    DeliveryStatus status
);

List<NotificationDelivery> findByStatusAndRetryCountLessThan(
    DeliveryStatus status,
    Integer retryCount
);
}
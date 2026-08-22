package com.medcore.features.notification.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.notification.enums.DeliveryStatus;
import com.medcore.features.notification.enums.NotificationChannel;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDelivery extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "notification_id",
            nullable = false
    )
    private Notification notification;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private DeliveryStatus status =
            DeliveryStatus.PENDING;

    @Column(length = 255)
    private String recipientAddress;

    @Column(length = 1000)
    private String errorMessage;
}
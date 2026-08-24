package com.medcore.features.notification.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.features.notification.channel.SmsNotificationChannel;
import com.medcore.features.notification.provider.NotificationDeliveryResult;
import com.medcore.features.notification.channel.EmailNotificationChannel;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.hospital.entity.Hospital;

import com.medcore.features.notification.dto.response.NotificationResponse;
import com.medcore.features.notification.entity.Notification;
import com.medcore.features.notification.entity.NotificationDelivery;
import com.medcore.features.notification.enums.DeliveryStatus;
import com.medcore.features.notification.enums.NotificationChannel;
import com.medcore.features.notification.enums.NotificationType;
import com.medcore.features.notification.repository.NotificationDeliveryRepository;
import com.medcore.features.notification.repository.NotificationRepository;
import com.medcore.features.notification.service.NotificationService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final NotificationDeliveryRepository
            notificationDeliveryRepository;

    private final UserRepository userRepository;

    private final TenantContextService tenantContextService;

    private final SimpMessagingTemplate messagingTemplate;
    private final EmailNotificationChannel emailNotificationChannel;
    private final SmsNotificationChannel smsNotificationChannel;
     
    @Override
    @Transactional
    public void sendNotification(
            Long recipientUserId,
            NotificationType type,
            String title,
            String message) {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {

            throw new BusinessException(
                    "Hospital context is required"
            );
        }

        User recipient =
                userRepository
                        .findById(recipientUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification recipient not found"
                                )
                        );

        // Tenant isolation
        if (recipient.getHospital() == null
                || !recipient.getHospital()
                        .getId()
                        .equals(hospitalId)) {

            throw new BusinessException(
                    "User does not belong to current hospital"
            );
        }

        Hospital hospital =
                recipient.getHospital();


        Notification notification =
                Notification.builder()
                        .recipient(recipient)
                        .hospital(hospital)
                        .type(type)
                        .title(title)
                        .message(message)
                        .build();

        Notification savedNotification =
                notificationRepository.save(
                        notification
                );
        DeliveryStatus deliveryStatus;
        String errorMessage = null;

        try {
            emailNotificationChannel.send(
                    recipient,
                    title,
                    message
            );

            deliveryStatus = DeliveryStatus.SENT;

        } catch (Exception e) {
            deliveryStatus = DeliveryStatus.FAILED;
            errorMessage = e.getMessage();
        }
        
        NotificationDeliveryResult smsResult =
                smsNotificationChannel.send(
                        recipient,
                        title,
                        message
                );

        NotificationDelivery smsDelivery =
                NotificationDelivery.builder()
                        .notification(savedNotification)
                        .channel(NotificationChannel.SMS)
                        .status(
                                smsResult.isSuccess()
                                        ? DeliveryStatus.SENT
                                        : DeliveryStatus.FAILED
                        )
                        .recipientAddress(
                                recipient.getPhone()
                        )
                        .errorMessage(
                                smsResult.getErrorMessage()
                        )
                        .build();

        notificationDeliveryRepository.save(
                smsDelivery
        );

        NotificationDelivery delivery =
                NotificationDelivery.builder()
                        .notification(savedNotification)
                        .channel(NotificationChannel.EMAIL)
                        .status(deliveryStatus)
                        .recipientAddress(recipient.getEmail())
                        .errorMessage(errorMessage)
                        .build();

        notificationDeliveryRepository.save(
                delivery
        );
        
        NotificationResponse notificationResponse =
                NotificationResponse.builder()
                        .id(savedNotification.getId())
                        .type(savedNotification.getType())
                        .title(savedNotification.getTitle())
                        .message(savedNotification.getMessage())
                        .read(savedNotification.getRead())
                        .createdAt(savedNotification.getCreatedAt())
                        .build();

        sendRealtimeNotification(
                recipient.getId(),
                notificationResponse
        );
    }


    

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(
            int page,
            int size) {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {

            throw new BusinessException(
                    "Hospital context is required"
            );
        }

        User currentUser =
                getCurrentUser();


        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );


        return notificationRepository
                .findByHospitalIdAndRecipientIdAndDeletedAtIsNull(
                        hospitalId,
                        currentUser.getId(),
                        pageable
                )
                .map(notification ->
                        NotificationResponse
                                .builder()
                                .id(
                                        notification.getId()
                                )
                                .type(
                                        notification.getType()
                                )
                                .title(
                                        notification.getTitle()
                                )
                                .message(
                                        notification.getMessage()
                                )
                                .read(
                                        notification.getRead()
                                )
                                .createdAt(
                                        notification.getCreatedAt()
                                )
                                .build()
                );
    }
    
    @Override
    @Transactional
    public void markAsRead(Long notificationId) {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "Hospital context is required"
            );
        }

        User currentUser =
                getCurrentUser();

        Notification notification =
                notificationRepository
                        .findByIdAndHospitalIdAndRecipientIdAndDeletedAtIsNull(
                                notificationId,
                                hospitalId,
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found"
                                )
                        );

        if (Boolean.TRUE.equals(notification.getRead())) {
            throw new BusinessException(
                    "Notification is already marked as read"
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "Hospital context is required"
            );
        }

        User currentUser =
                getCurrentUser();

        return notificationRepository
                .countByHospitalIdAndRecipientIdAndReadFalseAndDeletedAtIsNull(
                        hospitalId,
                        currentUser.getId()
                );
    } 
    
    
    @Override
    public void sendRealtimeNotification(
            Long userId,
            NotificationResponse notification) {

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
        );
    }
     

    private User getCurrentUser() {

        String email =
                SecurityUtil
                        .getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        )
                );
    }
}
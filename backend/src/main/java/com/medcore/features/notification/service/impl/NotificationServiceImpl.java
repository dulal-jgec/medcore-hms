package com.medcore.features.notification.service.impl;

import com.medcore.common.exception.BusinessException;
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

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final NotificationDeliveryRepository
            notificationDeliveryRepository;

    private final UserRepository userRepository;

    private final TenantContextService tenantContextService;


     
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


        NotificationDelivery delivery =
                NotificationDelivery.builder()
                        .notification(savedNotification)
                        .channel(
                                NotificationChannel.IN_APP
                        )
                        .status(
                                DeliveryStatus.SENT
                        )
                        .recipientAddress(
                                recipient.getEmail()
                        )
                        .build();

        notificationDeliveryRepository.save(
                delivery
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
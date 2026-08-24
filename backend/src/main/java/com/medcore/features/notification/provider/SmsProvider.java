package com.medcore.features.notification.provider;

public interface SmsProvider {

	NotificationDeliveryResult sendSms(
	        String phoneNumber,
	        String message
	);
}
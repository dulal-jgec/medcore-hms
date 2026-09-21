package com.medcore.features.receptionist.mapper;

import com.medcore.features.receptionist.dto.request.CreateReceptionistRequest;
import com.medcore.features.receptionist.dto.request.UpdateReceptionistRequest;
import com.medcore.features.receptionist.dto.response.ReceptionistResponse;
import com.medcore.features.receptionist.entity.Receptionist;
import com.medcore.features.user.entity.User;
import org.springframework.stereotype.Component;
import com.medcore.features.receptionist.dto.request.UpdateMyReceptionistProfileRequest;
import com.medcore.features.receptionist.dto.response.ReceptionistProfileResponse;

@Component
public class ReceptionistMapper {

	public Receptionist toEntity(
	        CreateReceptionistRequest request,
	        User user) {

	    return Receptionist.builder()
	            .user(user)
	            .hospital(user.getHospital())
	            .designation(request.getDesignation())
	            .build();
	}

    public void updateEntity(
            Receptionist receptionist,
            UpdateReceptionistRequest request) {

        receptionist.setDesignation(
                request.getDesignation()
        );
    }

    public ReceptionistResponse toResponse(
            Receptionist receptionist) {

        User user = receptionist.getUser();

        return ReceptionistResponse.builder()
                .id(receptionist.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .hospitalId(
                        receptionist.getHospital() != null
                                ? receptionist.getHospital().getId()
                                : null
                )
                .designation(receptionist.getDesignation())
                .status(receptionist.getStatus())
                .build();
    }
    
    public ReceptionistProfileResponse toProfileResponse(
            Receptionist receptionist) {

        User user = receptionist.getUser();

        return ReceptionistProfileResponse.builder()
                .id(receptionist.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageUrl(
                        receptionist.getProfileImageUrl()
                )
                .bio(receptionist.getBio())
                .languages(receptionist.getLanguages())
                .emergencyContact(
                        receptionist.getEmergencyContact()
                )
                .hospitalId(
                        receptionist.getHospital().getId()
                )
                .hospitalName(
                        receptionist.getHospital().getName()
                )
                .designation(
                        receptionist.getDesignation()
                )
                .status(
                        receptionist.getStatus()
                )
                .createdAt(
                        receptionist.getCreatedAt()
                )
                .build();
    }
    
    public void updateMyProfile(
            Receptionist receptionist,
            UpdateMyReceptionistProfileRequest request) {

        if (request.getBio() != null) {
            receptionist.setBio(
                    request.getBio().trim()
            );
        }

        if (request.getLanguages() != null) {
            receptionist.setLanguages(
                    request.getLanguages().trim()
            );
        }

        if (request.getEmergencyContact() != null) {
            receptionist.setEmergencyContact(
                    request.getEmergencyContact().trim()
            );
        }
    }
}

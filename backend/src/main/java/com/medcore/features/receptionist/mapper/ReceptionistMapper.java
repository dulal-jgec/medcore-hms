package com.medcore.features.receptionist.mapper;

import com.medcore.features.receptionist.dto.request.CreateReceptionistRequest;
import com.medcore.features.receptionist.dto.request.UpdateReceptionistRequest;
import com.medcore.features.receptionist.dto.response.ReceptionistResponse;
import com.medcore.features.receptionist.entity.Receptionist;
import com.medcore.features.user.entity.User;
import org.springframework.stereotype.Component;

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
}

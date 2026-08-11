package com.medcore.features.accountant.mapper;

import com.medcore.features.accountant.dto.request.CreateAccountantRequest;
import com.medcore.features.accountant.dto.request.UpdateAccountantRequest;
import com.medcore.features.accountant.dto.response.AccountantResponse;
import com.medcore.features.accountant.entity.Accountant;
import com.medcore.features.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AccountantMapper {

    public Accountant toEntity(
            CreateAccountantRequest request,
            User user) {

        return Accountant.builder()
                .user(user)
                .hospital(user.getHospital())
                .designation(request.getDesignation())
                .build();
    }

    public void updateEntity(
            Accountant accountant,
            UpdateAccountantRequest request) {

        accountant.setDesignation(
                request.getDesignation()
        );
    }

    public AccountantResponse toResponse(
            Accountant accountant) {

        User user = accountant.getUser();

        return AccountantResponse.builder()
                .id(accountant.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .hospitalId(
                        accountant.getHospital() != null
                                ? accountant.getHospital().getId()
                                : null
                )
                .designation(accountant.getDesignation())
                .status(accountant.getStatus())
                .build();
    }
}
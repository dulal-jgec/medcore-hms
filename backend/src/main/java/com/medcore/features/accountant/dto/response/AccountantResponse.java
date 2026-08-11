package com.medcore.features.accountant.dto.response;

import com.medcore.features.accountant.enums.AccountantStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AccountantResponse {

    private Long id;

    private Long userId;

    private String name;

    private String email;

    private Long hospitalId;

    private String designation;

    private AccountantStatus status;
}
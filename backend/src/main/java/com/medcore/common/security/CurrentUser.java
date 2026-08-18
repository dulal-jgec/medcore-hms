package com.medcore.common.security;

import com.medcore.features.user.enums.RoleName;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CurrentUser {

    private final Long userId;
    private final RoleName role;
    private final Long hospitalId;
}
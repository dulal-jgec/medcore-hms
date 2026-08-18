package com.medcore.common.security;

import com.medcore.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    public CurrentUser getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                instanceof com.medcore.common.security.userdetails.CustomUserDetails)) {

            throw new BusinessException("User is not authenticated");
        }

        com.medcore.common.security.userdetails.CustomUserDetails userDetails =
                (com.medcore.common.security.userdetails.CustomUserDetails)
                        authentication.getPrincipal();

        return userDetails.getCurrentUser();
    }
}
package com.medcore.common.cache;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.security.TenantContextService;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Component("tenantCacheKeyGenerator")
@RequiredArgsConstructor
public class TenantCacheKeyGenerator implements KeyGenerator {

    private final TenantContextService tenantContextService;

    @Override
    public Object generate(
            Object target,
            Method method,
            Object... params) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "Hospital context is required for cache access"
            );
        }

        StringBuilder key =
                new StringBuilder();

        key.append("hospital:")
                .append(hospitalId)
                .append(":")
                .append(method.getName());

        for (Object param : params) {

            key.append(":")
                    .append(param);
        }

        return key.toString();
    }
}
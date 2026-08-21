package com.medcore.common.cache;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.security.TenantContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantCacheEvictService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final TenantContextService tenantContextService;

    public void evictDepartments() {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "Hospital context is required"
            );
        }

        String pattern =
                "departments::hospital:"
                        + hospitalId
                        + ":*";

        var keys =
                redisTemplate
                        .keys(pattern);

        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
    
    public void evictLabOrders() {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "Hospital context is required"
            );
        }

        String pattern =
                "labOrders::hospital:"
                        + hospitalId
                        + ":*";

        var keys =
                redisTemplate.keys(pattern);

        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
    

    
}
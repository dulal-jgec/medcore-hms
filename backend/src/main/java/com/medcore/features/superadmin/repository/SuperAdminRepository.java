package com.medcore.features.superadmin.repository;

import com.medcore.features.superadmin.entity.SuperAdmin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuperAdminRepository
        extends JpaRepository<SuperAdmin, Long> {

    Optional<SuperAdmin>
    findByUserIdAndDeletedAtIsNull(Long userId);

    boolean existsByUserIdAndDeletedAtIsNull(
            Long userId
    );
}
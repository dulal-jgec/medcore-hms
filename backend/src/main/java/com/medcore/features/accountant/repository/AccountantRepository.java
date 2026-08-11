package com.medcore.features.accountant.repository;

import com.medcore.features.accountant.entity.Accountant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountantRepository
        extends JpaRepository<Accountant, Long> {

    Optional<Accountant> findByIdAndDeletedAtIsNull(
            Long id
    );

    Optional<Accountant> findByUserIdAndDeletedAtIsNull(
            Long userId
    );

    boolean existsByUserIdAndDeletedAtIsNull(
            Long userId
    );
}
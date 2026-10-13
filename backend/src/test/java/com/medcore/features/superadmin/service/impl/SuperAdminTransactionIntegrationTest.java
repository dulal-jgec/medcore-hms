package com.medcore.features.superadmin.service.impl;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.UserRepository;
import com.medcore.features.user.repository.RoleRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class SuperAdminTransactionIntegrationTest {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void shouldRollbackDatabaseChangesWhenTransactionFails() {
        TransactionTemplate transactionTemplate =
                new TransactionTemplate(transactionManager);

        String email = "rollback-test@medcore.local";

        assertFalse(userRepository.existsByEmail(email));

        assertThrows(RuntimeException.class, () ->
            transactionTemplate.execute(status -> {
                Role role = roleRepository.findAll()
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "No role exists in test database"));

                User user = User.builder()
                        .fullName("Rollback Test")
                        .email(email)
                        .password("test-password")
                        .role(role)
                        .status(UserStatus.ACTIVE)
                        .emailVerified(false)
                        .phoneVerified(false)
                        .build();

                userRepository.saveAndFlush(user);

                throw new RuntimeException("Simulated failure");
            })
        );

        assertFalse(userRepository.existsByEmail(email),
                "User should not exist after transaction rollback");
    }
}
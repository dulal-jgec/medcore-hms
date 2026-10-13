
package com.medcore.features.superadmin.service.impl;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.repository.EmailOutboxRepository;
import com.medcore.features.superadmin.dto.request.CreateHospitalAdminRequest;
import com.medcore.features.superadmin.entity.SuperAdmin;
import com.medcore.features.superadmin.enums.SuperAdminStatus;
import com.medcore.features.superadmin.repository.SuperAdminRepository;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

@SpringBootTest
@ActiveProfiles("test")
class SuperAdminTransactionRollbackTest {

    @Autowired
    private SuperAdminServiceImpl superAdminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private SuperAdminRepository superAdminRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @MockitoBean
    private EmailOutboxRepository emailOutboxRepository;

    @Test
    void shouldRollbackUserWhenEmailOutboxSaveFails() {
    	
        TransactionTemplate tx =
                new TransactionTemplate(transactionManager);

        String suffix = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 10);

        String adminEmail =
                "rollback-admin-" + suffix + "@medcore.local";

        String superAdminEmail =
                "rollback-super-" + suffix + "@medcore.local";

        String hospitalEmail =
                "rollback-hospital-" + suffix + "@medcore.local";

        String adminPhone = "9" + suffix.substring(0, 9);
        String superAdminPhone = "8" + suffix.substring(0, 9);
        String hospitalPhone = "7" + suffix.substring(0, 9);

        Long hospitalId = tx.execute(status -> {

            Role superAdminRole = roleRepository
                    .findByName(RoleName.SUPER_ADMIN)
                    .orElseGet(() -> roleRepository.save(
                            Role.builder()
                                    .name(RoleName.SUPER_ADMIN)
                                    .description("Super Administrator")
                                    .build()
                    ));

            User superAdminUser = userRepository.save(
                    User.builder()
                            .fullName("Test Super Admin")
                            .email(superAdminEmail)
                            .phone(superAdminPhone)
                            .password("test-password")
                            .role(superAdminRole)
                            .status(UserStatus.ACTIVE)
                            .emailVerified(true)
                            .phoneVerified(true)
                            .build()
            );

            superAdminRepository.save(
                    SuperAdmin.builder()
                            .user(superAdminUser)
                            .status(SuperAdminStatus.ACTIVE)
                            .build()
            );

            Hospital hospital = hospitalRepository.save(
                    Hospital.builder()
                            .name("Rollback Hospital " + suffix)
                            .email(hospitalEmail)
                            .phone(hospitalPhone)
                            .licenseNumber("LIC-" + suffix)
                            .status(HospitalStatus.ACTIVE)
                            .build()
            );

            return hospital.getId();
        });

        Role hospitalAdminRole = roleRepository
                .findByName(RoleName.HOSPITAL_ADMIN)
                .orElseGet(() -> tx.execute(status ->
                        roleRepository.save(
                                Role.builder()
                                        .name(RoleName.HOSPITAL_ADMIN)
                                        .description("Hospital Administrator")
                                        .build()
                        )
                ));

        assertNotNull(hospitalId);
        assertNotNull(hospitalAdminRole);
        assertFalse(userRepository.existsByEmail(adminEmail));

        doThrow(new RuntimeException("Simulated outbox failure"))
                .when(emailOutboxRepository)
                .save(any(EmailOutbox.class));

        var authentication =
                new UsernamePasswordAuthenticationToken(
                        superAdminEmail,
                        null,
                        List.of()
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        try {
            CreateHospitalAdminRequest request =
                    new CreateHospitalAdminRequest();

            request.setFullName("Rollback Hospital Admin");
            request.setEmail(adminEmail);
            request.setPhone(adminPhone);
            request.setHospitalId(hospitalId);

            assertThrows(
                    RuntimeException.class,
                    () -> superAdminService.createHospitalAdmin(request)
            );

        } finally {
            SecurityContextHolder.clearContext();
        }

        Boolean userExistsAfterFailure = tx.execute(status ->
                userRepository.existsByEmail(adminEmail)
        );

        assertFalse(
                Boolean.TRUE.equals(userExistsAfterFailure),
                "User must not exist after the transaction rolls back"
        );
    }
}

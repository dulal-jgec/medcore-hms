
package com.medcore.features.superadmin.service.impl;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.notification.entity.EmailOutbox;
import com.medcore.features.notification.enums.EmailType;
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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class SuperAdminConcurrentRequestTest {

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
    private EmailOutboxRepository emailOutboxRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Test
    void shouldPreventDuplicateAdminWhenRequestsRunConcurrently()
            throws Exception {

        TransactionTemplate tx =
                new TransactionTemplate(transactionManager);

        String suffix = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 10);

        String adminEmail =
                "concurrent-admin-" + suffix + "@medcore.local";

        String superAdminEmail =
                "concurrent-super-" + suffix + "@medcore.local";

        String hospitalEmail =
                "concurrent-hospital-" + suffix + "@medcore.local";

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
                            .fullName("Concurrent Test Super Admin")
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
                            .name("Concurrent Hospital " + suffix)
                            .email(hospitalEmail)
                            .phone(hospitalPhone)
                            .licenseNumber("LIC-" + suffix)
                            .status(HospitalStatus.ACTIVE)
                            .build()
            );

            return hospital.getId();
        });

        tx.execute(status ->
                roleRepository.findByName(RoleName.HOSPITAL_ADMIN)
                        .orElseGet(() -> roleRepository.save(
                                Role.builder()
                                        .name(RoleName.HOSPITAL_ADMIN)
                                        .description("Hospital Administrator")
                                        .build()
                        ))
        );

        assertNotNull(hospitalId);

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        try {
            Future<Boolean> first = executor.submit(() ->
                    attemptCreateAdmin(
                            superAdminEmail,
                            adminEmail,
                            "9123456780",
                            hospitalId,
                            ready,
                            start
                    )
            );

            Future<Boolean> second = executor.submit(() ->
                    attemptCreateAdmin(
                            superAdminEmail,
                            adminEmail,
                            "9234567890",
                            hospitalId,
                            ready,
                            start
                    )
            );

            assertTrue(
                    ready.await(10, TimeUnit.SECONDS),
                    "Both requests should be ready"
            );

            start.countDown();

            boolean firstSucceeded = first.get(30, TimeUnit.SECONDS);
            boolean secondSucceeded = second.get(30, TimeUnit.SECONDS);

            assertNotEquals(
                    firstSucceeded,
                    secondSucceeded,
                    "Exactly one request should succeed"
            );

        } finally {
            start.countDown();
            executor.shutdownNow();
        }

        long matchingUsers = userRepository.findAll()
                .stream()
                .filter(user -> adminEmail.equals(user.getEmail()))
                .count();

        long matchingEmails = emailOutboxRepository.findAll()
                .stream()
                .filter(email -> adminEmail.equals(email.getRecipient()))
                .filter(email ->
                        email.getType()
                                == EmailType.HOSPITAL_ADMIN_CREDENTIALS)
                .count();

        assertEquals(1, matchingUsers,
                "Only one admin User should exist");

        assertEquals(1, matchingEmails,
                "Only one invitation EmailOutbox should exist");
    }

    private boolean attemptCreateAdmin(
            String superAdminEmail,
            String adminEmail,
            String phone,
            Long hospitalId,
            CountDownLatch ready,
            CountDownLatch start) {

        try {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                            superAdminEmail, null, List.of()
                    )
            );

            CreateHospitalAdminRequest request =
                    new CreateHospitalAdminRequest();

            request.setFullName("Concurrent Hospital Admin");
            request.setEmail(adminEmail);
            request.setPhone(phone);
            request.setHospitalId(hospitalId);

            ready.countDown();

            if (!start.await(10, TimeUnit.SECONDS)) {
                throw new IllegalStateException(
                        "Timed out waiting to start request"
                );
            }

            superAdminService.createHospitalAdmin(request);
            return true;

        } catch (Exception exception) {
            return false;

        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}

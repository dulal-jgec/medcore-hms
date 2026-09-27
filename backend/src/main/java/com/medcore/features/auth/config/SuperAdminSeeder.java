package com.medcore.features.auth.config;

import com.medcore.config.SuperAdminProperties;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.superadmin.entity.SuperAdmin;
import com.medcore.features.superadmin.enums.SuperAdminStatus;
import com.medcore.features.superadmin.repository.SuperAdminRepository;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
@RequiredArgsConstructor
public class SuperAdminSeeder implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(SuperAdminSeeder.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final SuperAdminRepository superAdminRepository;
    private final SuperAdminProperties superAdminProperties;

    @Override
    public void run(String... args) {

        Role superAdminRole =
                roleRepository.findByName(RoleName.SUPER_ADMIN)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "SUPER_ADMIN role not found"
                                )
                        );

        Hospital headOffice =
                hospitalRepository
                        .findByEmailAndDeletedAtIsNull("hq@medcore.com")
                        .orElseGet(() -> {

                            Hospital hospital = Hospital.builder()
                                    .name("MedCore Head Office")
                                    .email("hq@medcore.com")
                                    .phone("9999999998")
                                    .licenseNumber("MEDCORE-HQ-001")
                                    .city("Kolkata")
                                    .logoUrl(null)
                                    .status(HospitalStatus.ACTIVE)
                                    .build();

                            return hospitalRepository.save(hospital);
                        });

        /*
         * Validate the runtime configuration before creating the User.
         *
         * This is useful because environment variables can come from
         * different sources such as IDE configuration or OS environment.
         */
        String phone = superAdminProperties.getPhone();

        if (phone == null || !phone.matches("^[6-9]\\d{9}$")) {
            throw new IllegalStateException(
                    "Invalid SUPER_ADMIN_PHONE configuration. " +
                    "Expected a 10-digit Indian mobile number."
            );
        }

        log.info(
                "Super Admin configuration loaded successfully. Phone length={}",
                phone.length()
        );

        User superAdmin =
                userRepository.findByEmail(superAdminProperties.getEmail())
                        .orElseGet(() -> {

                            User user = User.builder()
                                    .fullName("Super Admin")
                                    .email(superAdminProperties.getEmail())
                                    .password(
                                            passwordEncoder.encode(
                                                    superAdminProperties.getPassword()
                                            )
                                    )
                                    .phone(phone)
                                    .hospital(headOffice)
                                    .role(superAdminRole)
                                    .status(UserStatus.ACTIVE)
                                    .emailVerified(true)
                                    .phoneVerified(true)
                                    .build();

                            return userRepository.save(user);
                        });

        if (!superAdminRepository
                .existsByUserIdAndDeletedAtIsNull(superAdmin.getId())) {

            SuperAdmin superAdminProfile =
                    SuperAdmin.builder()
                            .user(superAdmin)
                            .status(SuperAdminStatus.ACTIVE)
                            .build();

            superAdminRepository.save(superAdminProfile);
        }

        log.info("Super Admin seeding completed");
    }
}
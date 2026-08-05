package com.medcore.features.auth.config;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

@Component
@Order(2)
@RequiredArgsConstructor
public class SuperAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (userRepository.existsByEmail("admin@medcore.com")) {
            return;
        }

        Role superAdminRole = roleRepository.findByName(RoleName.SUPER_ADMIN)
                .orElseThrow(() ->
                        new RuntimeException("SUPER_ADMIN role not found"));

        Hospital headOffice =
        		hospitalRepository.findByEmail("hq@medcore.com")
                .orElseGet(() -> {

                    Hospital hospital = Hospital.builder()
                            .name("MedCore Head Office")
                            .email("hq@medcore.com")
                            .phone("9999999998")
                            .licenseNumber("MEDCORE-HQ-001")
                            .city("Kolkata")
                            .logoUrl(null)
                            .active(true)
                            .build();

                    return hospitalRepository.save(hospital);
                });

        User superAdmin = User.builder()
                .fullName("Super Admin")
                .email("admin@medcore.com")
                .password(passwordEncoder.encode("Admin@123"))
                .phone("9999999999")
                .hospital(headOffice)
                .role(superAdminRole)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .phoneVerified(true)
                .build();

        userRepository.save(superAdmin);

        System.out.println(" Super Admin Created Successfully");
    }
}
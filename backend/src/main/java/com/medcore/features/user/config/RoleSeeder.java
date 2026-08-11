package com.medcore.features.user.config;

import com.medcore.features.user.entity.Role;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {

        createRole(RoleName.SUPER_ADMIN, "Platform Owner");
        createRole(RoleName.HOSPITAL_ADMIN, "Hospital Administrator");
        createRole(RoleName.DOCTOR, "Doctor");
        createRole(RoleName.NURSE, "Nurse");
        createRole(RoleName.RECEPTIONIST, "Receptionist");
        createRole(RoleName.LAB_TECHNICIAN, "Lab Technician");
        createRole(RoleName.PHARMACIST, "Pharmacist");
        createRole(RoleName.ACCOUNTANT, "Accountant");
        createRole(RoleName.PATIENT, "Patient");
    }

    private void createRole(
            RoleName roleName,
            String description
    ) {

        if (roleRepository.findByName(roleName).isEmpty()) {

            Role role = Role.builder()
                    .name(roleName)
                    .description(description)
                    .build();

            roleRepository.save(role);
        }
    }
}
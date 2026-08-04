package com.medcore.features.hospital.config;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HospitalSeeder implements CommandLineRunner {

    private final HospitalRepository hospitalRepository;

    @Override
    public void run(String... args) {

        if (hospitalRepository.count() == 0) {

            Hospital hospital = Hospital.builder()
                    .name("Apollo Hospital")
                    .email("apollo@medcore.com")
                    .phone("9876543210")
                    .licenseNumber("APH-2026-001")
                    .city("Kolkata")
                    .logoUrl(null)
                    .active(true)
                    .build();

            hospitalRepository.save(hospital);
        }
    }
}
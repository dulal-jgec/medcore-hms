package com.medcore.features.hospital.repository;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByLicenseNumber(String licenseNumber);
    	
    Page<Hospital> findByNameContainingIgnoreCaseOrCityContainingIgnoreCase(
            String name,
            String city,
            Pageable pageable
    );
    
    Optional<Hospital> findByIdAndDeletedAtIsNull(Long id);

    Page<Hospital> findByDeletedAtIsNull(Pageable pageable);

    Page<Hospital> findByNameContainingIgnoreCaseAndDeletedAtIsNull(
            String keyword,
            Pageable pageable
    );
    
    Optional<Hospital> findById(Long id);
    
    long countByDeletedAtIsNull();

    long countByDeletedAtIsNotNull();

    long countByStatusAndDeletedAtIsNull(
            HospitalStatus status
    );
}
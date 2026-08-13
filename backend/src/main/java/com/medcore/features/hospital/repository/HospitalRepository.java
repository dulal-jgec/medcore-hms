package com.medcore.features.hospital.repository;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface HospitalRepository
        extends JpaRepository<Hospital, Long> {
	
	Optional<Hospital> findByEmailAndDeletedAtIsNull(String email);
	
    boolean existsByEmailAndDeletedAtIsNull(String email);

    boolean existsByLicenseNumberAndDeletedAtIsNull(
            String licenseNumber
    );

    boolean existsByPhoneAndDeletedAtIsNull(
            String phone
    );

    Optional<Hospital> findByIdAndDeletedAtIsNull(Long id);

    Page<Hospital> findByDeletedAtIsNull(Pageable pageable);

    @Query("""
        SELECT h
        FROM Hospital h
        WHERE h.deletedAt IS NULL
          AND (
              LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        """)
    Page<Hospital> searchHospitals(
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByDeletedAtIsNull();

    long countByDeletedAtIsNotNull();

    long countByStatusAndDeletedAtIsNull(
            HospitalStatus status
    );
}
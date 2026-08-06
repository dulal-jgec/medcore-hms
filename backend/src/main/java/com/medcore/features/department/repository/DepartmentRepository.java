package com.medcore.features.department.repository;

import com.medcore.features.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByHospitalIdAndNameIgnoreCase(Long hospitalId, String name);

    boolean existsByHospitalIdAndCodeIgnoreCase(Long hospitalId, String code);

    Page<Department> findByDeletedAtIsNull(Pageable pageable);
    
    Page<Department> findByNameContainingIgnoreCaseAndDeletedAtIsNull(
            String keyword,
            Pageable pageable
    );

}
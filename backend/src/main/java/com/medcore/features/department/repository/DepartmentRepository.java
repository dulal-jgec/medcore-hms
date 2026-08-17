package com.medcore.features.department.repository;

import com.medcore.features.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    Optional<Department> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long departmentId,
            Long hospitalId
    );

    Optional<Department> findByIdAndHospitalId(
            Long departmentId,
            Long hospitalId
    );

    Page<Department> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    Page<Department>
    findByHospitalIdAndNameContainingIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String keyword,
            Pageable pageable
    );

    boolean existsByHospitalIdAndNameIgnoreCase(
            Long hospitalId,
            String name
    );

    boolean existsByHospitalIdAndCodeIgnoreCase(
            Long hospitalId,
            String code
    );
}
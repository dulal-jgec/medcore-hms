package com.medcore.features.department.repository;

import com.medcore.features.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    @EntityGraph(attributePaths = "hospital")
    Optional<Department> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long departmentId,
            Long hospitalId
    );

    @EntityGraph(attributePaths = "hospital")
    Optional<Department> findByIdAndHospitalId(
            Long departmentId,
            Long hospitalId
    );

    @EntityGraph(attributePaths = "hospital")
    Page<Department> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "hospital")
    Page<Department>
    findByHospitalIdAndNameContainingIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String keyword,
            Pageable pageable
    );

    boolean existsByHospitalIdAndNameIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String name
    );

    boolean existsByHospitalIdAndCodeIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String code
    );
    
    Optional<Department> findByHospitalIdAndNameIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String name
    );

    Optional<Department> findByHospitalIdAndCodeIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String code
    );
}
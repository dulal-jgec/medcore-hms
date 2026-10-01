package com.medcore.features.user.repository;

import com.medcore.features.user.entity.User;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepository extends JpaRepository<User, Long> {
	

    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"role", "hospital"})
    Optional<User> findWithRoleAndHospitalByEmailAndDeletedAtIsNull(
            String email
    );

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
    
    Optional<User> findByIdAndHospitalId(
            Long userId,
            Long hospitalId
    );

    Optional<User> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long userId,
            Long hospitalId
    );
    
    Optional<User> findByEmailAndStatus(
            String email,
            UserStatus status
    );
    
    @EntityGraph(attributePaths = {"hospital", "role"})
    Page<User> findByRoleNameAndDeletedAtIsNull(
            RoleName roleName,
            Pageable pageable
    );
    
    @Query("""
    	    SELECT u
    	    FROM User u
    	    JOIN FETCH u.role
    	    WHERE u.email = :email
    	""")
    	Optional<User> findByEmailWithRole(@Param("email") String email);
    
    @Query("""
            SELECT COUNT(u) > 0
            FROM User u
            WHERE u.email = :email
              AND u.status <> com.medcore.features.user.enums.UserStatus.INVITATION_EXPIRED
            """)
    boolean existsActiveEmail(@Param("email") String email);
    
    @Query("""
            SELECT COUNT(u) > 0
            FROM User u
            WHERE u.phone = :phone
              AND u.status <> com.medcore.features.user.enums.UserStatus.INVITATION_EXPIRED
            """)
    boolean existsActivePhone(@Param("phone") String phone);
}
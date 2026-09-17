package com.medcore.features.user.repository;

import com.medcore.features.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface UserRepository extends JpaRepository<User, Long> {
	

    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"role", "hospital"})
    Optional<User> findWithRoleAndHospitalByEmail(String email);

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
    
    @Query("""
    	    SELECT u
    	    FROM User u
    	    JOIN FETCH u.role
    	    WHERE u.email = :email
    	""")
    	Optional<User> findByEmailWithRole(@Param("email") String email);
}
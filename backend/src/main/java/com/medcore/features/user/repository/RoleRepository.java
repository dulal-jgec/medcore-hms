package com.medcore.features.user.repository;

import com.medcore.features.user.entity.Role;
import com.medcore.features.user.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

	Optional<Role> findByName(RoleName name);}
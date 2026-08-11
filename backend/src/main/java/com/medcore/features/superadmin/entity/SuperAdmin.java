package com.medcore.features.superadmin.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.superadmin.enums.SuperAdminStatus;
import com.medcore.features.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "super_admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuperAdmin extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private SuperAdminStatus status =
            SuperAdminStatus.ACTIVE;
}
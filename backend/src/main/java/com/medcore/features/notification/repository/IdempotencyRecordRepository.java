package com.medcore.features.notification.repository;

import com.medcore.features.notification.entity.IdempotencyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface IdempotencyRecordRepository
        extends JpaRepository<IdempotencyRecord, Long> {

    Optional<IdempotencyRecord> findByIdempotencyKey(
            String idempotencyKey
    );
    
    @Modifying
    @Query(
            value = """
                    INSERT INTO idempotency_records
                    (created_at, updated_at, idempotency_key, operation)
                    VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :idempotencyKey, :operation)
                    ON CONFLICT (idempotency_key) DO NOTHING
                    """,
            nativeQuery = true
    )
    int createIfNotExists(
            @Param("idempotencyKey") String idempotencyKey,
            @Param("operation") String operation
    );
}
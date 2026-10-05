package com.medcore.features.notification.service;

import com.medcore.features.notification.entity.IdempotencyRecord;
import com.medcore.features.notification.repository.IdempotencyRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyRecordRepository repository;

    public boolean exists(String idempotencyKey) {
        return repository
                .findByIdempotencyKey(idempotencyKey)
                .isPresent();
    }

    @Transactional
public boolean create(
        String idempotencyKey,
        String operation
) {
    try {

        IdempotencyRecord record =
                IdempotencyRecord.builder()
                        .idempotencyKey(idempotencyKey)
                        .operation(operation)
                        .build();

        repository.saveAndFlush(record);

        return true;

    } catch (DataIntegrityViolationException ex) {

        return false;
    }
}
}
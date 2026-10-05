package com.medcore.features.notification.service;

import com.medcore.features.notification.repository.IdempotencyRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyRecordRepository repository;

    @Transactional
    public boolean create(
            String idempotencyKey,
            String operation
    ) {

        return repository.createIfNotExists(
                idempotencyKey,
                operation
        ) == 1;
    }
}
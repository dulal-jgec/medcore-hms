package com.medcore.common.storage;

import com.medcore.common.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Service
public class FileValidationService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Image file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(
                    "Image size must not exceed 5 MB"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException(
                    "Only JPG, PNG and WebP images are allowed"
            );
        }
    }
}
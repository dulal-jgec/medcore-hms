package com.medcore.common.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryFileStorageService implements FileStorageService {

    private final Cloudinary cloudinary;

    @Override
    public String upload(MultipartFile file, String folder) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        try {

            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image"
                    )
            );

            return result.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to upload file",
                    e
            );
        }
    }

    @Override
    public void delete(String publicId) {

        try {

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap()
            );

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete file",
                    e
            );
        }
    }
}
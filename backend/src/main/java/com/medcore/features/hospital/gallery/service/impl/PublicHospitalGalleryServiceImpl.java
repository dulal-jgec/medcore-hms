
package com.medcore.features.hospital.gallery.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.gallery.dto.GalleryImageResponse;
import com.medcore.features.hospital.gallery.entity.GalleryCategory;
import com.medcore.features.hospital.gallery.entity.GalleryStatus;
import com.medcore.features.hospital.gallery.entity.HospitalGallery;
import com.medcore.features.hospital.gallery.mapper.HospitalGalleryMapper;
import com.medcore.features.hospital.gallery.repository.PublicHospitalGalleryRepository;
import com.medcore.features.hospital.gallery.service.PublicHospitalGalleryService;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicHospitalGalleryServiceImpl
        implements PublicHospitalGalleryService {

    private final PublicHospitalGalleryRepository galleryRepository;
    private final HospitalRepository hospitalRepository;
    private final HospitalGalleryMapper galleryMapper;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("id", "title", "displayOrder", "createdAt");

    @Override
    @Cacheable(
    	    cacheNames = "publicHospitalGallery",
    	    key = "#p0 + ':page=' + #p1 + ':size=' + #p2 + ':sort=' + #p3 + ':dir=' + #p4.trim().toLowerCase()",
    	    unless = "#result == null || #result.data == null"
    	)
    public ApiResponse<Page<GalleryImageResponse>> getGallery(
            Long hospitalId,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        validatePagination(page, size, sortBy, sortDir);
        validateHospital(hospitalId);

        Pageable pageable = createPageable(
                page, size, sortBy, sortDir
        );

        Page<GalleryImageResponse> responsePage =
                galleryRepository
                        .findByHospitalIdAndStatusAndDeletedAtIsNull(
                                hospitalId,
                                GalleryStatus.ACTIVE,
                                pageable
                        )
                        .map(galleryMapper::toResponse);

        return ApiResponse.<Page<GalleryImageResponse>>builder()
                .success(true)
                .message("Hospital gallery fetched successfully")
                .data(responsePage)
                .build();
    }

    @Override
    @Cacheable(
    	    cacheNames = "publicHospitalGalleryByCategory",
    	    key = "#p0 + ':category=' + #p1 + ':page=' + #p2 + ':size=' + #p3 + ':sort=' + #p4 + ':dir=' + #p5.trim().toLowerCase()",
    	    unless = "#result == null || #result.data == null"
    	)
    public ApiResponse<Page<GalleryImageResponse>> getGalleryByCategory(
            Long hospitalId,
            GalleryCategory category,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        validatePagination(page, size, sortBy, sortDir);

        if (category == null) {
            throw new BusinessException(
                    "Gallery category is required"
            );
        }

        validateHospital(hospitalId);

        Pageable pageable = createPageable(
                page, size, sortBy, sortDir
        );

        Page<GalleryImageResponse> responsePage =
                galleryRepository
                        .findByHospitalIdAndCategoryAndStatusAndDeletedAtIsNull(
                                hospitalId,
                                category,
                                GalleryStatus.ACTIVE,
                                pageable
                        )
                        .map(galleryMapper::toResponse);

        return ApiResponse.<Page<GalleryImageResponse>>builder()
                .success(true)
                .message("Hospital gallery fetched successfully")
                .data(responsePage)
                .build();
    }

    @Override
    @Cacheable(
    	    cacheNames = "publicHospitalGalleryImage",
    	    key = "#p0 + ':galleryId=' + #p1",
    	    unless = "#result == null || #result.data == null"
    	)
    public ApiResponse<GalleryImageResponse> getGalleryImage(
            Long hospitalId,
            Long galleryId) {

        validateHospital(hospitalId);

        HospitalGallery gallery =
                galleryRepository
                        .findByIdAndHospitalIdAndStatusAndDeletedAtIsNull(
                                galleryId,
                                hospitalId,
                                GalleryStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Gallery image not found"
                                )
                        );

        return ApiResponse.<GalleryImageResponse>builder()
                .success(true)
                .message("Gallery image fetched successfully")
                .data(galleryMapper.toResponse(gallery))
                .build();
    }

    private void validateHospital(Long hospitalId) {
        if (hospitalId == null) {
            throw new BusinessException(
                    "Hospital ID is required"
            );
        }

        hospitalRepository
                .findByIdAndStatusAndDeletedAtIsNull(
                        hospitalId,
                        HospitalStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hospital not found"
                        )
                );
    }

    private Pageable createPageable(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort.Direction direction =
                sortDir.trim().equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        return PageRequest.of(
                page,
                size,
                Sort.by(direction, sortBy)
        );
    }

    private void validatePagination(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        if (page < 0) {
            throw new BusinessException(
                    "Page must be greater than or equal to 0"
            );
        }

        if (size < 1 || size > 100) {
            throw new BusinessException(
                    "Page size must be between 1 and 100"
            );
        }

        if (sortBy == null
                || !ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BusinessException(
                    "Invalid sort field: " + sortBy
            );
        }

        if (sortDir == null
                || (!sortDir.trim().equalsIgnoreCase("asc")
                && !sortDir.trim().equalsIgnoreCase("desc"))) {
            throw new BusinessException(
                    "Sort direction must be 'asc' or 'desc'"
            );
        }
    }
}

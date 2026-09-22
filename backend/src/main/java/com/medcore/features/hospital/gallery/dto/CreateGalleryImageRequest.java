package com.medcore.features.hospital.gallery.dto;

import com.medcore.features.hospital.gallery.entity.GalleryCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateGalleryImageRequest {

    @NotBlank
    @Size(min = 2, max = 150)
    private String title;

    @NotNull
    private GalleryCategory category;

    @Size(max = 1000)
    private String description;

    private Integer displayOrder;
}
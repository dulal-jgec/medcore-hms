const API_BASE_URL = "http://localhost:8080/api/v1";

/**
 * Get hospital gallery
 */
export async function getHospitalGallery(
  accessToken,
  page = 0,
  size = 20
) {
  const response = await fetch(
    `${API_BASE_URL}/hospital/gallery?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch hospital gallery");
  }

  return response.json();
}

/**
 * Get single gallery image
 */
export async function getGalleryImage(
  galleryId,
  accessToken
) {
  const response = await fetch(
    `${API_BASE_URL}/hospital/gallery/${galleryId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch gallery image");
  }

  return response.json();
}

 
export async function createGalleryImage(
  {
    file,
    title,
    category,
    description,
    displayOrder,
  },
  accessToken
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("title", title);
  formData.append("category", category);

  if (description) {
    formData.append("description", description);
  }

  formData.append(
    "displayOrder",
    String(displayOrder ?? 0)
  );

  const response = await fetch(
    `${API_BASE_URL}/hospital/gallery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload gallery image");
  }

  return response.json();
}

/**
 * Update gallery metadata
 */
export async function updateGalleryImage(
  galleryId,
  {
    title,
    category,
    description,
    displayOrder,
  },
  accessToken
) {
  const response = await fetch(
    `${API_BASE_URL}/hospital/gallery/${galleryId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        category,
        description,
        displayOrder: Number(displayOrder ?? 0),
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update gallery image");
  }

  return response.json();
}

/**
 * Replace gallery image
 */
export async function replaceGalleryImage(
  galleryId,
  file,
  accessToken
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/hospital/gallery/${galleryId}/image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to replace gallery image");
  }

  return response.json();
}

 
export async function deleteGalleryImage(
  galleryId,
  accessToken
) {
  const response = await fetch(
    `${API_BASE_URL}/hospital/gallery/${galleryId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete gallery image");
  }

  return response.json();
}
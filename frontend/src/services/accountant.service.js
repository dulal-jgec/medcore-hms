const API_BASE_URL = "http://localhost:8080/api/v1";

const request = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

// ======================================================
// ADMIN
// ======================================================

export const getAccountants = async (accessToken) => {
  return request("/accountants", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getAccountantById = async (
  accessToken,
  accountantId
) => {
  return request(`/accountants/${accountantId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createAccountant = async (
  accessToken,
  data
) => {
  return request("/accountants", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
};

export const updateAccountant = async (
  accessToken,
  accountantId,
  data
) => {
  return request(`/accountants/${accountantId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
};

export const deleteAccountant = async (
  accessToken,
  accountantId
) => {
  return request(`/accountants/${accountantId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const activateAccountant = async (
  accessToken,
  accountantId
) => {
  return request(`/accountants/${accountantId}/activate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const deactivateAccountant = async (
  accessToken,
  accountantId
) => {
  return request(`/accountants/${accountantId}/deactivate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// ======================================================
// ACCOUNTANT DASHBOARD
// ======================================================

export const getAccountantDashboard = async (
  accessToken
) => {
  return request("/accountants/dashboard", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// ======================================================
// ACCOUNTANT BILLING
// ======================================================

export const getHospitalBills = async (
  accessToken,
  page = 0,
  size = 10,
  sortBy = "billDate",
  sortDir = "desc"
) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  return request(
    `/accountants/bills?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

// ======================================================
// ACCOUNTANT PROFILE
// ======================================================

export const getMyAccountantProfile = async (
  accessToken
) => {
  return request("/accountants/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updateMyAccountantProfile = async (
  accessToken,
  data
) => {
  return request("/accountants/me", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
};

export const uploadAccountantProfileImage = async (
  accessToken,
  file
) => {
  const formData = new FormData();

  formData.append("file", file);

  return request("/accountants/me/profile-image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
};
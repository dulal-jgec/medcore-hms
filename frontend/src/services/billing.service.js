const API_BASE_URL = "http://localhost:8080/api/v1";

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getHospitalBills(
  accessToken,
  page = 0,
  size = 20,
  sortBy = "billDate",
  sortDir = "desc"
) {
  return request(
    `/billing?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export async function getOutstandingBills(
  accessToken,
  page = 0,
  size = 20,
  sortBy = "billDate",
  sortDir = "desc"
) {
  return request(
    `/billing/outstanding?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export async function getBillById(accessToken, billId) {
  return request(`/billing/${billId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createBill(accessToken, data) {
  return request("/billing", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export async function addBillItem(accessToken, billId, data) {
  return request(`/billing/${billId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateBillItem(
  accessToken,
  billId,
  itemId,
  data
) {
  return request(`/billing/${billId}/items/${itemId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export async function deleteBillItem(
  accessToken,
  billId,
  itemId
) {
  return request(`/billing/${billId}/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function payBill(
  accessToken,
  billId,
  data
) {
  return request(`/billing/${billId}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}
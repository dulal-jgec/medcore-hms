import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getHospitalBills({
  page = 0,
  size = 20,
  sortBy = "billDate",
  sortDir = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });
  const response = await apiFetch(`/billing?${params.toString()}`);
  return handleResponse(response);
}

export async function getOutstandingBills({
  page = 0,
  size = 20,
  sortBy = "billDate",
  sortDir = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });
  const response = await apiFetch(
    `/billing/outstanding?${params.toString()}`
  );
  return handleResponse(response);
}

export async function getBillById(billId) {
  const response = await apiFetch(`/billing/${billId}`);
  return handleResponse(response);
}

export async function createBill(data) {
  const response = await apiFetch("/billing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function addBillItem(billId, data) {
  const response = await apiFetch(`/billing/${billId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateBillItem(billId, itemId, data) {
  const response = await apiFetch(`/billing/${billId}/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteBillItem(billId, itemId) {
  const response = await apiFetch(`/billing/${billId}/items/${itemId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function payBill(billId, data) {
  const response = await apiFetch(`/billing/${billId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}
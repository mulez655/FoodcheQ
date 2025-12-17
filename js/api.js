// js/api.js
const API_BASE = "http://localhost:4000";

export function getToken() {
  return localStorage.getItem("foodcheq_token");
}

export function setToken(token) {
  localStorage.setItem("foodcheq_token", token);
}

export function clearToken() {
  localStorage.removeItem("foodcheq_token");
}

export async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.error || "Request failed";
    throw new Error(msg);
  }
  return data;
}

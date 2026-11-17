/**
 * Small fetch wrapper for the AucWin CRM backend.
 * The login token is kept in localStorage and sent as `Authorization: Bearer …`.
 */
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "") || window.location.origin;

if (!import.meta.env.VITE_API_URL) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_URL is not set — using this site's own address for the API. Copy .env.example to .env to change it.");
}

const TOKEN_KEY = "harbour.token";
const listeners = new Set();

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn(token));
}
/** Called with the new token (or null) whenever the user signs in or out. */
export function onTokenChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export class ApiError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

/** request("GET", "/api/leads", { query, body }) -> parsed JSON (throws ApiError). */
export async function request(method, path, { query, body, form } = {}) {
  let url = API_URL + path;
  if (query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    const s = qs.toString();
    if (s) url += (url.includes("?") ? "&" : "?") + s;
  }
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !form) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(url, { method, headers, body: form ? form : body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("Cannot reach the server. Check your internet connection.", 0, "network");
  }
  let data = null;
  const text = await res.text();
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }
  if (!res.ok) {
    const msg = (data && data.error) || `Request failed (${res.status})`;
    // Session expired or account deactivated: sign out everywhere.
    if (res.status === 401 && token && path !== "/api/auth/login") setToken(null);
    throw new ApiError(msg, res.status, data && data.code);
  }
  return data;
}

export const http = {
  get: (path, query) => request("GET", path, { query }),
  post: (path, body) => request("POST", path, { body: body ?? {} }),
  patch: (path, body) => request("PATCH", path, { body: body ?? {} }),
  del: (path, body) => request("DELETE", path, body !== undefined ? { body } : {}),
  upload: (path, form, query) => request("POST", path, { form, query }),
};

/** Human-readable message from any error. */
export function errMsg(e) {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (e.status === 403 && !e.message) return "You do not have permission to do that.";
  return e.message || "Something went wrong";
}

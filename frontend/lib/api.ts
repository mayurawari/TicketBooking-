import { AuthResponse, User } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accesstoken");
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("accesstoken", token);
  } else {
    localStorage.removeItem("accesstoken");
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // send cookies
  };

  let response = await fetch(url, config);

  // If unauthorized and we have a token or cookies, try refreshing token once
  if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            if (data.token) {
              setStoredToken(data.token);
              return data.token;
            }
          }
          setStoredToken(null);
          return null;
        } catch {
          setStoredToken(null);
          return null;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, { ...config, headers });
    }
  }

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

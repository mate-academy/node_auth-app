export const BASE_URL = "http://localhost:3000";

export class SessionExpiredError extends Error {}

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();

        localStorage.setItem("accessToken", data.accessToken);

        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

function send(path: string, options: RequestInit) {
  const token = localStorage.getItem("accessToken");

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string>),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await send(path, options);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    localStorage.removeItem("accessToken");
    throw new SessionExpiredError();
  }

  return send(path, options);
}

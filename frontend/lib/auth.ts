export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("castingai_token");
}

export function setToken(token: string): void {
  localStorage.setItem("castingai_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("castingai_token");
  localStorage.removeItem("inspectionHistory");
  localStorage.removeItem("inspectionResult");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function formatLocalDate(dateInput?: string | Date | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export function isValidGmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@(gmail|googlemail)\.com$/.test(trimmed);
}


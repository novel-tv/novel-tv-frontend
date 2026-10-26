export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const TOKEN_STORAGE_KEY = "novel-tv-token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // localStorage can be unavailable (private browsing, disabled storage) — fail silently.
  }
}

export function clearStoredToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;
  // The raw JSON body, when there was one — lets callers read extra
  // response-specific flags (e.g. recaptcha_requires_v2) without every
  // such flag needing its own constructor parameter here.
  body: Record<string, unknown> | null;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> | null = null,
    body: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}/${path.replace(/^\//, "")}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? "Something went wrong. Please try again.",
      response.status,
      body?.errors ?? null,
      body ?? null,
    );
  }

  return body as T;
}

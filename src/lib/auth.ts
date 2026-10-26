import { API_URL, apiFetch, clearStoredToken, setStoredToken } from "./api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
};

type AuthResponse = {
  user: AuthUser;
  token: string;
  token_type: string;
};

type RecaptchaFields = Partial<{ recaptcha_token: string; recaptcha_version: "v2" | "v3" }>;

export async function registerUser(
  input: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  } & RecaptchaFields,
): Promise<AuthUser> {
  // Deliberately doesn't store the returned token — registering sends the
  // user to the login page to sign in explicitly, rather than auto-logging them in.
  const response = await apiFetch<AuthResponse>("auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.user;
}

export async function loginUser(
  input: { email: string; password: string } & RecaptchaFields,
): Promise<AuthUser> {
  const response = await apiFetch<AuthResponse>("auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  setStoredToken(response.token);

  return response.user;
}

export function getSocialLoginUrl(provider: "google" | "facebook"): string {
  return `${API_URL}/auth/${provider}/redirect`;
}

export async function exchangeSocialLoginCode(code: string): Promise<AuthUser> {
  const response = await apiFetch<AuthResponse>("auth/social/exchange", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  setStoredToken(response.token);

  return response.user;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiFetch("auth/logout", { method: "POST" });
  } finally {
    clearStoredToken();
  }
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiFetch<{ data: AuthUser }>("auth/me");

  return response.data;
}

export async function resendVerificationEmail(): Promise<void> {
  await apiFetch("auth/email/verification-notification", { method: "POST" });
}

export async function changePassword(input: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await apiFetch("auth/change-password", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch("auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await apiFetch("auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

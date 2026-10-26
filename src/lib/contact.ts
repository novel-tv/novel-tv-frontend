import { apiFetch } from "./api";

type RecaptchaFields = Partial<{ recaptcha_token: string; recaptcha_version: "v2" | "v3" }>;

export async function submitContactForm(
  input: {
    name: string;
    email: string;
    subject: string;
    message: string;
  } & RecaptchaFields,
): Promise<void> {
  await apiFetch<{ message: string }>("contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

import { apiFetch } from "./api";

export async function submitContactForm(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  await apiFetch<{ message: string }>("contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

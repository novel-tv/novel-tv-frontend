import { apiFetch } from "./api";

export type IntegrationSettings = {
  google_analytics_id: string | null;
  google_search_console_verification: string | null;
  recaptcha_is_enabled: boolean;
  recaptcha_v2_site_key: string | null;
  recaptcha_v3_site_key: string | null;
};

export const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  google_analytics_id: null,
  google_search_console_verification: null,
  recaptcha_is_enabled: false,
  recaptcha_v2_site_key: null,
  recaptcha_v3_site_key: null,
};

export async function fetchIntegrationSettings(): Promise<IntegrationSettings> {
  try {
    // Same revalidation window as fetchSiteSettings() — static-ish, but
    // picks up an admin save within about a minute.
    const response = await apiFetch<{ data: IntegrationSettings }>("integration-settings", {
      next: { revalidate: 60 },
    } as RequestInit);
    return response.data;
  } catch {
    // A failed fetch should never break page rendering — fall back to
    // "nothing configured", which just means no GA/recaptcha loads.
    return DEFAULT_INTEGRATION_SETTINGS;
  }
}

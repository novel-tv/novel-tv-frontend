import { apiFetch } from "./api";

export type SiteSettings = {
  logo_url: string | null;
  favicon_url: string | null;
  tagline: string | null;
  footer_text: string | null;
  discourage_search_engines: boolean;
  credit_designer_label: string | null;
  credit_designer_url: string | null;
  credit_developer_label: string | null;
  credit_developer_url: string | null;
  credit_is_visible: boolean;
  maintenance_banner_text: string | null;
  maintenance_banner_is_visible: boolean;
};

// Shown whenever the admin hasn't set a field yet (or the request fails) —
// the same copy that used to be hardcoded directly into Header/Footer, now
// just the fallback instead of the only option.
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logo_url: null,
  favicon_url: null,
  tagline:
    "Stream unlimited movies, TV shows, and live channels — anytime, anywhere, no limits.",
  footer_text: "© {year} Novel TV. All Rights Reserved.",
  discourage_search_engines: false,
  credit_designer_label: "TASKHUB",
  credit_designer_url: "https://taskhubrecruitmentsolutions.com/",
  credit_developer_label: "AlgoMatryx",
  credit_developer_url: "https://algomatryx.com/",
  credit_is_visible: true,
  maintenance_banner_text:
    "This site is still under maintenance and will be available to use soon.",
  maintenance_banner_is_visible: false,
};

export function resolveFooterText(footerText: string | null): string {
  const template = footerText ?? DEFAULT_SITE_SETTINGS.footer_text!;
  return template.replace("{year}", String(new Date().getFullYear()));
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    // This is read in the root layout/metadata/robots.ts, shared by every
    // route — `cache: "no-store"` here would force the ENTIRE site into
    // per-request dynamic rendering just for branding data, losing static
    // generation everywhere. A short revalidate window keeps pages mostly
    // static while still picking up admin saves within about a minute,
    // instead of only at the next deploy.
    const response = await apiFetch<{ data: SiteSettings }>("site-settings", {
      next: { revalidate: 60 },
    } as RequestInit);
    return response.data;
  } catch {
    // Public, unauthenticated, read-only branding data — a failure here
    // (backend down, network hiccup) should never break page rendering,
    // so fall back to the same copy that used to be hardcoded.
    return DEFAULT_SITE_SETTINGS;
  }
}

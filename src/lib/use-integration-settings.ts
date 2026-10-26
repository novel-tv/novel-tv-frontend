"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_INTEGRATION_SETTINGS,
  fetchIntegrationSettings,
  type IntegrationSettings,
} from "./integration-settings";

/**
 * Client-side fetch for the three protected forms (Contact Us, Register,
 * Login) — they're all "use client" pages with no server-rendered props
 * pipeline, unlike the root layout (which fetches this server-side for
 * robots.ts/metadata). Starts as the all-disabled default, so a form
 * renders immediately and simply has no reCAPTCHA token to send until
 * this resolves — RecaptchaGate rejects that exactly like a bot with no
 * token would, so there's no window where protection is silently skipped.
 */
export function useIntegrationSettings(): IntegrationSettings {
  const [settings, setSettings] = useState<IntegrationSettings>(DEFAULT_INTEGRATION_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    fetchIntegrationSettings().then((result) => {
      if (!cancelled) setSettings(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}

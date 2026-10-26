"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError } from "./api";
import { IntegrationSettings } from "./integration-settings";
import { getRecaptchaV3Token } from "./recaptcha-client";

export type RecaptchaFields = { recaptcha_token: string; recaptcha_version: "v2" | "v3" };

/**
 * Implements the v3-primary, v2-fallback flow (Google's recommended
 * pattern) for one protected form. Usage in a submit handler:
 *
 *   const recaptchaFields = await getV3Fields();
 *   try {
 *     await submitTheForm({ ...formFields, ...recaptchaFields });
 *   } catch (err) {
 *     if (isRecaptchaV2Required(err)) {
 *       const v2Fields = await waitForV2();
 *       await submitTheForm({ ...formFields, ...v2Fields });
 *       return;
 *     }
 *     throw err;
 *   }
 *
 * and rendering `{needsV2 && settings.recaptcha_v2_site_key && (
 *   <RecaptchaV2Challenge siteKey={...} onVerify={handleV2Verified} />
 * )}` somewhere in the form's JSX.
 */
export function useRecaptcha(settings: IntegrationSettings, action: string) {
  const [needsV2, setNeedsV2] = useState(false);
  const v2ResolveRef = useRef<((fields: RecaptchaFields) => void) | null>(null);

  const getV3Fields = useCallback(async (): Promise<RecaptchaFields | Record<string, never>> => {
    if (!settings.recaptcha_is_enabled || !settings.recaptcha_v3_site_key) {
      return {};
    }

    try {
      const token = await getRecaptchaV3Token(settings.recaptcha_v3_site_key, action);
      return { recaptcha_token: token, recaptcha_version: "v3" };
    } catch {
      // reCAPTCHA itself failed to load/run (ad blocker, offline script
      // host, etc.) — submit without a token rather than blocking the
      // form entirely; the backend's RecaptchaGate will reject it the
      // same way a bot with no token would, surfacing a normal form error.
      return {};
    }
  }, [settings, action]);

  const waitForV2 = useCallback((): Promise<RecaptchaFields> => {
    setNeedsV2(true);
    return new Promise((resolve) => {
      v2ResolveRef.current = resolve;
    });
  }, []);

  const handleV2Verified = useCallback((token: string) => {
    setNeedsV2(false);
    v2ResolveRef.current?.({ recaptcha_token: token, recaptcha_version: "v2" });
  }, []);

  return {
    getV3Fields,
    needsV2,
    waitForV2,
    handleV2Verified,
    v2SiteKey: settings.recaptcha_v2_site_key,
  };
}

export function isRecaptchaV2Required(error: unknown): boolean {
  return error instanceof ApiError && error.body?.recaptcha_requires_v2 === true;
}

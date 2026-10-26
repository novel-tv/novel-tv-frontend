"use client";

import { useEffect, useRef } from "react";
import { renderRecaptchaV2 } from "@/lib/recaptcha-client";

/**
 * The checkbox fallback, shown only when a v3 check comes back with too
 * low a score (RecaptchaGate on the backend signals this via
 * recaptcha_requires_v2 — see useRecaptcha()). Not shown by default; v3
 * runs invisibly on every protected form.
 */
export function RecaptchaV2Challenge({
  siteKey,
  onVerify,
}: {
  siteKey: string;
  onVerify: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    if (hasRendered.current || !containerRef.current) return;
    hasRendered.current = true;

    renderRecaptchaV2(containerRef.current, siteKey, onVerify).catch(() => {
      // The widget just won't appear — the form's own submit error state
      // already tells the visitor something went wrong.
    });
    // onVerify is expected to be referentially stable for the lifetime of
    // this one challenge (see useRecaptcha's useCallback) — re-running
    // this effect would try to render the widget a second time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return (
    <div className="my-2 flex justify-center">
      <div ref={containerRef} />
    </div>
  );
}

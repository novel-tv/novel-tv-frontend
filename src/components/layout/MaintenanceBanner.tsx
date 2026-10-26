"use client";

import { useState } from "react";
import { TriangleAlert, X } from "lucide-react";

// Admin-controlled, dismissible for the current visit only — no
// localStorage/cookie persistence, so it reappears on the next page
// load/app open as long as Site Settings > Maintenance Banner keeps it
// enabled (matches the explicit requirement: closeable, but back on reload).
export function MaintenanceBanner({
  text,
  isVisible,
}: {
  text: string | null;
  isVisible: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!isVisible || dismissed) return null;

  return (
    <div className="relative flex flex-wrap items-center justify-center gap-2 border-b border-warning/30 bg-warning/10 px-10 py-2 text-center font-body text-sm text-warning">
      <TriangleAlert size={16} className="shrink-0" />
      <span>
        {text ?? "This site is still under maintenance and will be available to use soon."}
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-warning/70 transition-colors duration-150 hover:text-warning"
      >
        <X size={16} />
      </button>
    </div>
  );
}

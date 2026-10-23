"use client";

import { X } from "lucide-react";
import { extractYoutubeId } from "@/lib/youtube";

type Props = {
  title: string;
  trailerUrl: string;
  onClose: () => void;
};

/**
 * Plays a movie/series trailer_url — the admin-entered field
 * (backend/app/Filament/Resources/Movies/Schemas/MovieForm.php,
 * .../Series/Schemas/SeriesForm.php) that, until now, was saved and
 * returned by the API but never actually shown anywhere. Every
 * trailer_url seen in the wild so far is a YouTube link, so this embeds
 * YouTube's own iframe player; a non-YouTube URL (Vimeo, a direct video
 * file, etc.) falls back to a plain link instead of guessing at an
 * unsupported embed. Mirrors EmbeddedCheckoutModal's shell/z-index
 * handling.
 */
export function TrailerModal({ title, trailerUrl, onClose }: Props) {
  const videoId = extractYoutubeId(trailerUrl);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 p-4"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-md">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-ui text-sm font-semibold text-text-primary">{title} — Trailer</p>
          <button
            type="button"
            aria-label="Close trailer"
            onClick={onClose}
            className="text-text-muted transition-colors duration-150 hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="aspect-video bg-black">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={`${title} Trailer`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="font-body text-sm text-text-secondary">
                This trailer link can&apos;t be played here.
              </p>
              <a
                href={trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-ui text-sm font-semibold text-primary hover:text-accent"
              >
                Open trailer link
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

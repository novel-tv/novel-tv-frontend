/**
 * Extracts the video ID from a YouTube URL in any common form
 * (watch?v=, youtu.be/, already-embed, with or without extra query
 * params) — returns null if the URL isn't recognizably YouTube, so
 * callers can fall back to something else (e.g. opening the raw URL)
 * instead of showing a broken embed.
 */
export function extractYoutubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id ?? null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments[0] === "embed" && segments[1]) {
      return segments[1];
    }
    return parsed.searchParams.get("v");
  }

  return null;
}

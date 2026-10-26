import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/catalog-types";

const SITE_URL = "https://www.novel-network.com";

// Public, SEO-relevant pages only — excludes anything user-specific or
// requiring auth (dashboard, my-list, checkout/*, reset-password,
// verify-email, notifications), the same scoping a WordPress/Rank Math
// sitemap applies by only listing publicly indexable content.
const STATIC_ROUTES: {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/movies", changeFrequency: "daily", priority: 0.9 },
  { path: "/tv-shows", changeFrequency: "daily", priority: 0.9 },
  { path: "/live-tv", changeFrequency: "daily", priority: 0.8 },
  { path: "/originals", changeFrequency: "weekly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/search", changeFrequency: "monthly", priority: 0.5 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/help-center", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-of-use", changeFrequency: "yearly", priority: 0.3 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  { path: "/register", changeFrequency: "yearly", priority: 0.3 },
];

type SlugEntry = { slug: string; published_at: string | null };

/**
 * Walks every page of a catalog endpoint rather than requesting a single
 * large per_page — the backend caps per_page at 50
 * (MovieController/SeriesController::index()) regardless of what's
 * requested, so a complete sitemap needs to actually page through results,
 * not just ask for a bigger batch.
 */
async function fetchAllSlugs(endpoint: "movies" | "series"): Promise<SlugEntry[]> {
  const results: SlugEntry[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await apiFetch<PaginatedResponse<SlugEntry>>(
      `${endpoint}?per_page=50&page=${page}`,
    );
    results.push(...response.data.map((item) => ({ slug: item.slug, published_at: item.published_at })));
    lastPage = response.meta.last_page;
    page += 1;
  } while (page <= lastPage);

  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // A failure here (backend down) shouldn't break the whole sitemap —
  // search engines just see the static pages until the next crawl/build.
  const [movies, series] = await Promise.all([
    fetchAllSlugs("movies").catch(() => []),
    fetchAllSlugs("series").catch(() => []),
  ]);

  const movieEntries: MetadataRoute.Sitemap = movies.map((movie) => ({
    url: `${SITE_URL}/movies/${movie.slug}`,
    lastModified: movie.published_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const seriesEntries: MetadataRoute.Sitemap = series.map((show) => ({
    url: `${SITE_URL}/series/${show.slug}`,
    lastModified: show.published_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...movieEntries, ...seriesEntries];
}

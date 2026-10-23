"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Play,
  TrendingUp,
  Star,
  Tv,
  Clapperboard,
  Home as HomeIcon,
  Radio,
  Bookmark,
  Loader2,
} from "lucide-react";
import { fetchSeriesList, fetchSeriesBySlug, type Series, type Episode, type Season } from "@/lib/series";
import { fetchGenres, type Genre } from "@/lib/genres";
import { PosterCard } from "@/components/PosterCard";

const ALL_FILTER = "All";
const FEATURED_FILTER = "Featured";

const filterIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  [ALL_FILTER]: TrendingUp,
  [FEATURED_FILTER]: Star,
};

const bottomNavItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Movies", href: "/movies", icon: Clapperboard },
  { label: "TV Shows", href: "/tv-shows", icon: Tv },
  { label: "Live TV", href: "/live-tv", icon: Radio },
  { label: "My List", href: "/my-list", icon: Bookmark },
];

type LatestEpisode = { series: Series; season: Season; episode: Episode };

function seriesSubtitle(series: Series): string {
  const seasonCount = series.seasons?.length;
  return [series.first_air_year, seasonCount ? `${seasonCount} Season${seasonCount === 1 ? "" : "s"}` : null]
    .filter(Boolean)
    .join(" · ");
}

function NewEpisodeRow({ item }: { item: LatestEpisode }) {
  return (
    <Link
      href={`/series/${item.series.slug}/season/${item.season.number}/episode/${item.episode.number}`}
      className="flex items-center gap-3"
    >
      <div className="relative h-16 w-24 flex-none overflow-hidden rounded-md bg-surface sm:w-28">
        <Image
          src={item.episode.still_url ?? "/images/movie-preview.png"}
          alt=""
          fill
          sizes="112px"
          className="object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
            <Play size={14} fill="currentColor" className="text-text-primary" />
          </span>
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-ui text-sm font-semibold text-primary">{item.series.title}</p>
          {item.episode.mux_playback_id && (
            <span className="flex-none rounded bg-primary px-1.5 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-text-primary">
              Preview
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-body text-xs text-text-secondary">
          S{item.season.number} E{item.episode.number} · &ldquo;{item.episode.title}&rdquo;
        </p>
        {item.episode.air_date && (
          <p className="mt-0.5 font-body text-xs text-text-muted">{item.episode.air_date}</p>
        )}
      </div>
    </Link>
  );
}

export default function TvShowsPage() {
  const pathname = usePathname();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const [trendingShows, setTrendingShows] = useState<Series[]>([]);
  const [moreShows, setMoreShows] = useState<Series[]>([]);
  const [latestEpisodes, setLatestEpisodes] = useState<LatestEpisode[]>([]);
  const [filteredShows, setFilteredShows] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [ALL_FILTER, FEATURED_FILTER, ...genres.map((genre) => genre.name)];
  const heroShow = trendingShows[0] ?? moreShows[0] ?? null;

  useEffect(() => {
    let cancelled = false;

    fetchGenres()
      .then((data) => {
        if (!cancelled) setGenres(data);
      })
      .catch(() => {
        if (!cancelled) setGenres([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const list = await fetchSeriesList({ perPage: 10 });
        if (cancelled) return;

        setTrendingShows(list.slice(0, 5));
        setMoreShows(list.slice(5, 10));

        const detailed = await Promise.all(list.slice(0, 6).map((s) => fetchSeriesBySlug(s.slug)));
        if (cancelled) return;

        const latest = detailed
          .map((series): LatestEpisode | null => {
            const all = (series.seasons ?? []).flatMap((season) =>
              (season.episodes ?? []).map((episode) => ({ series, season, episode })),
            );
            return all.sort((a, b) => (b.episode.air_date ?? "").localeCompare(a.episode.air_date ?? ""))[0] ?? null;
          })
          .filter((item): item is LatestEpisode => item !== null)
          .sort((a, b) => (b.episode.air_date ?? "").localeCompare(a.episode.air_date ?? ""))
          .slice(0, 6);

        setLatestEpisodes(latest);
      } catch {
        if (!cancelled) {
          setTrendingShows([]);
          setMoreShows([]);
          setLatestEpisodes([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Mirrors the Movies page: "All" keeps the curated sections above, any
  // real filter (Featured, or a genre) replaces them with a single grid —
  // SeriesController::index() only accepts `featured`/`genre`, so those
  // are the only tabs beyond "All" that can actually filter anything.
  useEffect(() => {
    if (activeFilter === ALL_FILTER) {
      setFilteredShows([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const data =
          activeFilter === FEATURED_FILTER
            ? await fetchSeriesList({ featured: true, perPage: 20 })
            : await fetchSeriesList({
                genre: genres.find((genre) => genre.name === activeFilter)?.slug,
                perPage: 20,
              });
        if (!cancelled) setFilteredShows(data);
      } catch {
        if (!cancelled) setFilteredShows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeFilter, genres]);

  return (
    <>
      <div className="pb-16 lg:pb-0">
        {/* ===================== Hero Section: Start ===================== */}
        <section className="relative isolate min-h-115 overflow-hidden bg-background sm:min-h-125">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/home-hero.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/10" />
          </div>

          <div className="mx-auto max-w-360 px-4 pb-8 pt-10 sm:px-6 lg:px-10 lg:pt-14">
            <div className="max-w-2xl">
              <p className="font-ui text-sm font-semibold uppercase tracking-[0.2em] text-text-secondary">
                Stream <span className="text-accent">Different.</span>
              </p>

              <h1
                className="mt-2 font-heading text-6xl uppercase text-text-primary sm:text-7xl lg:text-hero"
                style={{ lineHeight: "var(--leading-tight)" }}
              >
                TV Shows.
              </h1>

              <p className="mt-5 max-w-md font-body text-base text-text-secondary sm:text-lg">
                Binge-worthy series. Iconic classics. New episodes. Nonstop
                entertainment.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                {heroShow ? (
                  <Link
                    href={`/series/${heroShow.slug}`}
                    className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
                  >
                    <Play size={18} fill="currentColor" />
                    Watch Now
                  </Link>
                ) : (
                  <a
                    href="#tv-catalog"
                    className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
                  >
                    <Play size={18} fill="currentColor" />
                    Watch Now
                  </a>
                )}
                <a
                  href="#tv-catalog"
                  className="rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary"
                >
                  Browse All
                </a>
              </div>
            </div>

            <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
              {tabs.map((filter) => {
                const Icon = filterIcons[filter];
                const selected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex flex-none items-center gap-2 rounded-md border px-4 py-2 font-ui text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
                      selected
                        ? "border-primary bg-primary text-text-primary"
                        : "border-border text-text-secondary hover:border-border-light hover:text-text-primary"
                    }`}
                  >
                    {Icon && <Icon size={14} />}
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        {/* ====================== Hero Section: End ====================== */}

        <div id="tv-catalog">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={20} className="animate-spin text-text-secondary" />
            </div>
          ) : activeFilter === ALL_FILTER ? (
            <>
              {/* ==================== Trending Now Section: Start ==================== */}
              {trendingShows.length > 0 && (
                <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-ui text-xl font-semibold text-text-primary sm:text-2xl">
                      Trending Now
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {trendingShows.map((show) => (
                      <PosterCard
                        key={show.id}
                        href={`/series/${show.slug}`}
                        title={show.title}
                        posterUrl={show.poster_url}
                        subtitle={seriesSubtitle(show)}
                        cornerTag={show.certification ?? undefined}
                      />
                    ))}
                  </div>
                </section>
              )}
              {/* ===================== Trending Now Section: End ===================== */}

              {/* ====================== More Series Section: Start ====================== */}
              {moreShows.length > 0 && (
                <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-ui text-xl font-semibold text-text-primary sm:text-2xl">
                      More Series
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {moreShows.map((show) => (
                      <PosterCard
                        key={show.id}
                        href={`/series/${show.slug}`}
                        title={show.title}
                        posterUrl={show.poster_url}
                        subtitle={seriesSubtitle(show)}
                        cornerTag={show.certification ?? undefined}
                      />
                    ))}
                  </div>
                </section>
              )}
              {/* ======================= More Series Section: End ======================= */}

              {/* ===================== Latest Episodes Section: Start ===================== */}
              {latestEpisodes.length > 0 && (
                <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-ui text-xl font-semibold text-text-primary sm:text-2xl">
                      Latest Episodes
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    {latestEpisodes.map((item) => (
                      <NewEpisodeRow key={item.episode.id} item={item} />
                    ))}
                  </div>
                </section>
              )}
              {/* ====================== Latest Episodes Section: End ====================== */}
            </>
          ) : (
            <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
              <h2 className="mb-4 font-ui text-xl font-semibold text-text-primary sm:text-2xl">
                {activeFilter === FEATURED_FILTER ? "Featured Series" : `${activeFilter} Series`}
              </h2>
              {filteredShows.length === 0 ? (
                <p className="font-body text-sm text-text-secondary">No series found in this category yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {filteredShows.map((show) => (
                    <PosterCard
                      key={show.id}
                      href={`/series/${show.slug}`}
                      title={show.title}
                      posterUrl={show.poster_url}
                      subtitle={seriesSubtitle(show)}
                      cornerTag={show.certification ?? undefined}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Mobile app-style bottom nav — page-scoped for now; move into _app.tsx
          if every page should keep it visible on mobile. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 py-2 backdrop-blur-md lg:hidden">
        {bottomNavItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 font-ui text-[10px] font-medium uppercase tracking-wide text-text-secondary"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-md ${
                  active ? "bg-primary text-text-primary" : "text-text-secondary"
                }`}
              >
                <Icon size={16} />
              </span>
              <span className={active ? "text-primary" : ""}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

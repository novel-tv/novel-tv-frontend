"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Play,
  ChevronRight,
  Star,
  Sparkles,
  Clapperboard,
  Home as HomeIcon,
  Tv,
  Radio,
  Bookmark,
  Loader2,
} from "lucide-react";
import { fetchMovies, type Movie } from "@/lib/movies";
import { fetchGenres, type Genre } from "@/lib/genres";
import { PosterCard } from "@/components/PosterCard";
import { TrailerModal } from "@/components/TrailerModal";

const ALL_FILTER = "All";
const FEATURED_FILTER = "Featured";

const genreIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  [ALL_FILTER]: Sparkles,
  [FEATURED_FILTER]: Star,
};

const bottomNavItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Movies", href: "/movies", icon: Clapperboard },
  { label: "TV Shows", href: "/tv-shows", icon: Tv },
  { label: "Live TV", href: "/live-tv", icon: Radio },
  { label: "My List", href: "/my-list", icon: Bookmark },
];

function movieSubtitle(movie: Movie): string {
  return [movie.release_year, movie.runtime_minutes ? `${movie.runtime_minutes} min` : null]
    .filter(Boolean)
    .join(" · ");
}

function MovieRow({
  title,
  movies,
  onViewAll,
}: {
  title: string;
  movies: Movie[];
  onViewAll?: () => void;
}) {
  if (movies.length === 0) return null;

  return (
    <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-ui text-xl font-semibold text-text-primary sm:text-2xl">{title}</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 font-ui text-sm font-medium text-primary transition-colors duration-150 hover:text-accent"
          >
            View All
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {movies.map((movie) => (
          <PosterCard
            key={movie.id}
            href={`/movies/${movie.slug}`}
            title={movie.title}
            posterUrl={movie.poster_url}
            subtitle={movieSubtitle(movie)}
            cornerTag={movie.certification ?? undefined}
            topLeftBadge={movie.is_ppv ? "PPV" : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export default function MoviesPage() {
  const pathname = usePathname();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState(ALL_FILTER);

  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [newReleaseMovies, setNewReleaseMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  const tabs = [ALL_FILTER, FEATURED_FILTER, ...genres.map((genre) => genre.name)];
  const heroMovie = featuredMovies[0] ?? trendingMovies[0] ?? null;

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
        const [featured, latest] = await Promise.all([
          fetchMovies({ featured: true, perPage: 10 }),
          fetchMovies({ perPage: 15 }),
        ]);

        if (cancelled) return;

        setFeaturedMovies(featured);
        setTrendingMovies(latest.slice(0, 5));
        setNewReleaseMovies(
          [...latest].sort((a, b) => (b.release_year ?? 0) - (a.release_year ?? 0)).slice(0, 5),
        );
      } catch {
        if (!cancelled) {
          setFeaturedMovies([]);
          setTrendingMovies([]);
          setNewReleaseMovies([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Only the curated rows above need the "All" state's three separate
  // fetches — selecting a real filter (Featured, or a genre) replaces them
  // with a single filtered grid instead, mirroring the tabs' own two
  // genuinely-supported backend params (MovieController::index() accepts
  // `featured` and `genre`, nothing else) rather than pretending a tab
  // exists for anything the backend can't actually filter by.
  useEffect(() => {
    if (activeGenre === ALL_FILTER) {
      setFilteredMovies([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const data =
          activeGenre === FEATURED_FILTER
            ? await fetchMovies({ featured: true, perPage: 20 })
            : await fetchMovies({
                genre: genres.find((genre) => genre.name === activeGenre)?.slug,
                perPage: 20,
              });
        if (!cancelled) setFilteredMovies(data);
      } catch {
        if (!cancelled) setFilteredMovies([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeGenre, genres]);

  return (
    <>
      {showTrailer && heroMovie?.trailer_url && (
        <TrailerModal
          title={heroMovie.title}
          trailerUrl={heroMovie.trailer_url}
          onClose={() => setShowTrailer(false)}
        />
      )}
      <div className="pb-16 lg:pb-0">
        {/* ===================== Hero Section: Start ===================== */}
        <section className="relative isolate min-h-115 overflow-hidden bg-background sm:min-h-125">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/movies-hero.png"
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
                Movies.
              </h1>

              <p className="mt-5 max-w-md font-body text-base text-text-secondary sm:text-lg">
                Blockbusters, classics, and hidden gems. All the movies you
                love. All in one place.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                {heroMovie?.trailer_url ? (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
                  >
                    <Play size={18} fill="currentColor" />
                    Play Trailer
                  </button>
                ) : heroMovie ? (
                  <Link
                    href={`/movies/${heroMovie.slug}`}
                    className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
                  >
                    <Play size={18} fill="currentColor" />
                    Play Trailer
                  </Link>
                ) : (
                  <a
                    href="#movies-catalog"
                    className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
                  >
                    <Play size={18} fill="currentColor" />
                    Play Trailer
                  </a>
                )}
                <a
                  href="#movies-catalog"
                  className="rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary"
                >
                  Browse All
                </a>
              </div>
            </div>

            <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
              {tabs.map((genre) => {
                const Icon = genreIcons[genre];
                const selected = activeGenre === genre;
                return (
                  <button
                    key={genre}
                    onClick={() => setActiveGenre(genre)}
                    className={`flex flex-none items-center gap-2 rounded-md border px-4 py-2 font-ui text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
                      selected
                        ? "border-primary bg-primary text-text-primary"
                        : "border-border text-text-secondary hover:border-border-light hover:text-text-primary"
                    }`}
                  >
                    {Icon && <Icon size={14} />}
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        {/* ====================== Hero Section: End ====================== */}

        <div id="movies-catalog">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={20} className="animate-spin text-text-secondary" />
            </div>
          ) : activeGenre === ALL_FILTER ? (
            <>
              <MovieRow
                title="Featured Movies"
                movies={featuredMovies}
                onViewAll={() => setActiveGenre(FEATURED_FILTER)}
              />
              <MovieRow title="Trending Now" movies={trendingMovies} />
              <MovieRow title="New Releases" movies={newReleaseMovies} />
            </>
          ) : filteredMovies.length === 0 ? (
            <p className="mx-auto max-w-360 px-4 py-16 text-center font-body text-sm text-text-secondary sm:px-6 lg:px-10">
              No movies found in {activeGenre === FEATURED_FILTER ? "Featured" : activeGenre}.
            </p>
          ) : (
            <MovieRow
              title={activeGenre === FEATURED_FILTER ? "Featured Movies" : `${activeGenre} Movies`}
              movies={filteredMovies}
            />
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

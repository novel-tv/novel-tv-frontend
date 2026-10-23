"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Loader2, Check, Plus } from "lucide-react";
import { fetchMovieAccess, fetchMovieBySlug, fetchMoviePlaybackToken, type Movie } from "@/lib/movies";
import { startPpvCheckout } from "@/lib/ppv";
import type { CheckoutGateway } from "@/lib/subscriptions";
import { type CouponPreview } from "@/lib/coupons";
import { ApiError } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import { sendPlaybackHeartbeat, stopPlaybackSession } from "@/lib/playback-sessions";
import { fetchRelatedMovies } from "@/lib/related-content";
import type { SearchResult } from "@/lib/search";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { ContentPlayer } from "@/components/ContentPlayer";
import { EmbeddedCheckoutModal } from "@/components/EmbeddedCheckoutModal";
import { PosterCard } from "@/components/PosterCard";
import { PpvCouponInput } from "@/components/PpvCouponInput";
import type { ContentAccess, PlaybackTokens } from "@/lib/catalog-types";

export default function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const { isFavorited, toggle } = useFavorites();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<ContentAccess | null>(null);
  const [playbackTokens, setPlaybackTokens] = useState<PlaybackTokens | null | undefined>(undefined);
  const [screenLimitMessage, setScreenLimitMessage] = useState<string | null>(null);
  const [checkoutGateway, setCheckoutGateway] = useState<CheckoutGateway | null>(null);
  const [rentError, setRentError] = useState<string | null>(null);
  const [embeddedCheckout, setEmbeddedCheckout] = useState<{ clientSecret: string; publishableKey: string } | null>(
    null,
  );
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPreview | null>(null);
  const [relatedTitles, setRelatedTitles] = useState<SearchResult[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMovieBySlug(slug);
        if (!cancelled) setMovie(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "This movie could not be found."
              : "Something went wrong. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    fetchRelatedMovies(slug)
      .then((data) => {
        if (!cancelled) setRelatedTitles(data);
      })
      .catch(() => {
        if (!cancelled) setRelatedTitles([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchMovieAccess(slug);
        if (!cancelled) setAccess(data);
      } catch {
        if (!cancelled) setAccess(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, user]);

  const canWatch = access?.reason === "subscribed" || access?.reason === "ppv_purchased";

  function discountedPpvPrice(price: number): number {
    if (!appliedCoupon) return price;
    const discount =
      appliedCoupon.discount_type === "percent" ? price * (appliedCoupon.discount_value / 100) : appliedCoupon.discount_value;
    return Math.max(price - discount, 0);
  }

  async function handleRent(gateway: CheckoutGateway) {
    if (!movie) return;
    setCheckoutGateway(gateway);
    setRentError(null);
    try {
      const result = await startPpvCheckout("movie", movie.id, gateway, appliedCoupon?.code);
      if (result.gateway === "stripe") {
        setEmbeddedCheckout({ clientSecret: result.clientSecret, publishableKey: result.publishableKey });
      } else {
        // PayPal isn't part of this change — still a redirect, same as before.
        window.location.assign(result.url);
      }
    } catch (err) {
      setRentError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setCheckoutGateway(null);
    }
  }

  async function handleCheckoutComplete() {
    setEmbeddedCheckout(null);
    setCheckoutGateway(null);
    try {
      setAccess(await fetchMovieAccess(slug));
    } catch {
      setAccess(null);
    }
  }

  useEffect(() => {
    if (!movie || movie.mux_playback_policy !== "signed" || !canWatch) return;

    let cancelled = false;
    const deviceId = getDeviceId();

    (async () => {
      try {
        const tokens = await fetchMoviePlaybackToken(movie.id, deviceId);
        if (!cancelled) {
          setPlaybackTokens(tokens);
          setScreenLimitMessage(null);
        }
      } catch (err) {
        if (!cancelled) {
          setPlaybackTokens(null);
          setScreenLimitMessage(err instanceof ApiError && err.status === 409 ? err.message : null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [movie, canWatch]);

  // Keeps this device's screen slot alive while actively watching, and
  // frees it immediately on navigating away — the backend also expires a
  // session on its own after ~90s of no heartbeat, so this is for prompt
  // release (e.g. switching devices right away), not strictly required.
  useEffect(() => {
    if (!playbackTokens?.token) return;

    const deviceId = getDeviceId();
    if (!deviceId) return;

    const interval = setInterval(() => {
      sendPlaybackHeartbeat(deviceId).catch(() => {});
    }, 30_000);

    return () => {
      clearInterval(interval);
      stopPlaybackSession(deviceId).catch(() => {});
    };
  }, [playbackTokens?.token]);

  if (isLoading) {
    return (
      <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background">
        <Loader2 size={20} className="animate-spin text-text-secondary" />
      </section>
    );
  }

  if (error || !movie) {
    return (
      <section className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-3 bg-background text-center">
        <p className="font-body text-sm text-text-secondary">{error ?? "Movie not found."}</p>
        <Link href="/movies" className="font-ui text-sm font-semibold text-primary hover:text-accent">
          Back to Movies
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-background">
      {embeddedCheckout && (
        <EmbeddedCheckoutModal
          clientSecret={embeddedCheckout.clientSecret}
          publishableKey={embeddedCheckout.publishableKey}
          onClose={() => {
            setEmbeddedCheckout(null);
            setCheckoutGateway(null);
          }}
          onComplete={handleCheckoutComplete}
        />
      )}
      <div className="relative isolate min-h-100 overflow-hidden sm:min-h-125">
        <div className="absolute inset-0 -z-10">
          <Image
            src={movie.backdrop_url ?? "/images/movie-poster.png"}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/30" />
        </div>

        <div className="mx-auto flex max-w-360 flex-col gap-6 px-4 pb-10 pt-16 sm:flex-row sm:px-6 lg:px-10">
          <div className="relative hidden aspect-2/3 w-48 shrink-0 overflow-hidden rounded-md border border-border shadow-md sm:block">
            <Image src={movie.poster_url ?? "/images/movie-poster.png"} alt="" fill className="object-cover" />
          </div>

          <div className="max-w-2xl">
            {movie.is_ppv && (
              <span className="mb-3 inline-block rounded bg-primary px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-text-primary">
                Pay-Per-View
              </span>
            )}
            <h1 className="font-heading text-5xl uppercase text-text-primary sm:text-6xl">{movie.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 font-body text-sm text-text-secondary">
              {movie.release_year && <span>{movie.release_year}</span>}
              {movie.runtime_minutes && <span>{movie.runtime_minutes} min</span>}
              {movie.certification && (
                <span className="rounded border border-border-light px-1.5 py-0.5 font-ui text-xs font-semibold">
                  {movie.certification}
                </span>
              )}
              {movie.country && <span>{movie.country.name}</span>}
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-border-light px-3 py-1 font-ui text-xs font-medium text-text-secondary"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {movie.synopsis && (
              <p className="mt-5 font-body text-base text-text-secondary">{movie.synopsis}</p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              {!user || access?.reason === "requires_subscription" ? (
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
                >
                  <Play size={18} fill="currentColor" />
                  Subscribe to Watch
                </Link>
              ) : canWatch ? (
                <a
                  href="#movie-player"
                  className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
                >
                  <Play size={18} fill="currentColor" />
                  Watch Now
                </a>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleRent("stripe")}
                    disabled={checkoutGateway !== null}
                    className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Play size={18} fill="currentColor" />
                    {checkoutGateway === "stripe"
                      ? "Loading checkout…"
                      : `Rent with Card${movie.ppv_price ? ` — $${discountedPpvPrice(movie.ppv_price).toFixed(2)}` : ""}`}
                  </button>
                  <button
                    onClick={() => handleRent("paypal")}
                    disabled={checkoutGateway !== null}
                    className="flex items-center gap-2 rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutGateway === "paypal" ? "Redirecting…" : "Rent with PayPal"}
                  </button>
                  {movie.is_ppv && (
                    <PpvCouponInput
                      purchasableType="movie"
                      purchasableId={movie.id}
                      appliedCoupon={appliedCoupon}
                      onApply={setAppliedCoupon}
                      onRemove={() => setAppliedCoupon(null)}
                    />
                  )}
                </div>
              )}

              {user && (
                <button
                  onClick={() => toggle("movie", movie.id)}
                  className="flex items-center gap-2 rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary"
                >
                  {isFavorited("movie", movie.id) ? (
                    <>
                      <Check size={18} />
                      In My List
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add to My List
                    </>
                  )}
                </button>
              )}
            </div>

            {rentError && <p className="mt-3 font-body text-sm text-error">{rentError}</p>}

            {movie.cast && movie.cast.length > 0 && (
              <div className="mt-8">
                <h2 className="font-ui text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Cast
                </h2>
                <p className="mt-2 font-body text-sm text-text-secondary">
                  {movie.cast.map((member) => member.name).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="movie-player" className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
        <h2 className="mb-4 font-ui text-xl font-semibold text-text-primary sm:text-2xl">Watch</h2>
        <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-black">
          <ContentPlayer
            canWatch={canWatch}
            accessReason={access?.reason}
            isLoggedIn={Boolean(user)}
            videoTitle={movie.title}
            muxPlaybackId={movie.mux_playback_id}
            muxPlaybackPolicy={movie.mux_playback_policy}
            muxPlaybackToken={playbackTokens === null ? null : playbackTokens?.token}
            muxThumbnailToken={playbackTokens?.thumbnailToken}
            muxStoryboardToken={playbackTokens?.storyboardToken}
            screenLimitMessage={screenLimitMessage}
          />
        </div>
      </div>

      {relatedTitles.length > 0 && (
        <div className="mx-auto max-w-360 px-4 pb-12 sm:px-6 lg:px-10">
          <h2 className="mb-4 font-ui text-xl font-semibold text-text-primary sm:text-2xl">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {relatedTitles.map((item) => (
              <PosterCard
                key={`${item.type}-${item.id}`}
                href={item.type === "series" ? `/series/${item.slug}` : `/movies/${item.slug}`}
                title={item.title}
                posterUrl={item.poster_url}
                subtitle={item.year ? String(item.year) : undefined}
                topLeftBadge={item.is_ppv ? "PPV" : undefined}
                topRightBadge={item.type === "series" ? "Series" : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

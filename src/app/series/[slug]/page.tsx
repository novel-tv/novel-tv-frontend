"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Play, PlayCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchSeriesAccess, fetchSeriesBySlug, type Series } from "@/lib/series";
import { startPpvCheckout } from "@/lib/ppv";
import type { CheckoutGateway } from "@/lib/subscriptions";
import { type CouponPreview } from "@/lib/coupons";
import type { ContentAccess } from "@/lib/catalog-types";
import { ApiError } from "@/lib/api";
import { EmbeddedCheckoutModal } from "@/components/EmbeddedCheckoutModal";
import { PpvCouponInput } from "@/components/PpvCouponInput";
import { TrailerModal } from "@/components/TrailerModal";

export default function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();

  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<ContentAccess | null>(null);
  const [checkoutGateway, setCheckoutGateway] = useState<CheckoutGateway | null>(null);
  const [rentError, setRentError] = useState<string | null>(null);
  const [embeddedCheckout, setEmbeddedCheckout] = useState<{ clientSecret: string; publishableKey: string } | null>(
    null,
  );
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPreview | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSeriesBySlug(slug);
        if (!cancelled) setSeries(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "This series could not be found."
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
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchSeriesAccess(slug);
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
    if (!series) return;
    setCheckoutGateway(gateway);
    setRentError(null);
    try {
      const result = await startPpvCheckout("series", series.id, gateway, appliedCoupon?.code);
      if (result.gateway === "stripe") {
        setEmbeddedCheckout({ clientSecret: result.clientSecret, publishableKey: result.publishableKey });
      } else {
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
      setAccess(await fetchSeriesAccess(slug));
    } catch {
      setAccess(null);
    }
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background">
        <Loader2 size={20} className="animate-spin text-text-secondary" />
      </section>
    );
  }

  if (error || !series) {
    return (
      <section className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-3 bg-background text-center">
        <p className="font-body text-sm text-text-secondary">{error ?? "Series not found."}</p>
        <Link href="/tv-shows" className="font-ui text-sm font-semibold text-primary hover:text-accent">
          Back to TV Shows
        </Link>
      </section>
    );
  }

  const firstSeason = series.seasons?.[0];

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
      {showTrailer && series.trailer_url && (
        <TrailerModal
          title={series.title}
          trailerUrl={series.trailer_url}
          onClose={() => setShowTrailer(false)}
        />
      )}
      <div className="relative isolate min-h-100 overflow-hidden sm:min-h-125">
        <div className="absolute inset-0 -z-10">
          <Image
            src={series.backdrop_url ?? "/images/movie-poster.png"}
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
            <Image src={series.poster_url ?? "/images/movie-poster.png"} alt="" fill className="object-cover" />
          </div>

          <div className="max-w-2xl">
            {series.is_ppv && (
              <span className="mb-3 inline-block rounded bg-primary px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-text-primary">
                Pay-Per-View
              </span>
            )}
            <h1 className="font-heading text-5xl uppercase text-text-primary sm:text-6xl">{series.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 font-body text-sm text-text-secondary">
              {series.first_air_year && <span>{series.first_air_year}</span>}
              {series.seasons && (
                <span>
                  {series.seasons.length} Season{series.seasons.length === 1 ? "" : "s"}
                </span>
              )}
              {series.certification && (
                <span className="rounded border border-border-light px-1.5 py-0.5 font-ui text-xs font-semibold">
                  {series.certification}
                </span>
              )}
              {series.country && <span>{series.country.name}</span>}
            </div>

            {series.genres && series.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {series.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-border-light px-3 py-1 font-ui text-xs font-medium text-text-secondary"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {series.synopsis && (
              <p className="mt-5 font-body text-base text-text-secondary">{series.synopsis}</p>
            )}

            {series.trailer_url && (
              <button
                onClick={() => setShowTrailer(true)}
                className="mt-5 flex w-fit items-center gap-2 rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary"
              >
                <PlayCircle size={18} />
                Play Trailer
              </button>
            )}

            {series.is_ppv && !canWatch && (
              <div className="mt-6">
                {!user || access?.reason === "requires_subscription" ? (
                  <Link
                    href="/pricing"
                    className="flex w-fit items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
                  >
                    <Play size={18} fill="currentColor" />
                    Subscribe to Watch
                  </Link>
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
                        : `Rent with Card${series.ppv_price ? ` — $${discountedPpvPrice(series.ppv_price).toFixed(2)}` : ""}`}
                    </button>
                    <button
                      onClick={() => handleRent("paypal")}
                      disabled={checkoutGateway !== null}
                      className="flex items-center gap-2 rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkoutGateway === "paypal" ? "Redirecting…" : "Rent with PayPal"}
                    </button>
                    <PpvCouponInput
                      purchasableType="series"
                      purchasableId={series.id}
                      appliedCoupon={appliedCoupon}
                      onApply={setAppliedCoupon}
                      onRemove={() => setAppliedCoupon(null)}
                    />
                  </div>
                )}
                {rentError && <p className="mt-3 font-body text-sm text-error">{rentError}</p>}
              </div>
            )}

            {series.cast && series.cast.length > 0 && (
              <div className="mt-6">
                <h2 className="font-ui text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Cast
                </h2>
                <p className="mt-2 font-body text-sm text-text-secondary">
                  {series.cast.map((member) => member.name).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-360 px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-wrap gap-2">
          {series.seasons?.map((season) => (
            <Link
              key={season.id}
              href={`/series/${series.slug}/season/${season.number}`}
              className={`rounded-md border px-4 py-2 font-ui text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
                season.number === firstSeason?.number
                  ? "border-primary bg-primary text-text-primary"
                  : "border-border text-text-secondary hover:border-border-light hover:text-text-primary"
              }`}
            >
              {season.title ?? `Season ${season.number}`}
            </Link>
          ))}
        </div>

        {firstSeason?.episodes && firstSeason.episodes.length > 0 && (
          <div className="mt-6 space-y-3">
            {firstSeason.episodes.map((episode) => (
              <Link
                key={episode.id}
                href={`/series/${series.slug}/season/${firstSeason.number}/episode/${episode.number}`}
                className="flex items-center gap-4 rounded-md border border-border bg-surface p-3 transition-colors duration-150 hover:border-border-light hover:bg-surface-hover"
              >
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded border border-border-light">
                  <Image
                    src={episode.still_url ?? "/images/movie-preview.png"}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={16} className="text-text-primary" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-ui text-sm font-semibold text-text-primary">
                    {episode.number}. {episode.title}
                  </p>
                  {episode.overview && (
                    <p className="mt-0.5 line-clamp-1 font-body text-xs text-text-secondary">
                      {episode.overview}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

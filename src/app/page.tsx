"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  ChevronRight,
  Tv,
  Smartphone,
  Tablet,
  Laptop,
  Gamepad2,
  Newspaper,
  Globe2,
  Clapperboard,
  Film,
  Baby,
  Smile,
  Music2,
  PlayCircle,
  Download,
  MonitorSmartphone,
} from "lucide-react";
import {
  channelCategories,
  scheduleTimes,
  liveChannels,
} from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { fetchWatchHistory, type WatchHistoryEntry } from "@/lib/watch-history";
import { fetchRecommendations } from "@/lib/recommendations";
import { fetchCurrentSubscription } from "@/lib/subscriptions";
import type { SearchResult } from "@/lib/search";
import { PosterCard } from "@/components/PosterCard";

const devices = [
  { label: "Smart TV", icon: Tv },
  { label: "Phone", icon: Smartphone },
  { label: "Tablet", icon: Tablet },
  { label: "Laptop", icon: Laptop },
  { label: "Game Console", icon: Gamepad2 },
];

const categoryIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  "All Channels": Tv,
  News: Newspaper,
  Sports: Globe2,
  Entertainment: Clapperboard,
  Movies: Film,
  Kids: Baby,
  Comedy: Smile,
  Music: Music2,
};

const appFeatures = [
  { icon: Tv, title: "Live TV", subtitle: "100+ Channels" },
  { icon: PlayCircle, title: "On Demand", subtitle: "Movies & Shows" },
  { icon: Download, title: "Download", subtitle: "Watch Offline" },
  { icon: MonitorSmartphone, title: "Multi-Device", subtitle: "Stream Anywhere" },
];

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [activeCategory, setActiveCategory] = useState(channelCategories[0]);
  const { user } = useAuth();
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>([]);
  const [recommendations, setRecommendations] = useState<SearchResult[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const searchParams = useSearchParams();
  const accountDeleted = searchParams.get("account_deleted") === "1";

  useEffect(() => {
    if (!user) {
      setIsSubscribed(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const subscription = await fetchCurrentSubscription();
        if (!cancelled) setIsSubscribed(subscription !== null);
      } catch {
        if (!cancelled) setIsSubscribed(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchWatchHistory();
        if (!cancelled) setWatchHistory(data);
      } catch {
        if (!cancelled) setWatchHistory([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetchRecommendations();
        if (!cancelled) setRecommendations(response.data);
      } catch {
        if (!cancelled) setRecommendations([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const continueWatching = user ? watchHistory : [];
  const recommended = user ? recommendations : [];

  return (
    <>
      {accountDeleted && (
        <div className="mx-auto max-w-360 px-4 pt-4 sm:px-6 lg:px-10">
          <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 font-body text-sm text-success">
            Your account deletion request has been received. You&apos;ll get a confirmation email
            shortly.
          </p>
        </div>
      )}

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

        <div className="mx-auto max-w-360 px-4 pb-14 pt-10 sm:px-6 lg:px-10 lg:pt-14">
          <div className="max-w-2xl">
            <p className="font-ui text-sm font-semibold uppercase tracking-[0.2em] text-text-secondary">
              Stream <span className="text-accent">Different.</span>
            </p>

            <h1
              className="mt-2 font-heading text-6xl uppercase text-text-primary sm:text-7xl lg:text-hero"
              style={{ lineHeight: "var(--leading-tight)" }}
            >
              No Limits.
            </h1>

            <p
              className="mt-2 font-heading text-3xl uppercase text-accent sm:text-4xl"
              style={{ lineHeight: "var(--leading-heading)" }}
            >
              All your favorites.
              <br />
              All in one place.
            </p>

            <p className="mt-5 max-w-md font-body text-base text-text-secondary sm:text-lg">
              Movies. TV shows. Live TV. Originals. No limits. Just nonstop
              entertainment.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href={isSubscribed ? "/movies" : "/pricing"}
                className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent"
              >
                <Play size={18} fill="currentColor" />
                Start Watching
              </Link>
              <Link
                href="/movies"
                className="rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary"
              >
                Browse Titles
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-ui text-xs uppercase tracking-wide text-text-muted">
                Available on
              </span>
              {devices.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs text-text-secondary"
                >
                  <Icon size={16} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ====================== Hero Section: End ====================== */}

      {/* ================ Continue Watching Section: Start ================ */}
      {continueWatching.length > 0 && (
        <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-ui text-xl font-semibold text-text-primary sm:text-2xl">
              Continue Watching
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {continueWatching.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.url ?? "#"}
                className="group relative aspect-video overflow-hidden rounded-md border border-border bg-surface"
              >
                <Image
                  src={item.poster_url ?? "/images/movie-preview.png"}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/25 to-black/10 transition-colors duration-150 group-hover:from-black/90" />

                <span
                  aria-label={`Resume ${item.title ?? "title"}`}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-text-primary opacity-90 backdrop-blur-sm transition-transform duration-150 group-hover:scale-110"
                >
                  <Play size={16} fill="currentColor" />
                </span>

                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-heading text-2xl uppercase tracking-wide text-text-primary">
                    {item.title ?? "Untitled"}
                  </p>
                  <p className="mt-0.5 font-ui text-xs text-text-secondary">
                    {item.type === "episode" ? "Episode" : "Movie"}
                  </p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.progress_percent}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* ================= Continue Watching Section: End ================= */}

      {/* =================== Recommended For You Section: Start =================== */}
      {recommended.length > 0 && (
        <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-ui text-xl font-semibold text-text-primary sm:text-2xl">
              Recommended For You
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {recommended.map((item) => (
              <PosterCard
                key={`${item.type}-${item.id}`}
                href={item.type === "movie" ? `/movies/${item.slug}` : `/series/${item.slug}`}
                title={item.title}
                posterUrl={item.poster_url}
                subtitle={item.year ? String(item.year) : undefined}
                topLeftBadge={item.is_ppv ? "PPV" : undefined}
              />
            ))}
          </div>
        </section>
      )}
      {/* ==================== Recommended For You Section: End ==================== */}

      {/* ================== Live TV Channels Section: Start ================== */}
      <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-ui text-xl font-semibold text-text-primary sm:text-2xl">
            Live TV Channels
          </h2>
          <Link
            href="/live-tv"
            className="flex items-center gap-1 font-ui text-sm font-medium text-primary transition-colors duration-150 hover:text-accent"
          >
            View All Channels
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
          {channelCategories.map((cat) => {
            const Icon = categoryIcons[cat] ?? Tv;
            const selected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex flex-none items-center gap-2 rounded-md border px-4 py-2 font-ui text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
                  selected
                    ? "border-primary text-primary"
                    : "border-border text-text-secondary hover:border-border-light hover:text-text-primary"
                }`}
              >
                <Icon size={16} />
                {cat}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-180 border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="w-40 px-4 py-2 font-ui text-xs font-semibold uppercase tracking-wide text-primary sm:w-48">
                  On Now
                </th>
                {scheduleTimes.map((time) => (
                  <th
                    key={time}
                    className="px-4 py-2 font-ui text-xs font-semibold uppercase tracking-wide text-text-secondary"
                  >
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveChannels.map((channel, i) => (
                <tr
                  key={channel.id}
                  className={`border-b border-border last:border-b-0 ${
                    i % 2 === 0 ? "bg-surface-light/40" : "bg-transparent"
                  }`}
                >
                  <td className="px-4 py-3 align-middle">
                    {channel.logo ? (
                      <Image
                        src={channel.logo}
                        alt={channel.name}
                        width={220}
                        height={60}
                        className="h-6 w-auto object-contain"
                      />
                    ) : (
                      <span className="font-heading text-lg uppercase tracking-wide text-text-primary">
                        {channel.name}
                      </span>
                    )}
                  </td>
                  {channel.slots.map((slot, idx) => (
                    <td key={idx} className="px-4 py-3 align-top">
                      <p className="flex items-center gap-2 font-ui text-sm font-medium text-text-primary">
                        {slot.title}
                        {slot.live && (
                          <span className="rounded bg-primary px-1.5 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-text-primary">
                            Live
                          </span>
                        )}
                      </p>
                      {slot.subtitle && (
                        <p className="mt-0.5 font-body text-xs text-text-muted">
                          {slot.subtitle}
                        </p>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* =================== Live TV Channels Section: End =================== */}

      {/* ===================== App Promo Section: Start ===================== */}
      <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-xl border border-primary bg-surface-blue">
          <Image
            src="/images/app-background.png"
            alt=""
            fill
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-linear-to-r from-surface-blue via-surface-blue/70 to-transparent" />

          <div className="relative flex flex-col items-start justify-between gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center">
            <div className="max-w-md">
              <h2 className="font-heading text-4xl uppercase leading-tight text-text-primary sm:text-5xl">
                The <span className="text-accent">Novel TV</span> App
              </h2>
              <p className="mt-2 font-body text-text-secondary">
                Your ultimate streaming experience.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {appFeatures.map(({ icon: Icon, title, subtitle }) => (
                  <div key={title} className="flex flex-col items-start gap-2">
                    <Icon size={28} className="text-primary" />
                    <p className="font-ui text-sm font-semibold uppercase text-text-primary">
                      {title}
                    </p>
                    <p className="font-body text-xs text-text-muted">
                      {subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ====================== App Promo Section: End ====================== */}
    </>
  );
}

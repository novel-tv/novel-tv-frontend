"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Play,
  LayoutGrid,
  ChevronDown,
  Loader2,
  Tv,
  Newspaper,
  Trophy,
  Clapperboard,
  Film,
  Baby,
  Music2,
  Smile,
  Radio,
  Home as HomeIcon,
  Bookmark,
  Smartphone,
  Tablet,
  Laptop,
} from "lucide-react";
import { guideTimes, currentlyPlaying, onNextItems, streamingDevices } from "@/lib/demo-data";
import { fetchLiveTvCategories, fetchLiveTvChannels, type LiveTvCategory, type LiveTvChannel } from "@/lib/live-tv";

const ALL_CHANNELS = "All Channels";

const categoryIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  "All Channels": Tv,
  News: Newspaper,
  Sports: Trophy,
  Entertainment: Clapperboard,
  Movies: Film,
  Kids: Baby,
  Music: Music2,
  Comedy: Smile,
};

const bottomNavItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Movies", href: "/movies", icon: Clapperboard },
  { label: "TV Shows", href: "/tv-shows", icon: Tv },
  { label: "Live TV", href: "/live-tv", icon: Radio },
  { label: "My List", href: "/my-list", icon: Bookmark },
];

export default function LiveTvPage() {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState(ALL_CHANNELS);
  const [categories, setCategories] = useState<LiveTvCategory[]>([]);
  const [channels, setChannels] = useState<LiveTvChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [categoriesData, channelsData] = await Promise.all([
          fetchLiveTvCategories(),
          fetchLiveTvChannels(),
        ]);
        if (!cancelled) {
          setCategories(categoriesData);
          setChannels(channelsData);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setChannels([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryNames = [ALL_CHANNELS, ...categories.map((category) => category.name)];
  const visibleChannels =
    activeCategory === ALL_CHANNELS
      ? channels
      : channels.filter((channel) => channel.category.name === activeCategory);

  return (
    <>
      <div className="pb-16 lg:pb-0">
        {/* ===================== Hero Section: Start ===================== */}
        <section className="relative isolate min-h-115 overflow-hidden bg-background sm:min-h-125">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/live-tv-hero.png"
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
              <h1
                className="font-heading text-6xl uppercase text-text-primary sm:text-7xl lg:text-hero"
                style={{ lineHeight: "var(--leading-tight)" }}
              >
                Live TV.
              </h1>

              <p
                className="mt-2 font-heading text-3xl uppercase text-accent sm:text-4xl"
                style={{ lineHeight: "var(--leading-heading)" }}
              >
                Anytime. Anywhere.
              </p>

              <p className="mt-5 max-w-md font-body text-base text-text-secondary sm:text-lg">
                100+ Live channels. Breaking news. Live sports.
                Entertainment &amp; more.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent">
                  <Play size={18} fill="currentColor" />
                  Watch Live
                </button>
                <button className="flex items-center gap-2 rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary">
                  <LayoutGrid size={16} />
                  View All Channels
                </button>
              </div>
            </div>

            <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
              {categoryNames.map((cat) => {
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
          </div>
        </section>
        {/* ====================== Hero Section: End ====================== */}

        {/* ===================== Schedule Section: Start ===================== */}
        <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-ui text-xl font-semibold text-text-primary sm:text-2xl">
              Now on Live
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-lg border border-border py-20">
              <Loader2 size={20} className="animate-spin text-text-secondary" />
            </div>
          ) : visibleChannels.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-border py-20">
              <p className="font-body text-sm text-text-secondary">No channels in this category yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <div className="flex min-w-[900px]">
                {/* Channel column — kept outside the relative time-grid so the
                    "now" indicator's percentage offset lines up with just the
                    time columns. */}
                <div className="w-44 flex-none border-r border-border">
                  <div className="flex h-10 items-center gap-1 border-b border-border bg-surface px-4 font-ui text-xs font-semibold uppercase tracking-wide text-primary">
                    Today
                    <ChevronDown size={14} />
                  </div>
                  {visibleChannels.map((channel, i) => (
                    <div
                      key={channel.id}
                      className={`flex h-[74px] items-center gap-2 px-4 ${
                        i % 2 === 0 ? "bg-surface-light/40" : ""
                      } ${i > 0 ? "border-t border-border" : ""}`}
                    >
                      <div>
                        {channel.logo_url ? (
                          <Image
                            src={channel.logo_url}
                            alt={channel.name}
                            width={220}
                            height={60}
                            className="h-5 w-auto object-contain"
                          />
                        ) : (
                          <span className="font-heading text-base uppercase tracking-wide text-text-primary">
                            {channel.name}
                          </span>
                        )}
                        {channel.channel_number && (
                          <p className="font-body text-[10px] text-text-muted">
                            {channel.channel_number}
                          </p>
                        )}
                      </div>
                      <span className="rounded bg-primary px-1.5 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-text-primary">
                        Live
                      </span>
                    </div>
                  ))}
                </div>

                {/* Time grid */}
                <div className="relative flex-1">
                  {/* "Now" indicator */}
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-primary"
                    style={{ left: "18%" }}
                  >
                    <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-primary" />
                    <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-primary" />
                  </div>

                  <div className="grid h-10 grid-cols-5 border-b border-border bg-surface">
                    {guideTimes.map((time) => (
                      <div
                        key={time}
                        className="flex items-center px-4 font-ui text-xs font-semibold uppercase tracking-wide text-text-secondary"
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Programming schedule isn't available yet (no EPG feed
                      until a real broadcast license is in place) — each
                      channel just shows one generic placeholder slot spanning
                      the full row for now. */}
                  {visibleChannels.map((channel, i) => (
                    <div
                      key={channel.id}
                      className={`grid h-[74px] grid-cols-5 ${
                        i % 2 === 0 ? "bg-surface-light/40" : ""
                      } ${i > 0 ? "border-t border-border" : ""}`}
                    >
                      <div className="relative px-4 py-2" style={{ gridColumn: "span 5" }}>
                        <p className="font-ui text-sm font-medium text-text-primary">
                          Live Programming
                        </p>
                        <p className="mt-0.5 font-body text-xs text-text-muted">
                          Schedule coming soon
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
        {/* ====================== Schedule Section: End ====================== */}

        {/* =========== Currently Playing / On Next Section: Start =========== */}
        <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="relative min-h-96 overflow-hidden rounded-lg border border-border bg-black lg:col-span-2 lg:min-h-100">
              {currentlyPlaying.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentlyPlaying.youtubeId}`}
                  title={currentlyPlaying.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <Image
                  src="/images/currently-playing.png"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              )}

              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 p-4">
                <span className="font-ui text-xs font-bold uppercase tracking-wide text-primary drop-shadow">
                  Currently Playing
                </span>
                <span className="rounded bg-error px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-text-primary">
                  Live
                </span>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 sm:p-6">
                <h3 className="font-heading text-3xl uppercase text-text-primary">
                  {currentlyPlaying.title}
                </h3>
                <p className="mt-1 font-body text-sm text-text-secondary">
                  {currentlyPlaying.timeRange} &middot; {currentlyPlaying.channel}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
              <p className="font-ui text-xs font-bold uppercase tracking-wide text-primary">
                On Next
              </p>
              <div className="mt-3 space-y-4">
                {onNextItems.map((item) => (
                  <div key={item.time} className="flex items-center gap-3">
                    <div className="relative aspect-video w-24 flex-none overflow-hidden rounded-md bg-surface">
                      <Image
                        src="/images/movie-preview.png"
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-ui text-xs font-semibold text-primary">
                        {item.time}
                      </p>
                      <p className="font-ui text-sm font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="font-body text-xs text-text-muted">
                        {item.channel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ============ Currently Playing / On Next Section: End ============ */}

        {/* ================= Everywhere Promo Section: Start ================= */}
        <section className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-xl border border-primary bg-surface-blue">
            <Image
              src="/images/watch-novel-tv-everywhere.png"
              alt=""
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover"
            />

            <div className="relative flex flex-col items-end px-6 py-10 text-right sm:px-10 lg:py-14">
              <h2 className="font-heading text-3xl uppercase leading-tight text-text-primary sm:text-4xl">
                Watch <span className="text-accent">Novel TV</span> Everywhere
              </h2>
              <p className="mt-2 font-body text-text-secondary">
                Stream live TV on all your devices.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
                {streamingDevices.map((label) => {
                  const Icon =
                    label === "Smart TV" ? Tv : label === "Phone" ? Smartphone : label === "Tablet" ? Tablet : Laptop;
                  return (
                    <span
                      key={label}
                      className="flex items-center gap-1.5 font-ui text-sm text-text-secondary"
                    >
                      <Icon size={18} className="text-primary" />
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        {/* ================== Everywhere Promo Section: End ================== */}
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

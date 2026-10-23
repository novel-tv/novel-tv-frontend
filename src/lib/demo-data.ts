// Demo/placeholder data — will be replaced by API responses.

export const mainNavLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tv-shows" },
  { label: "Live TV", href: "/live-tv" },
  { label: "Originals", href: "/originals" },
  { label: "My List", href: "/my-list" },
  { label: "Pricing", href: "/pricing" },
];

export type ContinueWatchingItem = {
  id: string;
  title: string;
  meta: string;
  progress: number; // 0-100
  accent?: boolean;
};

export const continueWatching: ContinueWatchingItem[] = [
  { id: "all-hustle", title: "All Hustle", meta: "S1 E4 · 18m left", progress: 62 },
  { id: "ruthless", title: "Ruthless", meta: "S2 E2 · 24m left", progress: 40 },
  {
    id: "sauce-city",
    title: "Sauce City",
    meta: "S1 E7 · 10m left",
    progress: 85,
    accent: true,
  },
  { id: "paid-in-full", title: "Paid in Full", meta: "Movie", progress: 20 },
];

export const channelCategories = [
  "All Channels",
  "News",
  "Sports",
  "Entertainment",
  "Movies",
  "Kids",
  "Comedy",
  "Music",
];

export const scheduleTimes = ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"];

export type ScheduleSlot = {
  title: string;
  subtitle?: string;
  live?: boolean;
};

export type ChannelRow = {
  id: string;
  name: string;
  logo?: string;
  slots: ScheduleSlot[];
};

export const liveChannels: ChannelRow[] = [
  {
    id: "novel-tv",
    name: "NOVEL TV",
    logo: "/images/novel-tv-logo.png",
    slots: [
      { title: "The Novel Network", live: true },
      { title: "Novel Sports", subtitle: "Live Games & Highlights", live: true },
      { title: "Novel News", subtitle: "News That Hits Different", live: true },
      { title: "Novel Comedy", subtitle: "Laugh On Demand", live: true },
    ],
  },
  {
    id: "espn",
    name: "ESPN",
    logo: "/images/espn.png",
    slots: [
      { title: "SportsCenter", live: true },
      { title: "NBA Countdown", live: true },
      { title: "College Football", live: true },
      { title: "NFL Live", live: true },
    ],
  },
  {
    id: "abc-news",
    name: "ABC News Live",
    logo: "/images/abc-news.png",
    slots: [
      { title: "World News Tonight", live: true },
      { title: "20/20", live: true },
      { title: "Nightline", live: true },
      { title: "This Week", live: true },
    ],
  },
  {
    id: "fox",
    name: "FOX",
    logo: "/images/fox.png",
    slots: [
      { title: "TMZ", live: true },
      { title: "9-1-1", live: true },
      { title: "The Floor", live: true },
      { title: "The Masked Singer", live: true },
    ],
  },
  {
    id: "cnn",
    name: "CNN",
    logo: "/images/cnn.png",
    slots: [
      { title: "Inside the NBA", live: true },
      { title: "All Elite Wrestling", live: true },
      { title: "Major Crimes", live: true },
      { title: "Claws", live: true },
    ],
  },
  {
    id: "hbo",
    name: "HBO",
    logo: "/images/hbo.png",
    slots: [
      { title: "Late Night Feature", subtitle: "7:00 - 9:00 PM" },
      { title: "The Wire Room", subtitle: "9:00 - 10:00 PM" },
      { title: "After Hours", subtitle: "10:00 - 11:00 PM" },
      { title: "Midnight Docs", subtitle: "11:00 - 12:00 AM" },
    ],
  },
];

export const liveTvCategories = [
  "All Channels",
  "News",
  "Sports",
  "Entertainment",
  "Movies",
  "Kids",
  "Music",
  "Comedy",
];

export const guideTimes = ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];

export type GuideSlot = {
  title: string;
  subtitle?: string;
  span: number; // number of half-hour columns this program occupies
};

export type GuideChannel = {
  id: string;
  name: string;
  number: string;
  logo?: string;
  slots: GuideSlot[];
};

export const guideChannels: GuideChannel[] = [
  {
    id: "novel-tv",
    name: "NOVEL TV",
    number: "101",
    logo: "/images/novel-tv-logo.png",
    slots: [
      { title: "The Novel Network", subtitle: "7:00 PM - 8:00 PM", span: 2 },
      { title: "Novel Sports", subtitle: "Live Games & Highlights", span: 1 },
      { title: "Novel News", subtitle: "News That Hits Different", span: 1 },
      { title: "Novel Comedy", subtitle: "Laugh On Demand", span: 1 },
    ],
  },
  {
    id: "espn",
    name: "ESPN",
    number: "102",
    logo: "/images/espn.png",
    slots: [
      { title: "SportsCenter", subtitle: "7:00 PM - 8:00 PM", span: 2 },
      { title: "NBA Countdown", span: 1 },
      { title: "College Football", span: 1 },
      { title: "NFL Live", span: 1 },
    ],
  },
  {
    id: "abc-news",
    name: "ABC News Live",
    number: "103",
    logo: "/images/abc-news.png",
    slots: [
      { title: "World News Tonight", subtitle: "7:00 PM - 8:00 PM", span: 2 },
      { title: "20/20", span: 1 },
      { title: "Nightline", span: 1 },
      { title: "This Week", span: 1 },
    ],
  },
  {
    id: "fox",
    name: "FOX",
    number: "104",
    logo: "/images/fox.png",
    slots: [
      { title: "TMZ", subtitle: "7:00 PM - 8:00 PM", span: 2 },
      { title: "9-1-1", span: 1 },
      { title: "The Floor", span: 1 },
      { title: "The Masked Singer", span: 1 },
    ],
  },
  {
    id: "tnt",
    name: "TNT",
    number: "105",
    logo: "/images/tnt.png",
    slots: [
      { title: "Inside the NBA", subtitle: "7:00 PM - 8:00 PM", span: 2 },
      { title: "All Elite Wrestling", span: 1 },
      { title: "Major Crimes", span: 1 },
      { title: "Claws", span: 1 },
    ],
  },
  {
    id: "disney",
    name: "Disney Channel",
    number: "106",
    slots: [
      { title: "Moana 2", subtitle: "7:00 PM - 9:00 PM", span: 4 },
      { title: "Descendants: Rise", subtitle: "9:00 PM - 11:00 PM", span: 1 },
    ],
  },
];

/**
 * One real, legitimately-embeddable live channel — DW News's official 24/7
 * YouTube Live stream (embedding their own public livestream, not
 * redistributing a raw broadcast feed). Everything else on this page is
 * still placeholder data.
 */
export const currentlyPlaying = {
  title: "DW News",
  timeRange: "24/7 Live",
  channel: "DW News",
  youtubeId: "LuKwFajn37U",
};

export const onNextItems = [
  { time: "10:00 PM", title: "SportsCenter", channel: "ESPN" },
  { time: "10:30 PM", title: "The Equalizer", channel: "TNT" },
  { time: "11:00 PM", title: "The Daily Show", channel: "Comedy Central" },
  { time: "11:30 PM", title: "Family Guy", channel: "FOX" },
];

export const streamingDevices = ["Smart TV", "Phone", "Tablet", "Laptop"];

export type Movie = {
  id: string;
  title: string;
  year: number;
  runtime: string;
  rating: string;
  isNew?: boolean;
};

export const featuredMovies: Movie[] = [
  { id: "power", title: "Power", year: 2014, runtime: "2h 3m", rating: "R", isNew: true },
  { id: "creed-3", title: "Creed III", year: 2023, runtime: "1h 56m", rating: "PG-13", isNew: true },
  { id: "john-wick-4", title: "John Wick: Chapter 4", year: 2023, runtime: "2h 49m", rating: "R", isNew: true },
  { id: "bad-boys-ride-or-die", title: "Bad Boys: Ride or Die", year: 2024, runtime: "1h 55m", rating: "PG-13", isNew: true },
  { id: "equalizer-3", title: "The Equalizer 3", year: 2023, runtime: "1h 49m", rating: "R" },
];

export const trendingMovies: Movie[] = [
  { id: "the-batman", title: "The Batman", year: 2022, runtime: "2h 56m", rating: "PG-13" },
  { id: "top-gun-maverick", title: "Top Gun: Maverick", year: 2022, runtime: "2h 10m", rating: "PG-13" },
  { id: "spider-man-atsv", title: "Spider-Man: Across the Spider-Verse", year: 2023, runtime: "2h 20m", rating: "PG" },
  { id: "wakanda-forever", title: "Black Panther: Wakanda Forever", year: 2022, runtime: "2h 41m", rating: "PG-13" },
  { id: "avengers-endgame", title: "Avengers: Endgame", year: 2019, runtime: "3h 1m", rating: "PG-13" },
];

export const newReleaseMovies: Movie[] = [
  { id: "fall-guy", title: "Fall Guy", year: 2024, runtime: "2h 6m", rating: "PG-13" },
  { id: "dune-part-two", title: "Dune: Part Two", year: 2024, runtime: "2h 46m", rating: "PG-13" },
  { id: "kingdom-planet-apes", title: "Kingdom of the Planet of the Apes", year: 2024, runtime: "2h 25m", rating: "PG-13" },
  { id: "twisters", title: "Twisters", year: 2024, runtime: "2h 2m", rating: "PG-13" },
  { id: "beetlejuice-2", title: "Beetlejuice Beetlejuice", year: 2024, runtime: "1h 44m", rating: "PG-13" },
];

export type TrendingShow = {
  id: string;
  title: string;
  network: string;
  meta: string;
  isNewEpisode?: boolean;
};

export const trendingShows: TrendingShow[] = [
  { id: "power", title: "Power", network: "STARZ", meta: "S6 E10 · Just Now", isNewEpisode: true },
  { id: "the-chi", title: "The Chi", network: "SHOWTIME", meta: "S7 E5 · 20m ago", isNewEpisode: true },
  { id: "all-american", title: "All American", network: "THE CW", meta: "S6 E8 · 45m ago", isNewEpisode: true },
  { id: "bmf", title: "BMF", network: "STARZ", meta: "S3 E6 · 1h ago", isNewEpisode: true },
  { id: "snowfall", title: "Snowfall", network: "FX", meta: "S6 E7 · 1h ago", isNewEpisode: true },
];

export type TopRatedShow = {
  id: string;
  title: string;
  rating: number;
  seasons: number;
};

export const topRatedShows: TopRatedShow[] = [
  { id: "breaking-bad", title: "Breaking Bad", rating: 9.5, seasons: 5 },
  { id: "the-wire", title: "The Wire", rating: 9.4, seasons: 5 },
  { id: "game-of-thrones", title: "Game of Thrones", rating: 9.3, seasons: 8 },
  { id: "sons-of-anarchy", title: "Sons of Anarchy", rating: 9.2, seasons: 7 },
  { id: "the-sopranos", title: "The Sopranos", rating: 9.2, seasons: 6 },
];

export type NewEpisodeItem = {
  id: string;
  title: string;
  season: string;
  episodeTitle?: string;
  date: string;
  timeLeft: string;
  hasPlay?: boolean;
};

export const newEpisodes: NewEpisodeItem[] = [
  { id: "9-1-1", title: "9-1-1", season: "S7 E5", episodeTitle: "Home Invasion", date: "May 8, 2025", timeLeft: "42m left" },
  { id: "the-daily-show", title: "The Daily Show", season: "S29 E85", date: "May 8, 2025", timeLeft: "31m left", hasPlay: true },
  { id: "greys-anatomy", title: "Grey's Anatomy", season: "S21 E16", episodeTitle: "Papa Was a Rollin' Stone", date: "May 8, 2025", timeLeft: "43m left" },
  { id: "atlanta", title: "Atlanta", season: "S4 E5", episodeTitle: "Work Ethic", date: "May 8, 2025", timeLeft: "29m left", hasPlay: true },
  { id: "law-and-order-svu", title: "Law & Order: SVU", season: "S26 E17", episodeTitle: "Post-Mortem Blues", date: "May 8, 2025", timeLeft: "41m left" },
  { id: "rick-and-morty", title: "Rick and Morty", season: "S7 E8", episodeTitle: "Rise of the Numbericons", date: "May 8, 2025", timeLeft: "22m left", hasPlay: true },
];

export type SavedItem = {
  id: string;
  title: string;
  type: "Movie" | "TV Show";
  year: number;
  meta: string;
  rating: string;
};

export const myListItems: SavedItem[] = [
  { id: "power", title: "Power", type: "TV Show", year: 2014, meta: "6 Seasons", rating: "TV-MA" },
  { id: "john-wick-4", title: "John Wick: Chapter 4", type: "Movie", year: 2023, meta: "2h 49m", rating: "R" },
  { id: "the-chi", title: "The Chi", type: "TV Show", year: 2018, meta: "7 Seasons", rating: "TV-MA" },
  { id: "the-batman", title: "The Batman", type: "Movie", year: 2022, meta: "2h 56m", rating: "PG-13" },
  { id: "breaking-bad", title: "Breaking Bad", type: "TV Show", year: 2008, meta: "5 Seasons", rating: "TV-MA" },
  { id: "bmf", title: "BMF", type: "TV Show", year: 2021, meta: "3 Seasons", rating: "TV-MA" },
  { id: "dune-part-two", title: "Dune: Part Two", type: "Movie", year: 2024, meta: "2h 46m", rating: "PG-13" },
  { id: "snowfall", title: "Snowfall", type: "TV Show", year: 2017, meta: "6 Seasons", rating: "TV-MA" },
];

export const helpCategories = [
  {
    id: "account-billing",
    title: "Account & Billing",
    description: "Manage your subscription, payment methods, and billing history.",
  },
  {
    id: "streaming-playback",
    title: "Streaming & Playback",
    description: "Fix buffering, playback errors, and video quality issues.",
  },
  {
    id: "devices-apps",
    title: "Devices & Apps",
    description: "Set up Novel TV on your phone, smart TV, or streaming device.",
  },
  {
    id: "plans",
    title: "Subscription Plans",
    description: "Compare plans, upgrade, downgrade, or cancel anytime.",
  },
];

export const faqItems = [
  {
    question: "How do I start watching Novel TV?",
    answer:
      "Create an account, choose a subscription plan, and start streaming instantly on the web, or download our iOS/Android app.",
  },
  {
    question: "Can I watch on multiple devices?",
    answer:
      "Yes. Your plan determines how many screens can stream at once — check your Subscription page for your current limit.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "Go to Dashboard → Subscription → Cancel Plan. You'll keep access until the end of your current billing period.",
  },
  {
    question: "Does Novel TV support offline downloads?",
    answer:
      "Select movies and shows can be downloaded for offline viewing from within the mobile app.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit/debit cards through Stripe, and PayPal.",
  },
];

export const footerLinks = {
  browse: [
    { label: "Movies", href: "/movies" },
    { label: "TV Shows", href: "/tv-shows" },
    { label: "Live TV", href: "/live-tv" },
    { label: "Originals", href: "/originals" },
  ],
  help: [
    { label: "About", href: "/about" },
    { label: "Help Center", href: "/help-center" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Terms of Use", href: "/terms-of-use" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
  account: [
    { label: "My List", href: "/my-list" },
    { label: "Sign In", href: "/login" },
    { label: "Create Account", href: "/register" },
  ],
};

import type { Metadata } from "next";
import { Bebas_Neue, Roboto_Condensed, Roboto, Permanent_Marker } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmailVerificationBanner } from "@/components/layout/EmailVerificationBanner";
import { MaintenanceBanner } from "@/components/layout/MaintenanceBanner";
import { AuthProvider } from "@/lib/auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { fetchSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const fontHeading = Bebas_Neue({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const fontUi = Roboto_Condensed({
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const fontBody = Roboto({
  variable: "--font-body",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const fontAccent = Permanent_Marker({
  variable: "--font-accent",
  weight: "400",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const favicon = settings.favicon_url ?? "/favicon.png";

  return {
    title: "Novel TV — Stream Different. No Limits.",
    description:
      "Movies. TV shows. Live TV. Originals. No limits. Just nonstop entertainment.",
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    // WordPress-style "discourage search engines" — it's a signal, not an
    // enforced block, so a determined crawler can still ignore it.
    robots: settings.discourage_search_engines
      ? { index: false, follow: false }
      : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const siteSettings = await fetchSiteSettings();

  return (
    <html
      lang="en"
      className={`${fontHeading.variable} ${fontUi.variable} ${fontBody.variable} ${fontAccent.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary font-body">
        <AuthProvider>
          <FavoritesProvider>
            <NotificationsProvider>
              <MaintenanceBanner
                text={siteSettings.maintenance_banner_text}
                isVisible={siteSettings.maintenance_banner_is_visible}
              />
              <Header logoUrl={siteSettings.logo_url} />
              <EmailVerificationBanner />
              <main className="flex-1">{children}</main>
              <Footer siteSettings={siteSettings} />
            </NotificationsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

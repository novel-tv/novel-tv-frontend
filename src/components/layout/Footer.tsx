import Link from "next/link";
import Image from "next/image";
import { footerLinks } from "@/lib/demo-data";
import {
  DEFAULT_SITE_SETTINGS,
  resolveFooterText,
  type SiteSettings,
} from "@/lib/site-settings";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="font-ui text-sm font-bold uppercase tracking-wide text-text-primary">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-body text-sm text-text-secondary transition-colors duration-150 hover:text-accent"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ siteSettings }: { siteSettings?: SiteSettings }) {
  const settings = siteSettings ?? DEFAULT_SITE_SETTINGS;

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-360 px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:items-start lg:gap-x-10">
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <Image
                src={settings.logo_url ?? "/images/novel-tv-logo.png"}
                alt="Novel TV"
                width={500}
                height={228}
                className="h-14 w-auto sm:h-16"
              />
            </Link>
            <p className="mt-3 max-w-55 font-body text-sm text-text-secondary">
              {settings.tagline ?? DEFAULT_SITE_SETTINGS.tagline}
            </p>
          </div>

          <FooterColumn title="Browse" links={footerLinks.browse} />
          <FooterColumn title="Help" links={footerLinks.help} />
          <FooterColumn title="Account" links={footerLinks.account} />
        </div>

        <p className="mt-10 text-center font-body text-xs text-text-muted">
          {resolveFooterText(settings.footer_text)}
        </p>
        <p className="mt-2 text-center font-body text-xs text-text-muted">
          Designed by{" "}
          <a
            href="https://taskhubrecruitmentsolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary transition-colors duration-150 hover:text-accent"
          >
            TASKHUB
          </a>{" "}
          and Developed by{" "}
          <a
            href="https://algomatryx.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary transition-colors duration-150 hover:text-accent"
          >
            AlgoMatryx
          </a>
        </p>
      </div>
    </footer>
  );
}

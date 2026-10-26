"use client";

import { useState } from "react";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";
import { ApiError } from "@/lib/api";
import { submitContactForm } from "@/lib/contact";
import { useIntegrationSettings } from "@/lib/use-integration-settings";
import { isRecaptchaV2Required, useRecaptcha } from "@/lib/use-recaptcha";
import { RecaptchaV2Challenge } from "@/components/RecaptchaV2Challenge";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    detail: "support@noveltv.com",
    subtext: "We usually reply within 24 hours.",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    detail: "Chat with our team",
    subtext: "Available 9am – 9pm, 7 days a week.",
  },
  {
    icon: Phone,
    title: "Phone Support",
    detail: "1-800-555-0199",
    subtext: "Mon – Fri, 9am – 6pm EST.",
  },
  {
    icon: Clock,
    title: "Response Time",
    detail: "Under 24 hours",
    subtext: "For most account and billing questions.",
  },
];

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const integrationSettings = useIntegrationSettings();
  const recaptcha = useRecaptcha(integrationSettings, "contact");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const fields = { name, email, subject, message };

    try {
      try {
        await submitContactForm({ ...fields, ...(await recaptcha.getV3Fields()) });
      } catch (err) {
        if (!isRecaptchaV2Required(err)) throw err;
        await submitContactForm({ ...fields, ...(await recaptcha.waitForV2()) });
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-360 px-4 py-16 sm:px-6 lg:px-10">
      <div className="text-center">
        <h1 className="font-heading text-5xl uppercase text-text-primary sm:text-6xl">
          Contact Us
        </h1>
        <p className="mx-auto mt-2 max-w-md font-body text-text-secondary">
          Questions, feedback, or need a hand? We&apos;d love to hear from
          you.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5">
        {submitted ? (
          <div className="space-y-4 rounded-xl border border-border bg-surface p-6 sm:p-8 lg:col-span-3">
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 font-body text-sm text-success">
              Thanks for reaching out — we&apos;ll get back to you soon.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setName("");
                setEmail("");
                setSubject("");
                setMessage("");
              }}
              className="rounded-md border border-text-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary transition-colors duration-150 hover:border-primary hover:bg-primary"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-border bg-surface p-6 sm:p-8 lg:col-span-3"
          >
            {error && (
              <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-body text-sm text-error">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-ui text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-md border border-border bg-surface-light px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-ui text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-surface-light px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-ui text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                className="w-full rounded-md border border-border bg-surface-light px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-ui text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us more…"
                className="w-full resize-none rounded-md border border-border bg-surface-light px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {recaptcha.needsV2 && recaptcha.v2SiteKey && (
              <RecaptchaV2Challenge siteKey={recaptcha.v2SiteKey} onVerify={recaptcha.handleV2Verified} />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-6 py-3 font-ui text-sm font-bold uppercase tracking-wide text-text-primary shadow-primary transition-colors duration-150 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
          {contactMethods.map(({ icon: Icon, title, detail, subtext }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <Icon size={22} className="text-primary" />
              <p className="mt-3 font-ui text-sm font-semibold text-text-primary">
                {title}
              </p>
              <p className="mt-1 font-body text-sm text-text-secondary">
                {detail}
              </p>
              <p className="mt-1 font-body text-xs text-text-muted">
                {subtext}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

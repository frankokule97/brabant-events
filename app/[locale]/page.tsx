import Link from "next/link";
import { fetchAppEvents } from "@/lib/api/fetchEvents";
import type { AppEventPreview } from "@/types/appEvents";
import { formatTicketmasterDateTime } from "@/lib/ticketmaster/formatTicketmasterDateTime";
import { messages, type Locale } from "@/i18n/messages";
import { notFound } from "next/navigation";
import { Github, Linkedin } from "lucide-react";

function formatEventDateTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const intlLocale = locale === "nl" ? "nl-NL" : "en-NL";

  return new Intl.DateTimeFormat(intlLocale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function addMonthsDate(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "nl" || rawLocale === "en" ? rawLocale : notFound();

  const t = messages[locale];

  const nowIso = formatTicketmasterDateTime(new Date());
  const endIso = formatTicketmasterDateTime(addMonthsDate(3));

  const { events } = await fetchAppEvents({
    page: 0,
    startDateTime: nowIso,
    endDateTime: endIso,
  });

  const upcoming = events.slice(0, 6);

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8 text-white">
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(900px_circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_0%,rgba(255,255,255,0.12),transparent_50%)]" />

        <div className="relative space-y-5">
          <div className="max-w-4xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.home.heroTitle}
            </h1>

            <p className="text-white/80">{t.home.heroSubtitle}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/${locale}/events`}
                className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {t.home.ctaAll}
              </Link>

              <Link
                href={`/${locale}/events?when=weekend`}
                className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {t.home.ctaWeekend}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="text-sm font-semibold">{t.home.benefitsTitle1}</div>
              <div className="mt-1 text-sm text-white/75">{t.home.benefitsBody1}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="text-sm font-semibold">{t.home.benefitsTitle2}</div>
              <div className="mt-1 text-sm text-white/75">{t.home.benefitsBody2}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="text-sm font-semibold">{t.home.benefitsTitle3}</div>
              <div className="mt-1 text-sm text-white/75">{t.home.benefitsBody3}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="text-sm font-semibold">{t.home.benefitsTitle4}</div>
              <div className="mt-1 text-sm text-white/75">{t.home.benefitsBody4}</div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t.home.upcomingTitle}</h2>
            <p className="mt-1 text-sm text-white/70">{t.home.upcomingSubtitle}</p>
          </div>

          <div className="pt-2">
            <Link
              href={`/${locale}/events`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              <span>{t.home.viewAll}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70">{t.home.noEvents}</p>
            <div className="mt-4">
              <Link
                href={`/${locale}/events`}
                className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                {t.home.ctaAll}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event: AppEventPreview) => {
              const meta = [event.city, event.venueName].filter(Boolean).join(" • ");

              return (
                <Link
                  key={event.id}
                  href={`/${locale}/events/${event.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
                >
                  <div className="aspect-[16/9] w-full bg-white/5">
                    {event.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : null}
                  </div>

                  <div className="space-y-2 p-4">
                    <div className="text-xs text-white/60">
                      {formatEventDateTime(event.startDateTime, locale)}
                    </div>

                    <h3 className="line-clamp-2 text-base font-semibold leading-snug">
                      {event.title}
                    </h3>

                    <p className="line-clamp-1 text-sm text-white/70">
                      {meta || t.home.openDetails}
                    </p>

                    {event.category ? (
                      <div className="pt-1">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                          {event.category}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t.home.quickTitle}</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">{t.home.quickCardTitle1}</div>
            <p className="mt-1 text-sm text-white/70">{t.home.quickCardBody1}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">{t.home.quickCardTitle2}</div>
            <p className="mt-1 text-sm text-white/70">{t.home.quickCardBody2}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">{t.home.quickCardTitle3}</div>
            <p className="mt-1 text-sm text-white/70">{t.home.quickCardBody3}</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col items-start justify-between gap-3  border-t border-white/10 pt-8 sm:flex-row sm:items-center">
        <div className="text-sm text-white/60">{t.home.footerTagline}</div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/frankokule97/brabant-events"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white hover:underline"
            aria-label="GitHub"
            title="GitHub"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">GitHub</span>
          </a>

          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white hover:underline"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">LinkedIn</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

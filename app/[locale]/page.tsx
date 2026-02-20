import Link from "next/link";
import { fetchAppEvents } from "@/lib/api/fetchEvents";
import type { AppEventPreview } from "@/types/appEvents";
import { formatTicketmasterDateTime } from "@/lib/ticketmaster/formatTicketmasterDateTime";
import { messages, type Locale } from "@/i18n/messages";
import { notFound } from "next/navigation";

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

        <div className="relative max-w-2xl space-y-5">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t.home.heroTitle}</h1>

          <p className="text-white/80">{t.home.heroSubtitle}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/${locale}/events`}
              className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90"
            >
              {t.home.ctaAll}
            </Link>

            <Link
              href={`/${locale}/events?when=weekend`}
              className="inline-flex items-center rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              {t.home.ctaWeekend}
            </Link>
          </div>

          <div className="grid gap-3 pt-6 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="text-sm font-semibold">{t.home.benefitsTitle1}</div>
              <div className="mt-1 text-sm text-white/75">{t.home.benefitsBody1}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="text-sm font-semibold">{t.home.benefitsTitle2}</div>
              <div className="mt-1 text-sm text-white/75">{t.home.benefitsBody2}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="text-sm font-semibold">{t.home.benefitsTitle3}</div>
              <div className="mt-1 text-sm text-white/75">{t.home.benefitsBody3}</div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t.home.upcomingTitle}</h2>
            <p className="mt-1 text-sm text-gray-600">{t.home.upcomingSubtitle}</p>
          </div>

          <Link href={`/${locale}/events`} className="text-sm font-medium hover:underline">
            {t.home.viewAll}
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border p-6">
            <p className="text-sm text-gray-600">{t.home.noEvents}</p>
            <div className="mt-4">
              <Link
                href={`/${locale}/events`}
                className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
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
                  className="group overflow-hidden rounded-2xl border bg-white hover:shadow-sm"
                >
                  <div className="aspect-[16/9] w-full bg-gray-100">
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
                    <div className="text-xs text-gray-600">
                      {formatEventDateTime(event.startDateTime, locale)}
                    </div>

                    <h3 className="line-clamp-2 text-base font-semibold leading-snug">
                      {event.title}
                    </h3>

                    <p className="line-clamp-1 text-sm text-gray-600">
                      {meta || t.home.openDetails}
                    </p>

                    {event.category ? (
                      <div className="pt-1">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
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

      {/* SIMPLE BENEFITS (NOT “HOW IT WORKS”) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t.home.quickTitle}</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border p-5">
            <div className="text-sm font-semibold">{t.home.quickCardTitle1}</div>
            <p className="mt-1 text-sm text-gray-600">{t.home.quickCardBody1}</p>
          </div>

          <div className="rounded-2xl border p-5">
            <div className="text-sm font-semibold">{t.home.quickCardTitle2}</div>
            <p className="mt-1 text-sm text-gray-600">{t.home.quickCardBody2}</p>
          </div>

          <div className="rounded-2xl border p-5">
            <div className="text-sm font-semibold">{t.home.quickCardTitle3}</div>
            <p className="mt-1 text-sm text-gray-600">{t.home.quickCardBody3}</p>
          </div>
        </div>
      </section>

      {/* FOOTER LINKS (SUBTLE) */}
      <footer className="flex flex-col items-start justify-between gap-3 border-t pt-8 sm:flex-row sm:items-center">
        <div className="text-sm text-gray-600">{t.home.footerTagline}</div>

        <div className="flex gap-4 text-sm">
          <a
            href="https://github.com/frankokule97/brabant-events"
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}

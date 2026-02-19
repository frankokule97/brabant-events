import { toJsonLdScript } from "@/lib/jsonLd";
import Link from "next/link";
import { fetchAppEvents } from "@/lib/api/fetchEvents";
import { Metadata } from "next";
import type { ReactNode } from "react";
import { EventsExplorerClient } from "@/components/EventsExplorerClient";
import { messages, type Locale } from "@/i18n/messages";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse events in North Brabant. Filter by today, this weekend, or this month, and save favorites.",
};

const WHEN_FILTERS = ["today", "weekend", "month"] as const;
type WhenFilter = (typeof WHEN_FILTERS)[number];

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ when?: string; fav?: string; q?: string; cat?: string; p?: string }>;
}) {
  const { locale } = await params;
  const t = messages[locale] ?? messages.en;
  const sp = await searchParams;
  const rawWhen = sp?.when;
  const when: WhenFilter | "" =
    rawWhen && WHEN_FILTERS.includes(rawWhen as WhenFilter) ? (rawWhen as WhenFilter) : "";
  const favoritesOnly = sp?.fav === "1";
  const rawP = sp?.p;
  const pageNumber = rawP ? Number.parseInt(rawP, 10) : 1;
  const safePageNumber = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  function buildPageHref(targetPage: number): string {
    const params = new URLSearchParams();

    if (when) params.set("when", when);
    if (favoritesOnly) params.set("fav", "1");

    if (sp?.q) params.set("q", sp.q);
    if (sp?.cat) params.set("cat", sp.cat);

    // 1-based page param
    if (targetPage > 1) params.set("p", String(targetPage));

    const qs = params.toString();
    return qs ? withLocale(`/events?${qs}`) : withLocale("/events");
  }

  function withLocale(path: string): string {
    return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
  }

  // showing 1 as a first page inside URL
  const pageIndex = safePageNumber - 1;

  const now = new Date();

  function toTmIso(dt: Date): string {
    return dt.toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  function addMonths(base: Date, months: number): Date {
    const d = new Date(base);
    d.setUTCMonth(d.getUTCMonth() + months);
    return d;
  }

  function endOfDayUtc(base: Date): Date {
    const d = new Date(base);
    d.setUTCHours(23, 59, 59, 0);
    return d;
  }

  function startOfTodayUtc(base: Date): Date {
    const d = new Date(base);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  function startOfWeekendUtc(base: Date): Date {
    const d = startOfTodayUtc(base);
    const day = d.getUTCDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    d.setUTCDate(d.getUTCDate() + daysUntilSaturday);
    return d;
  }

  function endOfWeekendUtc(base: Date): Date {
    const start = startOfWeekendUtc(base);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1); // Sunday
    return endOfDayUtc(end);
  }

  function startOfMonthUtc(base: Date): Date {
    const d = new Date(base);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  function endOfMonthUtc(base: Date): Date {
    const d = new Date(base);
    d.setUTCMonth(d.getUTCMonth() + 1, 0);
    return endOfDayUtc(d);
  }

  const startDateTime = toTmIso(now);
  const defaultEndDateTime = toTmIso(addMonths(now, 12));

  let apiStartDateTime: string | undefined = startDateTime;
  let apiEndDateTime: string | undefined = defaultEndDateTime;

  if (when === "today") {
    apiStartDateTime = toTmIso(startOfTodayUtc(now));
    apiEndDateTime = toTmIso(endOfDayUtc(now));
  }

  if (when === "weekend") {
    apiStartDateTime = toTmIso(startOfWeekendUtc(now));
    apiEndDateTime = toTmIso(endOfWeekendUtc(now));
  }

  if (when === "month") {
    apiStartDateTime = toTmIso(startOfMonthUtc(now));
    apiEndDateTime = toTmIso(endOfMonthUtc(now));
  }

  const { events, page } = await fetchAppEvents({
    page: pageIndex,
    startDateTime: apiStartDateTime,
    endDateTime: apiEndDateTime,
  });

  const totalPages = page.totalPages;
  const currentPage = safePageNumber; // 1-based

  function getVisiblePages(): Array<number | "ellipsis"> {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);

    for (let p = currentPage - 2; p <= currentPage + 2; p++) {
      if (p >= 1 && p <= totalPages) pages.add(p);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);

    const result: Array<number | "ellipsis"> = [];
    for (let i = 0; i < sorted.length; i++) {
      const val = sorted[i];
      const prev = sorted[i - 1];
      if (prev && val - prev > 1) result.push("ellipsis");
      result.push(val);
    }
    return result;
  }

  const isEmptyForDateFilter = !favoritesOnly && events.length === 0;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://brabant-events.vercel.app";

  const listJsonLd = favoritesOnly
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: events.map((event, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${baseUrl}/${locale}/events/${event.id}`,
          name: event.title || "Event",
        })),
      };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {listJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(listJsonLd) }}
        />
      ) : null}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Events</h1>
        <p className="mt-2 text-sm text-gray-600">Discover events in North Brabant.</p>

        <nav className="mt-4 flex flex-wrap gap-2">
          <FilterButton href={withLocale("/events")} active={!when}>
            All
          </FilterButton>
          <FilterButton href={withLocale("/events?when=today")} active={when === "today"}>
            Today
          </FilterButton>
          <FilterButton href={withLocale("/events?when=weekend")} active={when === "weekend"}>
            This weekend
          </FilterButton>
          <FilterButton href={withLocale("/events?when=month")} active={when === "month"}>
            This month
          </FilterButton>
          <FilterButton
            href={withLocale(`/events${when ? `?when=${when}&fav=1` : "?fav=1"}`)}
            active={favoritesOnly}
          >
            Favorites
          </FilterButton>
        </nav>
      </header>
      {isEmptyForDateFilter ? (
        <EmptyStateServer when={when} locale={locale} />
      ) : (
        <EventsExplorerClient events={events} favoritesOnly={favoritesOnly} labels={t.filters} />
      )}
      {page.totalPages > 1 ? (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          <Link
            href={buildPageHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={[
              "rounded-lg border px-3 py-2 text-sm",
              currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-100",
            ].join(" ")}
          >
            Prev
          </Link>

          {getVisiblePages().map((item, idx) =>
            item === "ellipsis" ? (
              <span key={`e-${idx}`} className="px-2 text-sm text-gray-500">
                …
              </span>
            ) : (
              <Link
                key={item}
                href={buildPageHref(item)}
                className={[
                  "rounded-lg border px-3 py-2 text-sm",
                  item === currentPage ? "bg-gray-900 text-white" : "hover:bg-gray-100",
                ].join(" ")}
              >
                {item}
              </Link>
            ),
          )}

          <Link
            href={buildPageHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={[
              "rounded-lg border px-3 py-2 text-sm",
              currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-100",
            ].join(" ")}
          >
            Next
          </Link>
        </nav>
      ) : null}
    </main>
  );
}

function FilterButton({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full border px-3 py-1 text-sm",
        active ? "bg-gray-900 text-white" : "bg-white text-gray-900",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function EmptyStateServer({ when, locale }: { when: WhenFilter | ""; locale: Locale }) {
  const label =
    when === "today"
      ? "today"
      : when === "weekend"
        ? "this weekend"
        : when === "month"
          ? "this month"
          : "";

  return (
    <section className="rounded-xl border p-6">
      <h2 className="text-lg font-semibold">No events found</h2>
      <p className="mt-2 text-sm text-gray-600">
        {label
          ? `There are no events scheduled ${label}.`
          : `There are no events to show right now.`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/events`}
          className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
        >
          Reset filters
        </Link>
      </div>
    </section>
  );
}

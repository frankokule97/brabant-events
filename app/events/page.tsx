import { toJsonLdScript } from "@/lib/jsonLd";
import Link from "next/link";
import { fetchAppEvents } from "@/lib/api/fetchEvents";
import { isToday, isThisMonth, isThisWeekend } from "@/lib/eventDateFilters";
import { EventsListClient } from "@/components/EventsListClient";
import { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse events in North Brabant. Filter by today, this weekend, or this month, and save favorites.",
};

const WHEN_FILTERS = ["today", "weekend", "month"] as const;
type WhenFilter = (typeof WHEN_FILTERS)[number];

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ when?: string; fav?: string }>;
}) {
  const sp = await searchParams;
  const rawWhen = sp?.when;
  const when: WhenFilter | "" =
    rawWhen && WHEN_FILTERS.includes(rawWhen as WhenFilter) ? (rawWhen as WhenFilter) : "";
  const favoritesOnly = sp?.fav === "1";

  const { events } = await fetchAppEvents();

  const filteredEvents = events.filter((event) => {
    if (!when) return true;
    if (when === "today") return isToday(event);
    if (when === "weekend") return isThisWeekend(event);
    if (when === "month") return isThisMonth(event);
    return true;
  });

  const isEmptyForDateFilter = !favoritesOnly && filteredEvents.length === 0;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://brabant-events.vercel.app";

  const listJsonLd = favoritesOnly
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: filteredEvents.map((event, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${baseUrl}/events/${event.slug}`,
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
          <FilterButton href="/events" active={!when}>
            All
          </FilterButton>
          <FilterButton href="/events?when=today" active={when === "today"}>
            Today
          </FilterButton>
          <FilterButton href="/events?when=weekend" active={when === "weekend"}>
            This weekend
          </FilterButton>
          <FilterButton href="/events?when=month" active={when === "month"}>
            This month
          </FilterButton>
          <FilterButton
            href={`/events${when ? `?when=${when}&fav=1` : "?fav=1"}`}
            active={favoritesOnly}
          >
            Favorites
          </FilterButton>
        </nav>
      </header>
      {isEmptyForDateFilter ? (
        <EmptyStateServer when={when} />
      ) : (
        <EventsListClient events={filteredEvents} favoritesOnly={favoritesOnly} />
      )}
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

function EmptyStateServer({ when }: { when: WhenFilter | "" }) {
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
          href="/events"
          className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
        >
          Reset filters
        </Link>
      </div>
    </section>
  );
}

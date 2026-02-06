"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types/event";
import { getFavoriteIds } from "@/lib/favorites";
import { FavoriteButton } from "@/components/FavoriteButton";

export function EventsListClient({
  events,
  favoritesOnly,
}: {
  events: Event[];
  favoritesOnly: boolean;
}) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    const refresh = () => {
      setFavoriteIds(getFavoriteIds());
    };

    refresh();

    window.addEventListener("brabant:favorites-changed", refresh);
    window.addEventListener("storage", refresh); // multi-tab support

    return () => {
      window.removeEventListener("brabant:favorites-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const visibleEvents = useMemo(() => {
    if (!favoritesOnly) return events;
    if (!favoriteIds) return [];
    return events.filter((e) => favoriteIds.has(e.id));
  }, [events, favoritesOnly, favoriteIds]);

  if (favoritesOnly && favoriteIds === null) {
    return <div className="rounded-xl border p-6 text-sm text-gray-700">Loading favorites…</div>;
  }

  // 1. Case --> if user opens favorites, but has no favorites selected yet
  if (favoritesOnly && favoriteIds && favoriteIds.size === 0) {
    return (
      <div className="rounded-xl border p-6 text-sm text-gray-700">
        <div className="text-base font-semibold text-gray-900">No favorites yet</div>
        <p className="mt-2">Click the star on an event to add it to favorites.</p>

        <div className="mt-4">
          <Link
            href="/events"
            className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Show all events
          </Link>
        </div>
      </div>
    );
  }

  // 2. Case --> if user has selected favorites, but they don't match the "when" filter
  if (visibleEvents.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-sm text-gray-700">
        <div className="text-base font-semibold text-gray-900">Nothing to show</div>
        <p className="mt-2">
          {favoritesOnly
            ? "None of your favorited events match the current filter."
            : "No events match the current filter."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/events"
            className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Reset filters
          </Link>

          {favoritesOnly ? (
            <Link
              href="/events?fav=1"
              className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
            >
              Show all favorites
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleEvents.map((event) => (
        <article key={event.id} className="rounded-xl border p-4 shadow-sm">
          <div className="text-xs text-gray-600">
            {event.location.city} •{" "}
            {new Date(event.startDateTime).toLocaleString("en-NL", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <Link
              href={`/events/${event.slug}`}
              className="hover:underline"
              title="View event details"
            >
              {event.title.en ?? event.title.nl ?? "Untitled event"}
            </Link>

            <div className="flex items-center gap-2">
              <FavoriteButton eventId={event.id} />

              <a
                href={`/api/calendar?slug=${event.slug}`}
                className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100"
                title="Add to calendar"
              >
                📅
              </a>
            </div>
          </div>

          {event.description?.en || event.description?.nl ? (
            <p className="mt-2 line-clamp-3 text-sm text-gray-700">
              {event.description?.en ?? event.description?.nl}
            </p>
          ) : null}

          <div className="mt-3 text-xs text-gray-600">Category: {event.category}</div>
        </article>
      ))}
    </section>
  );
}

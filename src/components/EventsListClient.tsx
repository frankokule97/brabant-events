"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AppEventPreview } from "@/types/appEvents";
import { getFavoriteIds } from "@/lib/favorites";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useParams } from "next/navigation";
import { messages } from "@/i18n/messages";

type Props = {
  events: AppEventPreview[];
  favoritesOnly: boolean;
};

export function EventsListClient({ events, favoritesOnly }: Props) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string> | null>(null);

  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "nl" ? "nl" : "en";
  const t = messages[locale] ?? messages.en;
  const dateLocale = locale === "nl" ? "nl-NL" : "en-GB";

  function withLocale(path: string): string {
    return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
  }

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
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        {t.eventsList.loadingFavorites}
      </div>
    );
  }

  // 1. Case --> if user opens favorites, but has no favorites selected yet
  if (favoritesOnly && favoriteIds && favoriteIds.size === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        <div className="text-base font-semibold text-gray-900">{t.eventsList.noFavoritesTitle}</div>
        <p className="mt-2">{t.eventsList.noFavoritesBody}</p>

        <div className="mt-4">
          <Link
            href={withLocale("/events")}
            className="inline-flex rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            {t.eventsList.showAllEvents}
          </Link>
        </div>
      </div>
    );
  }

  // 2. Case --> if user has selected favorites, but they don't match the "when" filter
  if (visibleEvents.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        <div className="text-base font-semibold text-white/90">
          {t.eventsList.nothingToShowTitle}
        </div>
        <p className="mt-2">
          {favoritesOnly ? t.eventsList.noFavoritesMatchFilter : t.eventsList.noEventsMatchFilter}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={withLocale("/events")}
            className="inline-flex rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            {t.eventsList.resetFilters}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleEvents.map((event) => (
        <article
          key={event.id}
          className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm transition-colors hover:bg-white/10"
        >
          <div className="text-xs text-white/60">
            {[event.city, event.venueName].filter(Boolean).join(" • ")}{" "}
            {event.startDateTime
              ? `• ${new Date(event.startDateTime).toLocaleString(dateLocale, { dateStyle: "medium", timeStyle: "short" })}`
              : null}
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <Link
              href={withLocale(`/events/${event.id}`)}
              className="text-base font-semibold text-white/90 hover:underline"
              title={t.eventsList.viewDetailsTitle}
            >
              {event.title}
            </Link>

            <div className="flex items-center gap-2">
              <FavoriteButton eventId={event.id} />

              <a
                href={`/api/calendar?id=${event.id}`}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/90 hover:bg-white/10"
                title={t.eventsList.addToCalendarTitle}
                aria-label={t.eventsList.addToCalendarTitle}
              >
                📅
              </a>
            </div>
          </div>

          {event.shortDescription ? (
            <p className="mt-2 line-clamp-3 text-sm text-white/60">{event.shortDescription}</p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

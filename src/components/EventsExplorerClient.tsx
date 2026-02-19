"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import type { AppEventPreview } from "@/types/appEvents";
import { EventsListClient } from "@/components/EventsListClient";

type Props = {
  events: AppEventPreview[];
  favoritesOnly: boolean;
  labels: Labels;
};

type Labels = {
  searchLabel: string;
  searchPlaceholder: string;
  categoryLabel: string;
  allCategories: string;
  clearFilters: string;
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function eventSearchHaystack(e: AppEventPreview): string {
  return [e.title, e.city, e.venueName, e.shortDescription].filter(Boolean).join(" ").toLowerCase();
}

export function EventsExplorerClient({ events, favoritesOnly, labels }: Props) {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "nl" ? "nl" : "en";

  const router = useRouter();
  const sp = useSearchParams();

  const searchQuery = sp.get("q") ?? "";
  const selectedCategory = sp.get("cat") ?? "";

  const availableCategories = useMemo(() => {
    const searchText = normalize(searchQuery);

    const searchFiltered = !searchText
      ? events
      : events.filter((e) => eventSearchHaystack(e).includes(searchText));

    const values = searchFiltered
      .map((e) => e.category?.trim())
      .filter((v): v is string => Boolean(v));

    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [events, searchQuery]);

  const filteredEvents = useMemo(() => {
    const searchText = normalize(searchQuery);
    const categoryText = normalize(selectedCategory);

    return events.filter((e) => {
      if (categoryText && normalize(e.category ?? "") !== categoryText) return false;
      if (!searchText) return true;
      return eventSearchHaystack(e).includes(searchText);
    });
  }, [events, searchQuery, selectedCategory]);

  const replaceSearchParams = useCallback(
    (mutator: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(sp.toString());
      mutator(next);

      const qs = next.toString();
      router.replace(qs ? `/${locale}/events?${qs}` : `/${locale}/events`);
    },
    [router, sp, locale],
  );

  const updateUrlParam = useCallback(
    (key: "q" | "cat", value: string) => {
      replaceSearchParams((next) => {
        const v = value.trim();
        if (v) next.set(key, v);
        else next.delete(key);

        next.delete("p"); // resetting pagination when filters change
      });
    },
    [replaceSearchParams],
  );

  useEffect(() => {
    if (!selectedCategory) return;
    const normalizedSelected = normalize(selectedCategory);

    const stillValid = availableCategories.some((c) => normalize(c) === normalizedSelected);
    if (!stillValid) {
      replaceSearchParams((next) => {
        next.delete("cat");
        next.delete("p");
      });
    }
  }, [selectedCategory, availableCategories, replaceSearchParams]);

  const clearFilters = useCallback(() => {
    replaceSearchParams((next) => {
      next.delete("q");
      next.delete("cat");
      next.delete("p");
    });
  }, [replaceSearchParams]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900">{labels.searchLabel}</label>
            <input
              value={searchQuery}
              onChange={(e) => updateUrlParam("q", e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-900">
              {labels.categoryLabel}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => updateUrlParam("cat", e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">{labels.allCategories}</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery.trim() || selectedCategory.trim()) && (
          <div className="mt-3">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              {labels.clearFilters}
            </button>
          </div>
        )}
      </div>

      <EventsListClient events={filteredEvents} favoritesOnly={favoritesOnly} />
    </div>
  );
}

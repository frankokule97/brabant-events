"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AppEventPreview } from "@/types/appEvents";
import { EventsListClient } from "@/components/EventsListClient";

type Props = {
  events: AppEventPreview[];
  favoritesOnly: boolean;
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function eventSearchHaystack(e: AppEventPreview): string {
  return [e.title, e.city, e.venueName, e.shortDescription].filter(Boolean).join(" ").toLowerCase();
}

export function EventsExplorerClient({ events, favoritesOnly }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const searchQuery = sp.get("q") ?? "";
  const selectedCategory = sp.get("cat") ?? "";

  const availableCategories = useMemo(() => {
    const values = events.map((e) => e.category?.trim()).filter((v): v is string => Boolean(v));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filteredEvents = useMemo(() => {
    const searchText = normalize(searchQuery);
    const categoryText = normalize(selectedCategory);

    return events.filter((e) => {
      if (categoryText && normalize(e.category ?? "") !== categoryText) return false;
      if (!searchText) return true;
      return eventSearchHaystack(e).includes(searchText);
    });
  }, [events, searchQuery, selectedCategory]);

  function updateUrlParam(key: "q" | "cat", value: string) {
    const next = new URLSearchParams(sp.toString());

    if (value.trim()) next.set(key, value.trim());
    else next.delete(key);

    const qs = next.toString();
    router.replace(qs ? `/events?${qs}` : "/events");
  }

  function clearFilters() {
    const nextSearchParams = new URLSearchParams(sp.toString());
    nextSearchParams.delete("q");
    nextSearchParams.delete("cat");

    const nextQueryString = nextSearchParams.toString();
    router.replace(nextQueryString ? `/events?${nextQueryString}` : "/events");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900">Search</label>
            <input
              value={searchQuery}
              onChange={(e) => updateUrlParam("q", e.target.value)}
              placeholder="Search by title, city, venue..."
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-900">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => updateUrlParam("cat", e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
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
              Clear filters
            </button>
          </div>
        )}
      </div>

      <EventsListClient events={filteredEvents} favoritesOnly={favoritesOnly} />
    </div>
  );
}

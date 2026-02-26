"use client";

import { useMemo, useEffect, useCallback, useDeferredValue, useState, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import type { AppEventPreview } from "@/types/appEvents";
import { EventsListClient } from "@/components/EventsListClient";
import { ChevronDown, Info } from "lucide-react";

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
  noResultsGeneric: string;
  noResultsWithFilters: string;
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function translateCategoryLabel(category: string, locale: "en" | "nl"): string {
  const raw = category.trim();
  if (!raw) return raw;

  const nlMap: Record<string, string> = {
    Music: "Muziek",
    Sports: "Sport",
    "Arts & Theatre": "Kunst & Theater",
    Film: "Film",
    Miscellaneous: "Overig",
    Undefined: "Overig",
  };

  if (locale === "nl") {
    return nlMap[raw] ?? raw;
  }

  return raw;
}

function eventSearchHaystack(e: AppEventPreview): string {
  return [e.title, e.city, e.venueName, e.shortDescription].filter(Boolean).join(" ").toLowerCase();
}

export function EventsExplorerClient({ events, favoritesOnly, labels }: Props) {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "nl" ? "nl" : "en";

  const router = useRouter();
  const sp = useSearchParams();

  const urlSearchQuery = sp.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const debounceRef = useRef<number | null>(null);
  const selectedCategory = sp.get("cat") ?? "";

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const isFocused = inputRef.current && document.activeElement === inputRef.current;
    if (isFocused) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const eventIndex = useMemo(() => {
    return events.map((e) => ({
      event: e,
      haystack: eventSearchHaystack(e),
      categoryNorm: normalize(e.category ?? ""),
    }));
  }, [events]);

  const availableCategories = useMemo(() => {
    const searchText = normalize(deferredSearchQuery);

    const searchFiltered = !searchText
      ? eventIndex
      : eventIndex.filter((x) => x.haystack.includes(searchText));

    const values = searchFiltered
      .map((x) => x.event.category?.trim())
      .filter((v): v is string => Boolean(v));

    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [eventIndex, deferredSearchQuery]);

  const categoryOptions = useMemo(() => {
    if (!selectedCategory) return availableCategories;
    return availableCategories.includes(selectedCategory)
      ? availableCategories
      : [selectedCategory, ...availableCategories];
  }, [availableCategories, selectedCategory]);

  const filteredEvents = useMemo(() => {
    const searchText = normalize(deferredSearchQuery);
    const categoryText = normalize(selectedCategory);

    return eventIndex
      .filter((x) => {
        if (categoryText && x.categoryNorm !== categoryText) return false;
        if (!searchText) return true;
        return x.haystack.includes(searchText);
      })
      .map((x) => x.event);
  }, [eventIndex, deferredSearchQuery, selectedCategory]);

  const replaceSearchParams = useCallback(
    (mutator: (next: URLSearchParams) => void) => {
      const current =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams(sp.toString());

      mutator(current);

      const qs = current.toString();
      router.replace(qs ? `/${locale}/events?${qs}` : `/${locale}/events`);
    },
    [router, locale, sp],
  );

  const updateUrlParam = useCallback(
    (key: "q" | "cat", value: string) => {
      replaceSearchParams((next) => {
        const v = value.trim();
        if (v) next.set(key, v);
        else next.delete(key);

        next.delete("p");
      });
    },
    [replaceSearchParams],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    replaceSearchParams((next) => {
      next.delete("q");
      next.delete("p");
    });
  }, [replaceSearchParams]);

  const hasSearch = searchQuery.trim().length > 0;
  const hasCategory = selectedCategory.trim().length > 0;
  const searchText = searchQuery.trim();
  const showNoResultsHint = searchText.length >= 3 && filteredEvents.length === 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white/80">{labels.searchLabel}</label>
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => {
                const nextValue = e.target.value;
                setSearchQuery(nextValue);

                if (debounceRef.current) window.clearTimeout(debounceRef.current);

                debounceRef.current = window.setTimeout(() => {
                  updateUrlParam("q", nextValue);
                }, 200);
              }}
              placeholder={labels.searchPlaceholder}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            {showNoResultsHint ? (
              <p className="mt-2 flex items-start gap-2 text-sm font-medium text-white/80">
                <Info className="mt-0.5 h-4 w-4 text-white/60" aria-hidden="true" />
                <span>
                  {hasCategory
                    ? labels.noResultsWithFilters
                    : labels.noResultsGeneric.replace("{{query}}", searchText)}
                </span>
              </p>
            ) : null}
          </div>

          <div className="sm:w-64">
            <label className="block text-sm font-medium text-white/80">
              {labels.categoryLabel}
            </label>
            <div className="relative mt-1">
              <select
                value={selectedCategory}
                onChange={(e) => updateUrlParam("cat", e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="">{labels.allCategories}</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {translateCategoryLabel(c, locale)}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {(hasSearch || hasCategory) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {hasSearch ? (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
              >
                {labels.clearFilters}
              </button>
            ) : null}
          </div>
        )}
      </div>

      <EventsListClient events={filteredEvents} favoritesOnly={favoritesOnly} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { messages } from "@/i18n/messages";
import { isFavorite, notifyFavoritesChanged, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({ eventId }: { eventId: string }) {
  const [fav, setFav] = useState(false);

  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "nl" ? "nl" : "en";
  const t = messages[locale] ?? messages.en;

  useEffect(() => {
    setFav(isFavorite(eventId));
  }, [eventId]);

  function onToggle() {
    const next = toggleFavorite(eventId);
    setFav(next);
    notifyFavoritesChanged();
  }

  const label = fav ? t.eventsList.removeFromFavorites : t.eventsList.addToFavorites;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={fav}
      aria-label={label}
      title={label}
      className={[
        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        fav
          ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/15"
          : "border-white/10 bg-white/5 text-white/90 hover:bg-white/10",
      ].join(" ")}
    >
      {fav ? "★" : "☆"}
    </button>
  );
}

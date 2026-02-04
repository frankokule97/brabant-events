"use client";

import { useEffect, useState } from "react";
import { isFavorite, notifyFavoritesChanged, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({ eventId }: { eventId: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(eventId));
  }, [eventId]);

  function onToggle() {
    const next = toggleFavorite(eventId);
    setFav(next);
    notifyFavoritesChanged();
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border px-3 py-1 text-sm"
      aria-pressed={fav}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      title={fav ? "Remove from favorites" : "Add to favorites"}
    >
      {fav ? "★" : "☆"}
    </button>
  );
}

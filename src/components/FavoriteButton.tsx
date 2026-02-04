"use client";

import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "@/src/lib/favorites";

export function FavoriteButton({ eventId }: { eventId: string }) {
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFav(isFavorite(eventId));
  }, [eventId]);

  function onToggle() {
    const next = toggleFavorite(eventId);
    setFav(next);
  }

  // Avoid hydration mismatch (localStorage only exists in browser)
  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-full border px-3 py-1 text-sm"
        aria-label="Add to favorites"
      >
        ☆
      </button>
    );
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

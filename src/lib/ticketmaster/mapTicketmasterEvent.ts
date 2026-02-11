import type { AppEventPreview } from "@/types/appEvents";

type TicketmasterVenue = {
  name?: string;
  city?: { name?: string };
};

type TicketmasterImage = {
  url?: string;
  ratio?: string;
  width?: number;
  height?: number;
  fallback?: boolean;
};

type TicketmasterEvent = {
  id?: string;
  name?: string;
  url?: string;

  dates?: {
    timezone?: string;
    start?: {
      dateTime?: string;
      localDate?: string;
      localTime?: string;
    };
  };

  images?: TicketmasterImage[];

  _embedded?: {
    venues?: TicketmasterVenue[];
  };

  classifications?: Array<{
    segment?: { name?: string };
    genre?: { name?: string };
  }>;
};

function pickBestImageUrl(images: TicketmasterImage[] | undefined): string | undefined {
  if (!images || images.length === 0) return undefined;

  const preferred = images
    .filter((img) => Boolean(img.url))
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));

  const ratio16x9 = preferred.find((img) => img.ratio === "16_9" && (img.width ?? 0) >= 1000);
  if (ratio16x9?.url) return ratio16x9.url;

  const anyLarge = preferred[0]?.url;
  return anyLarge;
}

function buildDerivedShortDescription(e: {
  city?: string;
  venueName?: string;
  segment?: string;
  genre?: string;
}): string | undefined {
  const parts = [e.genre ?? e.segment, e.venueName ?? e.city].filter(Boolean);
  if (parts.length === 0) return undefined;
  return parts.join(" • ");
}

function buildStartDateTime(tm: TicketmasterEvent): string | null {
  const dt = tm.dates?.start?.dateTime;
  if (dt) return dt;

  const localDate = tm.dates?.start?.localDate;
  const localTime = tm.dates?.start?.localTime;

  if (localDate && localTime) return `${localDate}T${localTime}`;

  return null;
}

export function mapTicketmasterEventToPreview(tm: TicketmasterEvent): AppEventPreview | null {
  const id = tm.id?.trim();
  const title = tm.name?.trim();
  const startDateTime = buildStartDateTime(tm);

  if (!id || !title || !startDateTime) return null;

  const venue = tm._embedded?.venues?.[0];
  const venueName = venue?.name?.trim() || undefined;
  const city = venue?.city?.name?.trim() || undefined;

  const imageUrl = pickBestImageUrl(tm.images);
  const bookingUrl = tm.url?.trim() || undefined;

  const segment = tm.classifications?.[0]?.segment?.name?.trim();
  const genre = tm.classifications?.[0]?.genre?.name?.trim();

  const shortDescription = buildDerivedShortDescription({ city, venueName, segment, genre });

  return {
    id,
    slug: id,
    title,
    startDateTime,
    timezone: tm.dates?.timezone,

    city,
    venueName,

    imageUrl,
    bookingUrl,

    shortDescription,
  };
}

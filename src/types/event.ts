export type Lang = "en" | "nl";

export type LocalizedText = Partial<Record<Lang, string>>;

export type EventCategory =
  | "music"
  | "festival"
  | "sports"
  | "theatre"
  | "family"
  | "food_drink"
  | "business"
  | "other";

export type Money = {
  currency: string;
  min?: number;
  max?: number;
  isFree?: boolean;
};

export type EventLocation = {
  venueName?: string;
  address?: string;
  postalCode?: string;
  city: string;
  region?: string;
  countryCode: string;
  lat?: number;
  lng?: number;
};

export type EventImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: LocalizedText;
};

export type EventSource =
  | { provider: "dataEvents" }
  | {
      provider: "test";
      ticketmasterId: string;
      ticketmasterUrl?: string;
      lastFetchedAt?: string;
    };

export type Event = {
  id: string;
  slug: string;
  title: LocalizedText;
  description?: LocalizedText;
  category: EventCategory;
  tags?: string[];
  startDateTime: string;
  endDateTime?: string;
  timezone?: string;
  location: EventLocation;
  images?: EventImage[];
  bookingUrl?: string;
  price?: Money;
  source: EventSource;
};

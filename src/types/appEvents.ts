export type AppEventPreview = {
  id: string;
  slug: string;
  title: string;
  startDateTime: string;
  timezone?: string;
  city?: string;
  venueName?: string;
  imageUrl?: string;
  bookingUrl?: string; // optional for now, come back and make a decision here later
  shortDescription?: string; // optional because I don't see this property inside ticketmaster event object
  category?: string;
};

export type AppEventsResponse = {
  events: AppEventPreview[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
};

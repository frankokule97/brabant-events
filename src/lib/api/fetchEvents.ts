import type { AppEventsResponse } from "@/types/appEvents";

type FetchAppEventsOptions = {
  page?: number;
  startDateTime?: string;
  endDateTime?: string;
};

const emptyResponse: AppEventsResponse = {
  events: [],
  page: { size: 0, totalElements: 0, totalPages: 0, number: 0 },
};

export async function fetchAppEvents(
  options: FetchAppEventsOptions = {},
): Promise<AppEventsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    // Keeping the response stable even if env variable is missing
    return emptyResponse;
  }

  const url = new URL(`${baseUrl}/api/events`);

  if (typeof options.page === "number") {
    url.searchParams.set("page", String(options.page));
  }

  if (options.startDateTime) {
    url.searchParams.set("startDateTime", options.startDateTime);
  }

  if (options.endDateTime) {
    url.searchParams.set("endDateTime", options.endDateTime);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    return emptyResponse;
  }

  return (await res.json()) as AppEventsResponse;
}

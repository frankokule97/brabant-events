import type { AppEventsResponse } from "@/types/appEvents";

export async function fetchAppEvents(): Promise<AppEventsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    // Keeping the response stable even if env variable is missing
    return {
      events: [],
      page: { size: 0, totalElements: 0, totalPages: 0, number: 0 },
    };
  }

  const res = await fetch(`${baseUrl}/api/events`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    return {
      events: [],
      page: { size: 0, totalElements: 0, totalPages: 0, number: 0 },
    };
  }

  return (await res.json()) as AppEventsResponse;
}

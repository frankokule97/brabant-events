import type { AppEventPreview } from "@/types/appEvents";

export async function fetchAppEventById(id: string): Promise<AppEventPreview | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/api/events/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  return (await res.json()) as AppEventPreview;
}

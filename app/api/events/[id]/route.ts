import { NextResponse } from "next/server";
import { mapTicketmasterEventToPreview } from "@/lib/ticketmaster/mapTicketmasterEvent";

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Ticketmaster API key" }, { status: 500 });
  }

  const res = await fetch(`${TM_BASE_URL}/${encodeURIComponent(id)}.json?apikey=${apiKey}`, {
    next: { revalidate: 600 },
  });

  if (res.status === 404) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: "Ticketmaster error" }, { status: 502 });
  }

  const tmEvent = await res.json();
  const event = mapTicketmasterEventToPreview(tmEvent);

  return NextResponse.json(event, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
    },
  });
}

import { mapTicketmasterEventToPreview } from "@/lib/ticketmaster/mapTicketmasterEvent";
import type { AppEventsResponse } from "@/types/appEvents";
import { NextResponse } from "next/server";

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const DEFAULTS = {
  countryCode: "NL",
  geoPoint: "51.52575,5.1114",
  radius: "80",
  unit: "km",
  size: "20",
  sort: "date,asc",
};

// I'm doing this because the timetracker doesn't allow milliseconds
function formatTicketmasterDateTime(dt: Date): string {
  return dt.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function getDefaultStartDateTime(): string {
  return formatTicketmasterDateTime(new Date());
}

function getDefaultEndDateTime(months: number): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + months);
  return formatTicketmasterDateTime(d);
}

export async function GET(req: Request) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing TICKETMASTER_API_KEY on server" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = new URL(req.url);

  const countryCode = url.searchParams.get("countryCode") ?? DEFAULTS.countryCode;
  const geoPoint = url.searchParams.get("geoPoint") ?? DEFAULTS.geoPoint;
  const radius = url.searchParams.get("radius") ?? DEFAULTS.radius;
  const unit = url.searchParams.get("unit") ?? DEFAULTS.unit;
  const size = url.searchParams.get("size") ?? DEFAULTS.size;
  const page = url.searchParams.get("page");
  const sort = url.searchParams.get("sort") ?? DEFAULTS.sort;

  const startDateTime = url.searchParams.get("startDateTime") ?? getDefaultStartDateTime();
  const endDateTime = url.searchParams.get("endDateTime") ?? getDefaultEndDateTime(12);

  const tmUrl = new URL(TM_BASE_URL);
  tmUrl.searchParams.set("apikey", apiKey);
  tmUrl.searchParams.set("countryCode", countryCode);
  tmUrl.searchParams.set("geoPoint", geoPoint);
  tmUrl.searchParams.set("radius", radius);
  tmUrl.searchParams.set("unit", unit);
  tmUrl.searchParams.set("size", size);
  tmUrl.searchParams.set("sort", sort);
  tmUrl.searchParams.set("startDateTime", startDateTime);
  tmUrl.searchParams.set("endDateTime", endDateTime);
  if (page) tmUrl.searchParams.set("page", page);

  const res = await fetch(tmUrl.toString(), {
    // cache for 10 minutes on the server
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: "Ticketmaster request failed", status: res.status, body: text },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const data = await res.json();

  const tmEvents = data?._embedded?.events ?? [];
  const mapped = tmEvents.map(mapTicketmasterEventToPreview).filter(Boolean);

  const normalized: AppEventsResponse = {
    events: mapped,
    page: {
      size: data?.page?.size ?? mapped.length,
      totalElements: data?.page?.totalElements ?? mapped.length,
      totalPages: data?.page?.totalPages ?? 1,
      number: data?.page?.number ?? 0,
    },
  };

  return NextResponse.json(normalized, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
    },
  });
}

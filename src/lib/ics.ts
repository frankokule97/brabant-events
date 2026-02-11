import type { AppEventPreview } from "@/types/appEvents";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Converting ISO date string to iCalendar UTC format **/
function toIcsUtc(iso: string): string {
  const date = new Date(iso);
  return (
    date.getUTCFullYear().toString() +
    pad2(date.getUTCMonth() + 1) +
    pad2(date.getUTCDate()) +
    "T" +
    pad2(date.getUTCHours()) +
    pad2(date.getUTCMinutes()) +
    pad2(date.getUTCSeconds()) +
    "Z"
  );
}

/** Escaping text according to iCalendar rules  **/
function escapeIcsText(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildLocation(e: AppEventPreview): string {
  const parts = [e.venueName, e.city].filter(Boolean);
  return parts.join(", ");
}

/** ICS content for a single event. **/
export function createEventIcs(e: AppEventPreview): string {
  const title = escapeIcsText(e.title || "Event");

  const description = escapeIcsText(e.shortDescription ?? "");

  const location = escapeIcsText(buildLocation(e));

  const dateStart = toIcsUtc(e.startDateTime);

  const dateEnd = toIcsUtc(
    new Date(new Date(e.startDateTime).getTime() + 2 * 60 * 60 * 1000).toISOString(),
  );

  const uid = `${e.id}@brabantevents`;
  const dateStamp = toIcsUtc(new Date().toISOString());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BrabantEvents//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dateStamp}`,
    `DTSTART:${dateStart}`,
    `DTEND:${dateEnd}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description}` : "",
    location ? `LOCATION:${location}` : "",
    e.bookingUrl ? `URL:${escapeIcsText(e.bookingUrl)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .filter(Boolean)
    .join("\r\n");
}

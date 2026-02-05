import type { Event } from "@/types/event";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Converting ISO date string to iCalendar UTC format **/

function toIcsUtc(iso: string): string {
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad2(d.getUTCMonth() + 1) +
    pad2(d.getUTCDate()) +
    "T" +
    pad2(d.getUTCHours()) +
    pad2(d.getUTCMinutes()) +
    pad2(d.getUTCSeconds()) +
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

function buildLocation(e: Event): string {
  const parts = [
    e.location.venueName,
    e.location.address,
    e.location.postalCode,
    e.location.city,
  ].filter(Boolean);
  return parts.join(", ");
}

/** Creating minimal, ICS content for a single event. **/

export function createEventIcs(e: Event): string {
  const title = escapeIcsText(e.title.en ?? e.title.nl ?? "Event");
  const description = escapeIcsText(e.description?.en ?? e.description?.nl ?? "");
  const location = escapeIcsText(buildLocation(e));

  const dtStart = toIcsUtc(e.startDateTime);
  const dtEnd = e.endDateTime
    ? toIcsUtc(e.endDateTime)
    : toIcsUtc(new Date(new Date(e.startDateTime).getTime() + 2 * 60 * 60 * 1000).toISOString());

  const uid = `${e.id}@brabantevents`;
  const dtStamp = toIcsUtc(new Date().toISOString());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BrabantEvents//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description}` : "",
    location ? `LOCATION:${location}` : "",
    `URL:${escapeIcsText(e.bookingUrl ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .filter(Boolean)
    .join("\r\n");
}

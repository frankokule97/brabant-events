import { Event } from "@/types/event";

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday(): Date {
  const start = startOfToday();
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function isToday(event: Event): boolean {
  const eventDate = new Date(event.startDateTime);
  return eventDate >= startOfToday() && eventDate <= endOfToday();
}

export function isThisWeekend(event: Event): boolean {
  const now = new Date();
  const day = now.getDay();

  const saturdayOffset = day === 0 ? 6 : 6 - day;
  const sundayOffset = day === 0 ? 0 : 7 - day;

  const saturday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + saturdayOffset,
    0,
    0,
    0,
  );

  const sundayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + sundayOffset,
    23,
    59,
    59,
  );

  const eventDate = new Date(event.startDateTime);
  return eventDate >= saturday && eventDate <= sundayEnd;
}

export function isThisMonth(event: Event): boolean {
  const now = new Date();
  const eventDate = new Date(event.startDateTime);

  return eventDate.getFullYear() === now.getFullYear() && eventDate.getMonth() === now.getMonth();
}

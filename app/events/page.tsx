import Link from "next/link";
import { dataEvents } from "@/data/events.data";
import { isToday, isThisMonth, isThisWeekend } from "@/lib/eventDateFilters";
import { EventsListClient } from "@/components/EventsListClient";

type WhenFilter = "today" | "weekend" | "month";

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ when?: string; fav?: string }>;
}) {
  const sp = await searchParams;
  const when = (sp?.when ?? "") as WhenFilter;
  const favoritesOnly = sp?.fav === "1";

  const filteredEvents = dataEvents.filter((event) => {
    if (!when) return true;
    if (when === "today") return isToday(event);
    if (when === "weekend") return isThisWeekend(event);
    if (when === "month") return isThisMonth(event);
    return true;
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Events</h1>
        <p className="mt-2 text-sm text-gray-600">Discover events in North Brabant.</p>

        <nav className="mt-4 flex flex-wrap gap-2">
          <FilterButton href="/events" active={!when}>
            All
          </FilterButton>
          <FilterButton href="/events?when=today" active={when === "today"}>
            Today
          </FilterButton>
          <FilterButton href="/events?when=weekend" active={when === "weekend"}>
            This weekend
          </FilterButton>
          <FilterButton href="/events?when=month" active={when === "month"}>
            This month
          </FilterButton>
          <FilterButton
            href={`/events${when ? `?when=${when}&fav=1` : "?fav=1"}`}
            active={favoritesOnly}
          >
            Favorites
          </FilterButton>
        </nav>
      </header>

      <EventsListClient events={filteredEvents} favoritesOnly={favoritesOnly} />
    </main>
  );
}

function FilterButton({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full border px-3 py-1 text-sm",
        active ? "bg-gray-900 text-white" : "bg-white text-gray-900",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

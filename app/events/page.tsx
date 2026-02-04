import Link from "next/link";
import { dataEvents } from "@/src/data/events.data";
import { isToday, isThisMonth, isThisWeekend } from "@/src/lib/eventDateFilters";
import { FavoriteButton } from "@/src/components/FavoriteButton";

type WhenFilter = "today" | "weekend" | "month";

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ when?: string }>;
}) {
  const sp = await searchParams;
  const when = (sp?.when ?? "") as WhenFilter;

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
        </nav>
      </header>

      {filteredEvents.length === 0 ? (
        <div className="rounded-xl border p-6 text-sm text-gray-700">
          No events found for this filter.
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <article key={event.id} className="rounded-xl border p-4 shadow-sm">
              <div className="text-xs text-gray-600">
                {event.location.city} •{" "}
                {new Date(event.startDateTime).toLocaleString("en-NL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>

              <div className="mt-2 flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {event.title.en ?? event.title.nl ?? "Untitled event"}
                </h2>
                <FavoriteButton eventId={event.id} />
              </div>

              {event.description?.en || event.description?.nl ? (
                <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                  {event.description?.en ?? event.description?.nl}
                </p>
              ) : null}

              <div className="mt-3 text-xs text-gray-600">Category: {event.category}</div>
            </article>
          ))}
        </section>
      )}
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

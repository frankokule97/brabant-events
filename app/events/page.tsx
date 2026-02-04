import { dataEvents } from "@/src/data/events.data";

export default function EventsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Events</h1>
        <p className="mt-2 text-sm text-gray-600">View events in North Brabant.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dataEvents.map((event) => (
          <article key={event.id} className="rounded-xl border p-4 shadow-sm">
            <div className="text-xs text-gray-600">
              {event.location.city} •{" "}
              {new Date(event.startDateTime).toLocaleString("en-NL", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>

            <h2 className="mt-2 text-lg font-semibold">
              {event.title.en ?? event.title.nl ?? "Untitled event"}
            </h2>

            {event.description?.en || event.description?.nl ? (
              <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                {event.description?.en ?? event.description?.nl}
              </p>
            ) : null}

            <div className="mt-3 text-xs text-gray-600">Category: {event.category}</div>
          </article>
        ))}
      </section>
    </main>
  );
}

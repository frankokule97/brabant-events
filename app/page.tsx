import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Discover events in Noord-Brabant</h1>
        <p className="max-w-2xl text-gray-600">
          BrabantEvents helps you find concerts, sports, festivals, and local happenings in
          Noord-Brabant. Built with Next.js (App Router) and real-time event data.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/events"
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Browse events
          </Link>
          <a
            href="https://github.com/frankokule97/brabant-events"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            View source on GitHub
          </a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">North Brabant focus</h2>
          <p className="mt-1 text-sm text-gray-600">
            Filter by cities like Breda, Eindhoven, Tilburg, and ’s-Hertogenbosch.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Real-time data</h2>
          <p className="mt-1 text-sm text-gray-600">
            We’ll integrate a public events API and keep the key secure via Next.js route handlers.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Shareable URLs</h2>
          <p className="mt-1 text-sm text-gray-600">
            Filters will be stored in URL search params for easy sharing and bookmarking.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Favorites</h2>
          <p className="mt-1 text-sm text-gray-600">
            Save events locally first (free), with an option to add accounts later.
          </p>
        </div>
      </section>
    </div>
  );
}

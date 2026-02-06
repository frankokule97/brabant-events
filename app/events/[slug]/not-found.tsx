import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="rounded-xl border p-6">
        <h1 className="text-2xl font-semibold">Event not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          This event link may be outdated or the event was removed. Please go back to the events
          list.
        </p>

        <div className="mt-4">
          <Link
            href="/events"
            className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            ← Back to events
          </Link>
        </div>
      </header>
    </main>
  );
}

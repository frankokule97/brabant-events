import Link from "next/link";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-gray-600">
          I will work next on real time events for Noord Brabant province and how to filter it
          filters
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-gray-600">Current placeholder - replace later!</p>

        <div className="mt-4 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataEvents } from "@/data/events.data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const event = dataEvents.find((e) => e.slug === slug);

  // safety precaution step
  if (!event) {
    return {
      title: "Event not found",
      description: "The requested event could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const title = event.title.en ?? event.title.nl ?? "Event";
  const description = event.description?.en ?? event.description?.nl ?? "";
  const shortDescription =
    description.trim().length > 0
      ? description.trim().slice(0, 160)
      : `Event in ${event.location.city}, ${event.location.region}.`;

  const url = `/events/${event.slug}`;

  return {
    title,
    description: shortDescription,

    openGraph: {
      title,
      description: shortDescription,
      url,
      type: "article",
    },

    twitter: {
      title,
      description: shortDescription,
      card: "summary_large_image",
    },
  };
}

export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = dataEvents.find((e) => e.slug === slug);
  if (!event) return notFound();

  const title = event.title.en ?? event.title.nl ?? "Event";
  const description = event.description?.en ?? event.description?.nl ?? "";
  const dateTime = new Date(event.startDateTime).toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/events" className="text-sm underline">
        ← Back to events
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {event.location.city} • {dateTime}
        </p>
      </header>

      {description ? (
        <p className="mt-6 whitespace-pre-line text-base text-gray-800">{description}</p>
      ) : null}

      <section className="mt-8 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Location</h2>
        <div className="mt-2 text-sm text-gray-700">
          <div>{event.location.venueName}</div>
          <div>
            {event.location.city}, {event.location.region}
          </div>
        </div>

        {event.bookingUrl ? (
          <a
            href={event.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Book tickets →
          </a>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Add to calendar</h2>
        <a
          href={`/api/calendar?slug=${event.slug}`}
          className="mt-3 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
        >
          Download .ics
        </a>
      </section>

      <section className="mt-6 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Coordinates</h2>
        <div className="mt-2 text-sm text-gray-700">
          {event.location.lat}, {event.location.lng}
        </div>
      </section>
    </main>
  );
}

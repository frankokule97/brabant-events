import { toJsonLdScript } from "@/lib/jsonLd";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { messages, type Locale } from "@/i18n/messages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = messages[locale] ?? messages.en;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    return {
      title: t.event.notFoundTitle,
      description: t.event.notFoundDescription,
      robots: { index: false, follow: false },
    };
  }

  const res = await fetch(`${baseUrl}/api/events/${encodeURIComponent(id)}`, {
    next: { revalidate: 600 },
  });

  if (res.status === 404 || !res.ok) {
    return {
      title: t.event.notFoundTitle,
      description: t.event.notFoundDescription,
      robots: { index: false, follow: false },
    };
  }

  const event = (await res.json()) as {
    id: string;
    title: string;
    shortDescription: string | null;
    city: string;
    venueName: string;
    imageUrl: string | null;
  };

  const title = event.title?.trim() || t.event.fallbackTitle;

  const description =
    event.shortDescription?.trim() ||
    t.event.fallbackDescription
      .replace("{{venue}}", event.venueName || t.event.fallbackVenue)
      .replace("{{city}}", event.city || t.event.fallbackCity);

  const shortDescription = description.length > 160 ? description.slice(0, 160) : description;

  const url = `${baseUrl}/${locale}/events/${event.id}`;
  const eventImage = event.imageUrl ?? `${baseUrl}/brabant-events.png`;

  return {
    title,
    description: shortDescription,
    openGraph: {
      title,
      description: shortDescription,
      url,
      type: "article",
      images: [{ url: eventImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: shortDescription,
      images: [eventImage],
    },
  };
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: Locale }>;
}) {
  const { id, locale } = await params;
  const t = messages[locale] ?? messages.en;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return notFound();

  const res = await fetch(`${baseUrl}/api/events/${encodeURIComponent(id)}`, {
    next: { revalidate: 600 },
  });

  if (res.status === 404) return notFound();
  if (!res.ok) return notFound();

  const event = await res.json();

  const title = event.title?.trim() ?? "Event";
  const description = event.shortDescription?.trim() ?? "";
  const dateTime = new Date(event.startDateTime).toLocaleString(
    locale === "nl" ? "nl-NL" : "en-GB",
    {
      dateStyle: "full",
      timeStyle: "short",
    },
  );
  const mapsQuery = [event.venueName, event.city].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description: description || undefined,
    startDate: event.startDateTime,
    url: `${baseUrl}/${locale}/events/${event.id}`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venueName,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressCountry: "NL",
      },
    },
    offers: event.bookingUrl
      ? {
          "@type": "Offer",
          url: event.bookingUrl,
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(jsonLd) }}
      />

      <Link href={`/${locale}/events`} className="text-sm underline">
        ← {t.event.backToEvents}
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {event.city} • {dateTime}
        </p>
      </header>

      {description ? (
        <p className="mt-6 whitespace-pre-line text-base text-gray-800">{description}</p>
      ) : null}

      <section className="mt-8 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">{t.event.locationTitle}</h2>
        <div className="mt-2 text-sm text-gray-700">
          <div>{event.venueName}</div>
          <div>{event.city}</div>
        </div>

        {event.bookingUrl ? (
          <a
            href={event.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            {t.event.bookTickets}
          </a>
        ) : null}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
        >
          {t.event.openInMaps} →
        </a>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <iframe
            title={`${title} map`}
            src={mapsEmbedUrl}
            className="h-72 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">{t.event.calendarTitle}</h2>
        <a
          href={`/api/calendar?id=${event.id}`}
          className="mt-3 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
        >
          {t.event.downloadIcs}
        </a>
      </section>
    </main>
  );
}

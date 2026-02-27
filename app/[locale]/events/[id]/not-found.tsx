"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { messages, type Locale } from "@/i18n/messages";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const locale: Locale = params?.locale === "nl" ? "nl" : "en";
  const t = messages[locale] ?? messages.en;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">{t.event.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-white/70">{t.event.notFoundBody}</p>

        <div className="mt-4">
          <Link
            href={`/${locale}/events`}
            className="inline-flex rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            ← {t.event.backToEvents}
          </Link>
        </div>
      </header>
    </main>
  );
}

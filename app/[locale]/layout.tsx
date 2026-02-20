import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { messages, type Locale } from "@/i18n/messages";

const LOCALES = ["en", "nl"] as const;

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default function LocaleLayout({ children, params }: Props) {
  if (!isLocale(params.locale)) notFound();

  const locale = params.locale; // now typed as Locale
  const t = messages[locale] ?? messages.en;

  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href={`/${locale}`} className="font-semibold">
            BrabantEvents
          </Link>

          <nav className="flex gap-4 text-sm">
            <Link href={`/${locale}`} className="hover:underline">
              {t.nav.home}
            </Link>
            <Link href={`/${locale}/events`} className="hover:underline">
              {t.nav.events}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}

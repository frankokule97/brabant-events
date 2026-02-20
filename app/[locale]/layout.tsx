import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { messages, type Locale } from "@/i18n/messages";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

const LOCALES = ["en", "nl"] as const;

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale;
  const t = messages[locale] ?? messages.en;

  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href={`/${locale}`} className="font-semibold">
            BrabantEvents
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4 text-sm">
              <Link href={`/${locale}`} className="hover:underline">
                {t.nav.home}
              </Link>
              <Link href={`/${locale}/events`} className="hover:underline">
                {t.nav.events}
              </Link>
            </nav>
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}

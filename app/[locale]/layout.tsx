import type { ReactNode } from "react";
import Link from "next/link";
import { messages, type Locale } from "@/i18n/messages";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
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

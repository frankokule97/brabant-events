"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";

type Locale = "en" | "nl";

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "nl";
}

function buildHref(pathname: string, search: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = nextLocale;
  } else {
    segments.unshift(nextLocale);
  }

  const nextPath = "/" + segments.join("/");
  return search ? `${nextPath}?${search}` : nextPath;
}

function label(locale: Locale): string {
  return locale === "en" ? "English" : "Nederlands";
}

function flag(locale: Locale): string {
  return locale === "en" ? "🇬🇧" : "🇳🇱";
}

export function LocaleSwitcher() {
  const params = useParams<{ locale?: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLocale: Locale = isLocale(params?.locale) ? params.locale : "en";
  const search = searchParams.toString();

  const items = useMemo(
    () =>
      (["en", "nl"] as const).map((loc) => ({
        locale: loc,
        href: buildHref(pathname, search, loc),
      })),
    [pathname, search],
  );

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function onPointerDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const currentLabel = label(currentLocale);
  const currentFlag = flag(currentLocale);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "relative inline-flex items-center gap-2 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-sm",
          "border-white/15 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white",
          "hover:bg-white/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(900px_circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_0%,rgba(255,255,255,0.12),transparent_50%)]"
        />
        <span className="relative inline-flex items-center gap-2">
          <span aria-hidden="true" className="text-base leading-none">
            {currentFlag}
          </span>
          <span className="hidden sm:inline">{currentLabel}</span>
          <span className="sm:hidden">{currentLocale.toUpperCase()}</span>

          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Select language"
          className={[
            "absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border shadow-lg",
            "border-white/15 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800",
          ].join(" ")}
        >
          {/* Hero-like radial overlay */}
          <div className="absolute inset-0 opacity-40 [background:radial-gradient(900px_circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_0%,rgba(255,255,255,0.12),transparent_50%)]" />

          {/* Content layer above the overlay */}
          <div className="relative">
            {items.map(({ locale, href }) => {
              const active = locale === currentLocale;

              return (
                <Link
                  key={locale}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-2 px-3 py-2 text-sm transition",
                    "border-b border-white/10 last:border-b-0",
                    active ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {flag(locale)}
                  </span>
                  <span className="flex-1">{label(locale)}</span>
                  {active && <span className="text-xs text-white/60">Current</span>}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

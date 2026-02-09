import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brabant-events.vercel.app"),

  title: {
    default: "BrabantEvents",
    template: "%s | BrabantEvents",
  },

  description:
    "Discover events in North Brabant. Filter events by date, save your favorite events, and add events to your calendar.",

  openGraph: {
    title: "BrabantEvents",
    description:
      "Discover events in North Brabant. Filter events by date, save your favorite events, and add events to your calendar.",
    url: "/",
    siteName: "BrabantEvents",
    type: "website",
    images: [
      {
        url: "/brabant-events.png",
        width: 1200,
        height: 630,
        alt: "Brabant Events",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "BrabantEvents",
    description:
      "Discover events in North Brabant. Filter events by date, save your favorite events, and add events to your calendar.",
    images: ["/brabant-events.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-semibold">
              BrabantEvents
            </Link>

            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/events" className="hover:underline">
                Events
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}

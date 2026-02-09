import type { MetadataRoute } from "next";
import { dataEvents } from "@/data/events.data";

const SITE_URL = "https://brabant-events.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: new Date(),
    },
  ];

  const eventRoutes: MetadataRoute.Sitemap = dataEvents.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: new Date(event.startDateTime),
  }));

  return [...staticRoutes, ...eventRoutes];
}

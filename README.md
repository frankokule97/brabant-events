# BrabantEvents (Next.js)

Live: https://brabant-events.vercel.app/

## What it is

A small events platform for North Brabant. Browse events, filter by date (today/weekend/month), save favorites, and view
event detail pages with Add-to-Calendar support.

## Features

- Events list with server-side date filters (`?when=today|weekend|month`)
- Favorites stored in localStorage + favorites-only mode (`?fav=1`)
- Event detail page with booking CTA
- Add-to-Calendar download (`.ics`) via API route
- SEO layer: metadata, sitemap, robots, JSON-LD (Event + ItemList)

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Vercel deployment

## Architecture notes

### Server vs Client Components

- Server Components: pages render filter results server-side for SEO and fast initial load
- Client Components: favorites use localStorage and interactive UI

### URL-driven state

- `when` filter is server-driven via query params
- `fav=1` is client-driven (cannot be server-rendered because localStorage is browser-only)

### SEO

- Global metadata in `app/layout.tsx`
- Page-level metadata for `/events`
- Dynamic metadata for event detail pages (`generateMetadata`)
- `robots.ts` and `sitemap.ts`
- JSON-LD:
    - Event schema on `/events/[slug]`
    - ItemList schema on `/events` (not rendered for `?fav=1`)

## Getting started

```bash
pnpm install
pnpm dev
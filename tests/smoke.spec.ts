import { test, expect } from "@playwright/test";

test("Homepage loads", async ({ page }) => {
  await page.goto("/en");
  // Signal that the page rendered
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("Events page loads and shows filters", async ({ page }) => {
  await page.goto("/en/events");
  await expect(page.getByRole("heading", { level: 1, name: /events/i })).toBeVisible();

  // Filter are links (All/Today/Weekend/Month/Favorites)
  await expect(page.getByRole("link", { name: /all/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /favorites/i })).toBeVisible();
});

test("User can navigate from events list to event detail", async ({ page }) => {
  await page.goto("/en/events");

  // Click the first event title link
  const firstEventLink = page.locator('a[href^="/en/events/"]').first();
  await expect(firstEventLink).toBeVisible();

  await firstEventLink.click();

  // On detail page we expect H1 and the back link
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /back/i })).toBeVisible();
});

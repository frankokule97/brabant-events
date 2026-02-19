export const messages = {
  en: {
    nav: {
      home: "Home",
      events: "Events",
    },
    filters: {
      searchLabel: "Search",
      searchPlaceholder: "Search by title, city, venue...",
      categoryLabel: "Category",
      allCategories: "All categories",
      clearFilters: "Clear filters",
    },
  },
  nl: {
    nav: {
      home: "Home",
      events: "Evenementen",
    },
    filters: {
      searchLabel: "Zoeken",
      searchPlaceholder: "Zoek op titel, stad, locatie...",
      categoryLabel: "Categorie",
      allCategories: "Alle categorieën",
      clearFilters: "Filters wissen",
    },
  },
} as const;

export type Locale = keyof typeof messages;

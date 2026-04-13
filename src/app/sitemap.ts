import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://argatia.gr";
const LOCALES = ["el", "en"] as const;

const STATIC_ROUTES = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/vineyards", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/wines", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/news", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages — both locales
  for (const locale of LOCALES) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${route.path}`]),
          ),
        },
      });
    }
  }

  // Dynamic news articles
  try {
    const res = await fetch(`${BASE_URL}/api/news?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const articles: Array<{ id: string; date: string; updatedAt?: string }> =
        json?.data ?? [];

      for (const article of articles) {
        for (const locale of LOCALES) {
          entries.push({
            url: `${BASE_URL}/${locale}/news/${article.id}`,
            lastModified: new Date(article.updatedAt ?? article.date),
            changeFrequency: "weekly",
            priority: 0.7,
            alternates: {
              languages: Object.fromEntries(
                LOCALES.map((l) => [l, `${BASE_URL}/${l}/news/${article.id}`]),
              ),
            },
          });
        }
      }
    }
  } catch {
    // Firebase not configured in this environment — skip dynamic news entries
  }

  return entries;
}

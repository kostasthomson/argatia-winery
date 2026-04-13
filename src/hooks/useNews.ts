import useSWR from "swr";
import { getAllNews, getNewsItemById, toClientNewsItem } from "@/lib/news";
import type { NewsItemClient } from "@/types/news";
import type { ApiResponse } from "@/types/api";

// ── Public hooks (fetch via API routes) ────────────────────────────

const apiFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: ApiResponse<NewsItemClient[]> = await res.json();
  if (!json.success) throw new Error("API returned error");
  return json;
};

const singleFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: ApiResponse<NewsItemClient> = await res.json();
  if (!json.success) throw new Error("API returned error");
  return json.data;
};

/** Fetch published news for the public listing page. */
export function useNewsList(params?: {
  limit?: number;
  startAfter?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.startAfter) searchParams.set("startAfter", params.startAfter);
  const url = `/api/news?${searchParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, apiFetcher, {
    dedupingInterval: 5000,
  });

  return {
    articles: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

/** Fetch featured news for the home page. */
export function useFeaturedNews() {
  const { data, error, isLoading } = useSWR(
    "/api/news?featured=true",
    apiFetcher,
    { dedupingInterval: 5000 },
  );

  return {
    articles: data?.data ?? [],
    isLoading,
    error,
  };
}

/** Fetch a single published article by ID (public). */
export function useNewsItem(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/news/${id}` : null,
    singleFetcher,
    { dedupingInterval: 5000 },
  );

  return { article: data ?? null, isLoading, error };
}

// ── Admin hooks (fetch directly from Firestore) ────────────────────

/** Fetch ALL news (including drafts) for the admin panel. */
export function useAdminNewsList() {
  const { data, error, isLoading, mutate } = useSWR(
    "admin-news",
    async () => {
      const items = await getAllNews();
      return items.map(toClientNewsItem);
    },
    { revalidateOnFocus: false },
  );

  return {
    articles: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

/** Fetch a single news article (including drafts) for the admin editor. */
export function useAdminNewsItem(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["admin-news", id] : null,
    async () => {
      if (!id) return null;
      const item = await getNewsItemById(id);
      return item ? toClientNewsItem(item) : null;
    },
    { revalidateOnFocus: false },
  );

  return { article: data ?? null, isLoading, error, mutate };
}

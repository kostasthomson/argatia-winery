export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { NEWS_LIMITS } from "@/lib/constants";
import type { ApiResponse, ApiError, ApiMeta } from "@/types/api";
import type { NewsItemClient } from "@/types/news";

export async function GET(request: NextRequest) {
  try {
    // Lazy import to avoid Firebase initialization at build time
    const { getPublishedNews, getFeaturedNews, toClientNewsItem } = await import("@/lib/news");

    const params = request.nextUrl.searchParams;
    const featured = params.get("featured") === "true";
    const limitParam = parseInt(params.get("limit") ?? "", 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), NEWS_LIMITS.maxPerPage)
      : NEWS_LIMITS.newsPageDefault;
    const startAfterDate = params.get("startAfter") ?? undefined;

    if (featured) {
      const items = await getFeaturedNews();
      const data = items.map(toClientNewsItem);
      const body: ApiResponse<NewsItemClient[]> = {
        success: true,
        data,
        meta: { total: data.length, page: 1, perPage: data.length, hasMore: false },
      };
      return NextResponse.json(body, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }

    const { items, hasMore } = await getPublishedNews({ limit, startAfterDate });
    const data = items.map(toClientNewsItem);
    const meta: ApiMeta = {
      total: data.length,
      page: 1,
      perPage: limit,
      hasMore,
    };
    const body: ApiResponse<NewsItemClient[]> = { success: true, data, meta };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("GET /api/news error:", error);
    const body: ApiError = { success: false, error: "Failed to fetch news." };
    return NextResponse.json(body, { status: 500 });
  }
}

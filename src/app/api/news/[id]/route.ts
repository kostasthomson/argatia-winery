export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { ApiResponse, ApiError } from "@/types/api";
import type { NewsItemClient } from "@/types/news";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Lazy import to avoid Firebase initialization at build time
    const { getNewsItemById, toClientNewsItem } = await import("@/lib/news");

    const { id } = await params;
    const item = await getNewsItemById(id);

    if (!item || !item.published) {
      const body: ApiError = { success: false, error: "Article not found.", code: "NOT_FOUND" };
      return NextResponse.json(body, { status: 404 });
    }

    const body: ApiResponse<NewsItemClient> = {
      success: true,
      data: toClientNewsItem(item),
    };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("GET /api/news/[id] error:", error);
    const body: ApiError = { success: false, error: "Failed to fetch article." };
    return NextResponse.json(body, { status: 500 });
  }
}

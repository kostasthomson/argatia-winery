"use client";

import Link from "next/link";
import AuthGuard from "@/components/auth/auth-guard";
import AdminHeader from "@/components/admin/admin-header";
import { useAdminNewsList } from "@/hooks/useNews";
import { updateNewsItem } from "@/lib/news";
import type { NewsItemClient } from "@/types/news";

export default function AdminNewsPage() {
  return (
    <AuthGuard>
      <AdminNewsList />
    </AuthGuard>
  );
}

function AdminNewsList() {
  const { articles, isLoading, mutate } = useAdminNewsList();

  async function togglePublished(article: NewsItemClient) {
    await updateNewsItem(article.id, { published: !article.published });
    mutate();
  }

  async function toggleFeatured(article: NewsItemClient) {
    await updateNewsItem(article.id, { featured: !article.featured });
    mutate();
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <AdminHeader title="Διαχείριση Νέων" />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-2xl font-light text-[#2c2c2c]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Άρθρα
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {articles.length} {articles.length === 1 ? "άρθρο" : "άρθρα"} συνολικά
            </p>
          </div>
          <Link
            href="/admin/news/new"
            className="btn btn-gold text-sm"
          >
            + Νέο Άρθρο
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && articles.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-2xl">
            <p className="text-4xl mb-4" aria-hidden="true">📝</p>
            <p className="text-lg font-light text-[var(--color-text-muted)] mb-4">
              Δεν υπάρχουν άρθρα ακόμα.
            </p>
            <Link href="/admin/news/new" className="btn btn-gold text-sm">
              Δημιουργήστε το πρώτο
            </Link>
          </div>
        )}

        {/* Article list */}
        {!isLoading && articles.length > 0 && (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/news/${article.id}`}
                      className="text-base font-medium text-[#2c2c2c] hover:text-[#c69d53] transition-colors line-clamp-1"
                    >
                      {article.title_el}
                    </Link>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <time className="text-xs text-gray-400">
                        {new Date(article.date).toLocaleDateString("el-GR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span className="text-xs text-gray-300" aria-hidden="true">·</span>
                      <span className="text-xs text-gray-400">{article.author}</span>
                    </div>
                  </div>

                  {/* Badges & actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Published badge / toggle */}
                    <button
                      onClick={() => togglePublished(article)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        article.published
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                      title={article.published ? "Κλικ για απόσυρση" : "Κλικ για δημοσίευση"}
                    >
                      {article.published ? "Δημοσιευμένο" : "Πρόχειρο"}
                    </button>

                    {/* Featured badge / toggle */}
                    <button
                      onClick={() => toggleFeatured(article)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        article.featured
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                      }`}
                      title={article.featured ? "Αφαίρεση από αρχική" : "Προβολή στην αρχική"}
                    >
                      {article.featured ? "★ Αρχική" : "☆ Αρχική"}
                    </button>

                    {/* Edit link */}
                    <Link
                      href={`/admin/news/${article.id}`}
                      className="text-xs text-gray-400 hover:text-[#c69d53] transition-colors px-3 py-1 border border-gray-200 rounded-lg"
                    >
                      Επεξεργασία
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

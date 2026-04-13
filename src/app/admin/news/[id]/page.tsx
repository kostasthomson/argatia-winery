"use client";

import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/auth-guard";
import AdminHeader from "@/components/admin/admin-header";
import NewsForm from "@/components/admin/news-form";
import { useAdminNewsItem } from "@/hooks/useNews";

export default function AdminNewsEditPage() {
  return (
    <AuthGuard>
      <EditArticle />
    </AuthGuard>
  );
}

function EditArticle() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { article, isLoading } = useAdminNewsItem(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <AdminHeader title="Επεξεργασία Άρθρου" />
        <main className="max-w-3xl mx-auto px-6 py-10">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <AdminHeader title="Επεξεργασία Άρθρου" />
        <main className="max-w-3xl mx-auto px-6 py-10 text-center">
          <p className="text-4xl mb-4" aria-hidden="true">🔍</p>
          <p className="text-lg font-light text-[var(--color-text-muted)]">
            Το άρθρο δεν βρέθηκε.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <AdminHeader title="Επεξεργασία Άρθρου" />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <NewsForm
          article={article}
          onSuccess={() => router.push("/admin/news")}
        />
      </main>
    </div>
  );
}

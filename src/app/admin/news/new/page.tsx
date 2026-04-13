"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/auth-guard";
import AdminHeader from "@/components/admin/admin-header";
import NewsForm from "@/components/admin/news-form";

export default function AdminNewsNewPage() {
  return (
    <AuthGuard>
      <NewArticle />
    </AuthGuard>
  );
}

function NewArticle() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <AdminHeader title="Νέο Άρθρο" />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <NewsForm onSuccess={() => router.push("/admin/news")} />
      </main>
    </div>
  );
}

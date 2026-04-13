"use client";

import { useState, useCallback, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { createNewsItem, updateNewsItem, deleteNewsItem } from "@/lib/news";
import { uploadNewsImage, deleteNewsImage } from "@/lib/storage";
import { validateNewsInput, validateNewsUpdate, validateImageFile } from "@/lib/validation";
import RichTextEditor from "@/components/admin/rich-text-editor";
import type { NewsItemClient } from "@/types/news";

// ── Types ──────────────────────────────────────────────────────────

interface NewsFormProps {
  article?: NewsItemClient;
  onSuccess?: (id: string) => void;
}

interface FormState {
  title_el: string;
  title_en: string;
  content_el: string;
  content_en: string;
  excerpt_el: string;
  excerpt_en: string;
  imageAlt_el: string;
  imageAlt_en: string;
  author: string;
  featured: boolean;
  published: boolean;
}

type Status = "idle" | "saving" | "success" | "error";

// ── Helpers ────────────────────────────────────────────────────────

/** Scroll to the first field that has a validation error. */
function scrollToFirstError(errors: Record<string, string>) {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;

  // Try the field wrapper, then the field itself
  const el =
    document.querySelector(`[data-field="${firstKey}"]`) ??
    document.getElementById(firstKey);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ── Component ──────────────────────────────────────────────────────

export default function NewsForm({ article, onSuccess }: NewsFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(article);

  const [form, setForm] = useState<FormState>({
    title_el: article?.title_el ?? "",
    title_en: article?.title_en ?? "",
    content_el: article?.content_el ?? "",
    content_en: article?.content_en ?? "",
    excerpt_el: article?.excerpt_el ?? "",
    excerpt_en: article?.excerpt_en ?? "",
    imageAlt_el: article?.imageAlt_el ?? "",
    imageAlt_en: article?.imageAlt_en ?? "",
    author: article?.author ?? "",
    featured: article?.featured ?? false,
    published: article?.published ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    article?.imageUrl ?? null,
  );
  const [existingImageUrl] = useState<string | undefined>(article?.imageUrl);

  // Preview toggle
  const [showPreview, setShowPreview] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<"el" | "en">("el");

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /** Check whether a field has an error. */
  const hasError = useCallback(
    (field: string) => Boolean(errors[field]),
    [errors],
  );

  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear the error for this field on change
      setErrors((prev) => {
        if (!(field in prev)) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageError = validateImageFile(file);
    if (imageError) {
      setErrors((prev) => ({ ...prev, image: imageError }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setStatusMessage("");
    setErrors({});

    try {
      // Build payload
      const payload: Record<string, unknown> = { ...form };
      if (imagePreview && !imageFile) {
        payload.imageUrl = existingImageUrl;
      }

      // Validate
      const validation = isEdit
        ? validateNewsUpdate(payload)
        : validateNewsInput(payload);

      if (!validation.valid) {
        setErrors(validation.errors);
        setStatus("idle");
        // Wait a tick for DOM update, then scroll
        requestAnimationFrame(() => scrollToFirstError(validation.errors));
        return;
      }

      // Upload image if new file selected
      let imageUrl: string | undefined = existingImageUrl;
      if (imageFile) {
        imageUrl = await uploadNewsImage(imageFile);
      } else if (!imagePreview && existingImageUrl) {
        await deleteNewsImage(existingImageUrl);
        imageUrl = undefined;
      }

      // Merge validated data with image fields
      const data = {
        ...validation.data,
        imageUrl: imageUrl || undefined,
        imageAlt_el: form.imageAlt_el.trim() || undefined,
        imageAlt_en: form.imageAlt_en.trim() || undefined,
      };

      if (isEdit && article) {
        await updateNewsItem(article.id, data);
        setStatus("success");
        setStatusMessage("Το άρθρο ενημερώθηκε επιτυχώς.");
        onSuccess?.(article.id);
      } else {
        const newId = await createNewsItem({
          title_el: data.title_el as string,
          title_en: (data.title_en as string) || undefined,
          content_el: data.content_el as string,
          content_en: (data.content_en as string) || undefined,
          excerpt_el: (data.excerpt_el as string) || undefined,
          excerpt_en: (data.excerpt_en as string) || undefined,
          imageUrl: data.imageUrl,
          imageAlt_el: data.imageAlt_el,
          imageAlt_en: data.imageAlt_en,
          author: data.author as string,
          featured: Boolean(data.featured),
          published: Boolean(data.published),
        });
        setStatus("success");
        setStatusMessage("Το άρθρο δημιουργήθηκε επιτυχώς.");
        onSuccess?.(newId);
      }
    } catch (error) {
      console.error("News form error:", error);
      setStatus("error");
      setStatusMessage("Σφάλμα κατά την αποθήκευση. Δοκιμάστε ξανά.");
    }
  }

  async function handleDelete() {
    if (!article) return;
    setStatus("saving");
    try {
      if (article.imageUrl) {
        await deleteNewsImage(article.imageUrl);
      }
      await deleteNewsItem(article.id);
      setStatusMessage("Το άρθρο διαγράφηκε.");
      router.push("/admin/news");
    } catch (error) {
      console.error("Delete error:", error);
      setStatus("error");
      setStatusMessage("Σφάλμα κατά τη διαγραφή.");
    }
  }

  const previewContent =
    previewLocale === "el"
      ? form.content_el
      : (form.content_en || form.content_el);

  // Count total errors for the summary banner
  const errorCount = Object.keys(errors).length;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Status message */}
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-lg text-sm ${
            status === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : status === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : ""
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Validation error summary */}
      {errorCount > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200 flex items-start gap-3"
        >
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">
              {errorCount === 1
                ? "Υπάρχει 1 σφάλμα στη φόρμα."
                : `Υπάρχουν ${errorCount} σφάλματα στη φόρμα.`}
            </p>
            <p className="text-xs mt-1 text-red-600">
              Διορθώστε τα παρακάτω πεδία για να συνεχίσετε.
            </p>
          </div>
        </div>
      )}

      {/* ── Greek Fields (Required) ── */}
      <fieldset className="space-y-5">
        <legend
          className="text-lg font-light text-[#2c2c2c] mb-4 flex items-center gap-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
          Ελληνικά (υποχρεωτικό)
        </legend>

        {/* Title (Greek) */}
        <div data-field="title_el">
          <label
            htmlFor="title_el"
            className={`form-label ${hasError("title_el") ? "is-invalid" : ""}`}
          >
            Τίτλος (Ελληνικά) <span className="text-red-500">*</span>
          </label>
          <input
            id="title_el"
            type="text"
            value={form.title_el}
            onChange={(e) => updateField("title_el", e.target.value)}
            className="form-input"
            aria-invalid={hasError("title_el")}
            aria-describedby={hasError("title_el") ? "title_el-error" : undefined}
            maxLength={200}
          />
          {errors.title_el && (
            <p id="title_el-error" className="form-error" role="alert">{errors.title_el}</p>
          )}
        </div>

        {/* Content (Greek) */}
        <div data-field="content_el">
          <label
            className={`form-label ${hasError("content_el") ? "is-invalid" : ""}`}
          >
            Περιεχόμενο (Ελληνικά) <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            content={form.content_el}
            onChange={(html) => updateField("content_el", html)}
            placeholder="Γράψτε το περιεχόμενο του άρθρου..."
            id="content_el"
            ariaInvalid={hasError("content_el")}
            ariaDescribedby={hasError("content_el") ? "content_el-error" : undefined}
          />
          {errors.content_el && (
            <p id="content_el-error" className="form-error" role="alert">{errors.content_el}</p>
          )}
        </div>

        {/* Excerpt (Greek) */}
        <div data-field="excerpt_el">
          <label
            htmlFor="excerpt_el"
            className={`form-label ${hasError("excerpt_el") ? "is-invalid" : ""}`}
          >
            Σύνοψη (Ελληνικά)
          </label>
          <textarea
            id="excerpt_el"
            value={form.excerpt_el}
            onChange={(e) => updateField("excerpt_el", e.target.value)}
            className="form-input"
            rows={3}
            maxLength={500}
            aria-invalid={hasError("excerpt_el")}
            aria-describedby={hasError("excerpt_el") ? "excerpt_el-error" : undefined}
          />
          {errors.excerpt_el && (
            <p id="excerpt_el-error" className="form-error" role="alert">{errors.excerpt_el}</p>
          )}
        </div>
      </fieldset>

      {/* ── English Fields (Optional) ── */}
      <fieldset className="space-y-5">
        <legend
          className="text-lg font-light text-[#2c2c2c] mb-4 flex items-center gap-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span className="w-2 h-2 rounded-full bg-gray-400" aria-hidden="true" />
          English (προαιρετικό)
        </legend>

        {/* Title (English) */}
        <div data-field="title_en">
          <label
            htmlFor="title_en"
            className={`form-label ${hasError("title_en") ? "is-invalid" : ""}`}
          >
            Title (English)
          </label>
          <input
            id="title_en"
            type="text"
            value={form.title_en}
            onChange={(e) => updateField("title_en", e.target.value)}
            className="form-input"
            aria-invalid={hasError("title_en")}
            aria-describedby={hasError("title_en") ? "title_en-error" : undefined}
            maxLength={200}
          />
          {errors.title_en && (
            <p id="title_en-error" className="form-error" role="alert">{errors.title_en}</p>
          )}
        </div>

        {/* Content (English) */}
        <div data-field="content_en">
          <label
            className={`form-label ${hasError("content_en") ? "is-invalid" : ""}`}
          >
            Content (English)
          </label>
          <RichTextEditor
            content={form.content_en}
            onChange={(html) => updateField("content_en", html)}
            placeholder="Write the article content in English..."
            id="content_en"
            ariaInvalid={hasError("content_en")}
            ariaDescribedby={hasError("content_en") ? "content_en-error" : undefined}
          />
          {errors.content_en && (
            <p id="content_en-error" className="form-error" role="alert">{errors.content_en}</p>
          )}
        </div>

        {/* Excerpt (English) */}
        <div data-field="excerpt_en">
          <label
            htmlFor="excerpt_en"
            className={`form-label ${hasError("excerpt_en") ? "is-invalid" : ""}`}
          >
            Excerpt (English)
          </label>
          <textarea
            id="excerpt_en"
            value={form.excerpt_en}
            onChange={(e) => updateField("excerpt_en", e.target.value)}
            className="form-input"
            rows={3}
            maxLength={500}
            aria-invalid={hasError("excerpt_en")}
            aria-describedby={hasError("excerpt_en") ? "excerpt_en-error" : undefined}
          />
          {errors.excerpt_en && (
            <p id="excerpt_en-error" className="form-error" role="alert">{errors.excerpt_en}</p>
          )}
        </div>
      </fieldset>

      {/* ── Image ── */}
      <fieldset className="space-y-4" data-field="image">
        <legend
          className="text-lg font-light text-[#2c2c2c] mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Εικόνα
        </legend>

        {imagePreview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Προεπισκόπηση"
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-red-600 text-xs px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              Αφαίρεση
            </button>
          </div>
        ) : (
          <label
            className={`block cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              hasError("image")
                ? "border-red-300 bg-red-50/30 hover:border-red-400"
                : "border-[var(--color-border)] hover:border-[var(--color-gold)]"
            }`}
          >
            <span className="text-3xl block mb-2" aria-hidden="true">📷</span>
            <span className="text-sm text-[var(--color-text-muted)]">
              Ανεβάστε εικόνα (JPG, PNG, WebP — μέγ. 5MB)
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>
        )}
        {errors.image && (
          <p className="form-error" role="alert">{errors.image}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-field="imageAlt_el">
            <label
              htmlFor="imageAlt_el"
              className={`form-label ${hasError("imageAlt_el") ? "is-invalid" : ""}`}
            >
              Alt εικόνας (Ελληνικά)
            </label>
            <input
              id="imageAlt_el"
              type="text"
              value={form.imageAlt_el}
              onChange={(e) => updateField("imageAlt_el", e.target.value)}
              className="form-input"
              aria-invalid={hasError("imageAlt_el")}
              maxLength={200}
            />
            {errors.imageAlt_el && (
              <p className="form-error" role="alert">{errors.imageAlt_el}</p>
            )}
          </div>
          <div data-field="imageAlt_en">
            <label
              htmlFor="imageAlt_en"
              className={`form-label ${hasError("imageAlt_en") ? "is-invalid" : ""}`}
            >
              Alt εικόνας (English)
            </label>
            <input
              id="imageAlt_en"
              type="text"
              value={form.imageAlt_en}
              onChange={(e) => updateField("imageAlt_en", e.target.value)}
              className="form-input"
              aria-invalid={hasError("imageAlt_en")}
              maxLength={200}
            />
            {errors.imageAlt_en && (
              <p className="form-error" role="alert">{errors.imageAlt_en}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ── Metadata ── */}
      <fieldset className="space-y-5">
        <legend
          className="text-lg font-light text-[#2c2c2c] mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Ρυθμίσεις
        </legend>

        <div data-field="author">
          <label
            htmlFor="author"
            className={`form-label ${hasError("author") ? "is-invalid" : ""}`}
          >
            Συγγραφέας <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            type="text"
            value={form.author}
            onChange={(e) => updateField("author", e.target.value)}
            className="form-input"
            aria-invalid={hasError("author")}
            aria-describedby={hasError("author") ? "author-error" : undefined}
            maxLength={100}
          />
          {errors.author && (
            <p id="author-error" className="form-error" role="alert">{errors.author}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
              className="w-4 h-4 accent-[#c69d53] rounded"
            />
            <span className="text-sm text-[#2c2c2c]">Δημοσίευση</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              className="w-4 h-4 accent-[#c69d53] rounded"
            />
            <span className="text-sm text-[#2c2c2c]">Προβολή στην Αρχική Σελίδα</span>
          </label>
        </div>
      </fieldset>

      {/* ── Preview ── */}
      <div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm tracking-wider text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors"
        >
          {showPreview ? "Κλείσιμο Προεπισκόπησης" : "Προεπισκόπηση"}
        </button>

        {showPreview && (
          <div className="mt-4 border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="flex border-b border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setPreviewLocale("el")}
                className={`px-4 py-2 text-xs tracking-wider transition-colors ${
                  previewLocale === "el"
                    ? "bg-[var(--color-gold)] text-white"
                    : "text-[var(--color-text-muted)] hover:bg-gray-50"
                }`}
              >
                Ελληνικά
              </button>
              <button
                type="button"
                onClick={() => setPreviewLocale("en")}
                className={`px-4 py-2 text-xs tracking-wider transition-colors ${
                  previewLocale === "en"
                    ? "bg-[var(--color-gold)] text-white"
                    : "text-[var(--color-text-muted)] hover:bg-gray-50"
                }`}
              >
                English
              </button>
            </div>
            <div
              className="p-6 prose prose-sm max-w-none prose-headings:font-light prose-headings:tracking-wide prose-a:text-[var(--color-gold)] prose-blockquote:border-l-[var(--color-gold)]"
              dangerouslySetInnerHTML={{
                __html: previewContent
                  ? DOMPurify.sanitize(previewContent)
                  : "<p><em>Δεν υπάρχει περιεχόμενο.</em></p>",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={status === "saving"}
          className="btn btn-gold"
        >
          {status === "saving" ? "Αποθήκευση..." : "Αποθήκευση"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          className="btn btn-outline"
        >
          Ακύρωση
        </button>

        {isEdit && (
          <>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-red-600">Είστε σίγουροι;</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Ναι, Διαγραφή
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Όχι
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-500 hover:text-red-700 transition-colors ml-auto"
              >
                Διαγραφή
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
}

import type { CreateNewsInput } from "@/types/news";

// ── HTML sanitization ──────────────────────────────────────────────
// Server-side defense-in-depth: strips dangerous HTML before Firestore write.
// The public rendering layer also sanitizes with DOMPurify on the client.

const SCRIPT_TAG_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi;
const EVENT_HANDLER_RE = /\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const IFRAME_TAG_RE = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe\s*>/gi;
const FORM_TAG_RE = /<\/?form\b[^>]*>/gi;
const OBJECT_TAG_RE = /<\/?object\b[^>]*>/gi;
const EMBED_TAG_RE = /<\/?embed\b[^>]*>/gi;

export function sanitizeHtml(content: string): string {
  return content
    .replace(SCRIPT_TAG_RE, "")
    .replace(EVENT_HANDLER_RE, "")
    .replace(IFRAME_TAG_RE, "")
    .replace(FORM_TAG_RE, "")
    .replace(OBJECT_TAG_RE, "")
    .replace(EMBED_TAG_RE, "");
}

// ── Helpers ────────────────────────────────────────────────────────

/** Strip all HTML tags, returning only the text content. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Check if an HTML string is "empty" (only has empty tags like <p></p>). */
function isHtmlEmpty(html: string): boolean {
  return stripHtml(html).length === 0;
}

// ── Image validation ───────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/** Returns an error message string, or null if the file is valid. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Μόνο αρχεία JPG, PNG ή WebP επιτρέπονται.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Το αρχείο πρέπει να είναι μικρότερο από ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return null;
}

// ── News input validation ──────────────────────────────────────────

type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: Record<string, string> };

/**
 * Require a non-empty plain string (for titles, author, etc.).
 * Returns an error message or null.
 */
function requireString(value: unknown, fieldLabel: string, max: number): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return `Το πεδίο «${fieldLabel}» είναι υποχρεωτικό.`;
  }
  if (value.trim().length > max) {
    return `Το πεδίο «${fieldLabel}» πρέπει να είναι έως ${max} χαρακτήρες.`;
  }
  return null;
}

/**
 * Require non-empty rich-text (HTML) content.
 * TipTap outputs `<p></p>` for an empty editor, so we strip tags first.
 */
function requireHtmlContent(value: unknown, fieldLabel: string, max: number): string | null {
  if (typeof value !== "string" || isHtmlEmpty(value)) {
    return `Το πεδίο «${fieldLabel}» είναι υποχρεωτικό.`;
  }
  if (stripHtml(value).length > max) {
    return `Το πεδίο «${fieldLabel}» πρέπει να είναι έως ${max} χαρακτήρες (κείμενο).`;
  }
  return null;
}

/**
 * Validate an optional plain string field.
 * Returns an error message if the value is present but invalid.
 */
function optionalString(value: unknown, fieldLabel: string, max: number): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return `Το πεδίο «${fieldLabel}»: μη έγκυρη τιμή.`;
  if (value.trim().length > max) {
    return `Το πεδίο «${fieldLabel}» πρέπει να είναι έως ${max} χαρακτήρες.`;
  }
  return null;
}

/**
 * Validate optional rich-text (HTML) content.
 * Returns an error message if the value is present but too long.
 */
function optionalHtmlContent(value: unknown, fieldLabel: string, max: number): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return `Το πεδίο «${fieldLabel}»: μη έγκυρη τιμή.`;
  if (isHtmlEmpty(value)) return null; // treat empty HTML as "not provided"
  if (stripHtml(value).length > max) {
    return `Το πεδίο «${fieldLabel}» πρέπει να είναι έως ${max} χαρακτήρες (κείμενο).`;
  }
  return null;
}

/** Convert a value to a trimmed string or undefined (for optional Firestore fields). */
function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Convert an HTML value to sanitized string or undefined. */
function toOptionalHtml(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (isHtmlEmpty(value)) return undefined;
  return sanitizeHtml(value);
}

// ── Create validation ──────────────────────────────────────────────

export function validateNewsInput(
  data: Record<string, unknown>,
): ValidationResult<CreateNewsInput> {
  const errors: Record<string, string> = {};

  // Required fields
  const titleElErr = requireString(data.title_el, "Τίτλος (Ελληνικά)", 200);
  if (titleElErr) errors.title_el = titleElErr;

  const contentElErr = requireHtmlContent(data.content_el, "Περιεχόμενο (Ελληνικά)", 50_000);
  if (contentElErr) errors.content_el = contentElErr;

  const authorErr = requireString(data.author, "Συγγραφέας", 100);
  if (authorErr) errors.author = authorErr;

  // Optional fields — only validate if provided
  const titleEnErr = optionalString(data.title_en, "Τίτλος (Αγγλικά)", 200);
  if (titleEnErr) errors.title_en = titleEnErr;

  const contentEnErr = optionalHtmlContent(data.content_en, "Περιεχόμενο (Αγγλικά)", 50_000);
  if (contentEnErr) errors.content_en = contentEnErr;

  const excerptElErr = optionalString(data.excerpt_el, "Σύνοψη (Ελληνικά)", 500);
  if (excerptElErr) errors.excerpt_el = excerptElErr;

  const excerptEnErr = optionalString(data.excerpt_en, "Σύνοψη (Αγγλικά)", 500);
  if (excerptEnErr) errors.excerpt_en = excerptEnErr;

  const imgAltElErr = optionalString(data.imageAlt_el, "Alt εικόνας (Ελληνικά)", 200);
  if (imgAltElErr) errors.imageAlt_el = imgAltElErr;

  const imgAltEnErr = optionalString(data.imageAlt_en, "Alt εικόνας (Αγγλικά)", 200);
  if (imgAltEnErr) errors.imageAlt_en = imgAltEnErr;

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  // Build the clean payload — optional fields are `undefined` (omitted from Firestore)
  const input: CreateNewsInput = {
    title_el: (data.title_el as string).trim(),
    title_en: toOptionalString(data.title_en),
    content_el: sanitizeHtml(data.content_el as string),
    content_en: toOptionalHtml(data.content_en),
    excerpt_el: toOptionalString(data.excerpt_el),
    excerpt_en: toOptionalString(data.excerpt_en),
    imageUrl: toOptionalString(data.imageUrl),
    imageAlt_el: toOptionalString(data.imageAlt_el),
    imageAlt_en: toOptionalString(data.imageAlt_en),
    author: (data.author as string).trim(),
    featured: Boolean(data.featured),
    published: Boolean(data.published),
  };

  return { valid: true, data: input };
}

// ── Update validation ──────────────────────────────────────────────

export function validateNewsUpdate(
  data: Record<string, unknown>,
): ValidationResult<Partial<CreateNewsInput>> {
  const errors: Record<string, string> = {};

  // Required fields — validate only if present in payload
  if ("title_el" in data) {
    const err = requireString(data.title_el, "Τίτλος (Ελληνικά)", 200);
    if (err) errors.title_el = err;
  }
  if ("content_el" in data) {
    const err = requireHtmlContent(data.content_el, "Περιεχόμενο (Ελληνικά)", 50_000);
    if (err) errors.content_el = err;
  }
  if ("author" in data) {
    const err = requireString(data.author, "Συγγραφέας", 100);
    if (err) errors.author = err;
  }

  // Optional fields
  if ("title_en" in data) {
    const err = optionalString(data.title_en, "Τίτλος (Αγγλικά)", 200);
    if (err) errors.title_en = err;
  }
  if ("content_en" in data) {
    const err = optionalHtmlContent(data.content_en, "Περιεχόμενο (Αγγλικά)", 50_000);
    if (err) errors.content_en = err;
  }
  if ("excerpt_el" in data) {
    const err = optionalString(data.excerpt_el, "Σύνοψη (Ελληνικά)", 500);
    if (err) errors.excerpt_el = err;
  }
  if ("excerpt_en" in data) {
    const err = optionalString(data.excerpt_en, "Σύνοψη (Αγγλικά)", 500);
    if (err) errors.excerpt_en = err;
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  // Build the clean partial — use `undefined` for cleared optional fields
  const update: Partial<CreateNewsInput> = {};

  if ("title_el" in data) update.title_el = (data.title_el as string).trim();
  if ("title_en" in data) update.title_en = toOptionalString(data.title_en);
  if ("content_el" in data) update.content_el = sanitizeHtml(data.content_el as string);
  if ("content_en" in data) update.content_en = toOptionalHtml(data.content_en);
  if ("excerpt_el" in data) update.excerpt_el = toOptionalString(data.excerpt_el);
  if ("excerpt_en" in data) update.excerpt_en = toOptionalString(data.excerpt_en);
  if ("imageUrl" in data) update.imageUrl = toOptionalString(data.imageUrl);
  if ("imageAlt_el" in data) update.imageAlt_el = toOptionalString(data.imageAlt_el);
  if ("imageAlt_en" in data) update.imageAlt_en = toOptionalString(data.imageAlt_en);
  if ("author" in data) update.author = (data.author as string).trim();
  if ("featured" in data) update.featured = Boolean(data.featured);
  if ("published" in data) update.published = Boolean(data.published);

  return { valid: true, data: update };
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface FormState {
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

/**
 * Contact form with client-side validation and submission feedback.
 * Currently uses a mailto fallback; will be wired to an API route in Week 5.
 * Validates all fields before submission and shows accessible error/success messages.
 */
export default function ContactForm() {
  const t = useTranslations("contact.form");

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    inquiryType: "general",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const inquiryTypes = [
    { value: "general", label: t("inquiryTypes.general") },
    { value: "tasting", label: t("inquiryTypes.tasting") },
    { value: "wholesale", label: t("inquiryTypes.wholesale") },
    { value: "visit", label: t("inquiryTypes.visit") },
    { value: "other", label: t("inquiryTypes.other") },
  ];

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Valid email required";
    if (!form.message.trim() || form.message.length < 10) next.message = "Required (min 10 chars)";
    if (form.message.length > 5000) next.message = "Max 5000 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");

    try {
      // TODO (Week 5): replace with POST to /api/contact with rate limiting
      // For now, open mailto as a graceful fallback
      const subject = encodeURIComponent(form.subject || form.inquiryType);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nType: ${form.inquiryType}\n\n${form.message}`
      );
      window.location.href = `mailto:info@argatia.gr?subject=${subject}&body=${body}`;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  if (status === "success") {
    return (
      <div
        role="alert"
        className="p-8 bg-green-50 border border-green-200 rounded-xl text-center"
      >
        <p className="text-4xl mb-4" aria-hidden="true">✓</p>
        <p className="text-[var(--color-dark)] font-light">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={t("title")} className="space-y-6">
      <h2 className="text-2xl font-light mb-6" style={{ fontFamily: "Georgia, serif" }}>
        {t("title")}
      </h2>

      {status === "error" && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {t("error")}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="form-label">
          {t("name")} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder={t("namePlaceholder")}
          className={`form-input ${errors.name ? "border-red-400" : ""}`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          maxLength={100}
          required
        />
        {errors.name && (
          <p id="name-error" role="alert" className="form-error">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="form-label">
          {t("email")} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder={t("emailPlaceholder")}
          className={`form-input ${errors.email ? "border-red-400" : ""}`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          maxLength={254}
          required
        />
        {errors.email && (
          <p id="email-error" role="alert" className="form-error">{errors.email}</p>
        )}
      </div>

      {/* Inquiry type */}
      <div>
        <label htmlFor="inquiryType" className="form-label">{t("inquiryType")}</label>
        <select
          id="inquiryType"
          name="inquiryType"
          value={form.inquiryType}
          onChange={handleChange}
          className="form-input"
        >
          {inquiryTypes.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="form-label">{t("subject")}</label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          placeholder={t("subjectPlaceholder")}
          className="form-input"
          maxLength={200}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="form-label">
          {t("message")} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder={t("messagePlaceholder")}
          rows={6}
          className={`form-input resize-none ${errors.message ? "border-red-400" : ""}`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          maxLength={5000}
          required
        />
        {errors.message && (
          <p id="message-error" role="alert" className="form-error">{errors.message}</p>
        )}
        <p className="text-xs text-[var(--color-text-muted)] mt-1 text-right">
          {form.message.length}/5000
        </p>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-gold w-full text-sm tracking-widest uppercase disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

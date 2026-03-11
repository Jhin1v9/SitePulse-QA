"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

interface ContactFormLabels {
  fields: {
    name: string;
    email: string;
    company: string;
    message: string;
  };
  placeholders: {
    name: string;
    email: string;
    company: string;
    message: string;
  };
  validation: {
    name: string;
    email: string;
    company: string;
    message: string;
  };
  submit: string;
  submitting: string;
  success: string;
  error: string;
}

interface ContactFormProps {
  labels: ContactFormLabels;
}

interface ContactPayload {
  name: string;
  email: string;
  company: string;
  message: string;
}

function validatePayload(payload: ContactPayload, labels: ContactFormLabels) {
  if (payload.name.trim().length < 2) return labels.validation.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) return labels.validation.email;
  if (payload.company.trim().length < 2) return labels.validation.company;
  if (payload.message.trim().length < 30) return labels.validation.message;
  return null;
}

export function ContactForm({ labels }: ContactFormProps) {
  const [payload, setPayload] = useState<ContactPayload>({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      payload.name.trim().length > 0 &&
      payload.email.trim().length > 0 &&
      payload.company.trim().length > 0 &&
      payload.message.trim().length > 0
    );
  }, [payload]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validatePayload(payload, labels);
    if (validationError) {
      setSuccess("");
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(labels.error);
        return;
      }

      setSuccess(labels.success);
      setPayload({ name: "", email: "", company: "", message: "" });
    } catch {
      setError(labels.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 grid min-w-0 gap-4">
      <div className="grid gap-2">
        <label htmlFor="contact-name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {labels.fields.name}
        </label>
        <input
          id="contact-name"
          type="text"
          className="input-base"
          placeholder={labels.placeholders.name}
          value={payload.name}
          onChange={(event) => setPayload((previous) => ({ ...previous, name: event.target.value }))}
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="contact-email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {labels.fields.email}
        </label>
        <input
          id="contact-email"
          type="email"
          className="input-base"
          placeholder={labels.placeholders.email}
          value={payload.email}
          onChange={(event) => setPayload((previous) => ({ ...previous, email: event.target.value }))}
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="contact-company" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {labels.fields.company}
        </label>
        <input
          id="contact-company"
          type="text"
          className="input-base"
          placeholder={labels.placeholders.company}
          value={payload.company}
          onChange={(event) => setPayload((previous) => ({ ...previous, company: event.target.value }))}
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="contact-message" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {labels.fields.message}
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-600 dark:bg-slate-950/70 dark:text-slate-100"
          placeholder={labels.placeholders.message}
          value={payload.message}
          onChange={(event) => setPayload((previous) => ({ ...previous, message: event.target.value }))}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !canSubmit}
        className="inline-flex h-11 items-center justify-center rounded-full border border-studio-400/70 bg-studio-500/20 px-5 text-sm font-semibold text-studio-700 transition hover:bg-studio-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 disabled:cursor-not-allowed disabled:opacity-60 dark:text-studio-100"
      >
        {submitting ? labels.submitting : labels.submit}
      </button>

      <p className="min-h-5 text-sm text-rose-600 dark:text-rose-300" role="alert" aria-live="polite">
        {error}
      </p>
      <p className="min-h-5 text-sm text-emerald-700 dark:text-emerald-300" role="status" aria-live="polite">
        {success}
      </p>
    </form>
  );
}

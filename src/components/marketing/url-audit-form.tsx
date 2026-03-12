"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/src/i18n/config";
import { buildLocalizedPath } from "@/src/i18n/path";

type FormState = "idle" | "error" | "loading" | "success";

interface UrlAuditFormProps {
  locale: Locale;
  inputLabel: string;
  inputPlaceholder: string;
  submitLabel: string;
  secondaryLabel: string;
  errorText: string;
  loadingText: string;
  successText: string;
  compact?: boolean;
}

function isValidTargetUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function UrlAuditForm({
  locale,
  inputLabel,
  inputPlaceholder,
  submitLabel,
  secondaryLabel,
  errorText,
  loadingText,
  successText,
  compact,
}: UrlAuditFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [state, setState] = useState<FormState>("idle");

  const statusText =
    state === "error" ? errorText : state === "loading" ? loadingText : state === "success" ? successText : "";

  const statusClassName =
    state === "error"
      ? "text-rose-600 dark:text-rose-300"
      : state === "success"
        ? "text-emerald-700 dark:text-emerald-300"
        : "text-slate-600 dark:text-slate-300";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = url.trim();
    if (!isValidTargetUrl(target)) {
      setState("error");
      return;
    }

    setState("loading");
    await new Promise((resolve) => {
      window.setTimeout(resolve, 450);
    });
    setState("success");

    const href = `${buildLocalizedPath(locale, "demo")}?target=${encodeURIComponent(target)}`;
    router.push(href);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-[1.6rem] border border-slate-300/70 bg-white/80 p-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 ${
        compact ? "" : "shadow-[0_24px_70px_rgba(15,23,42,0.14)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
      }`}
    >
      <label htmlFor={`${compact ? "cta" : "hero"}-url`} className="sr-only">
        {inputLabel}
      </label>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
        <input
          id={`${compact ? "cta" : "hero"}-url`}
          type="url"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (state !== "idle") setState("idle");
          }}
          className="input-base min-w-0 flex-1 rounded-2xl"
          placeholder={inputPlaceholder}
          aria-invalid={state === "error"}
          required
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-studio-500 via-cyan-500 to-sky-500 px-5 text-sm font-semibold text-white shadow-[0_16px_44px_rgba(8,145,178,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 sm:w-auto"
        >
          {submitLabel}
        </button>
        <Link
          href={buildLocalizedPath(locale, "downloads")}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 hover:text-studio-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-studio-100 sm:w-auto"
        >
          {secondaryLabel}
        </Link>
      </div>
      <p className={`mt-2 min-h-5 text-xs ${statusClassName}`}>{statusText}</p>
    </form>
  );
}

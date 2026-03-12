"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { MarketingContent } from "@/src/config/marketing-content";
import type { Locale } from "@/src/i18n/config";
import { buildLocalizedPath } from "@/src/i18n/path";

type SimulationState = "idle" | "error" | "running" | "ready";

interface HeroExperienceProps {
  locale: Locale;
  eyebrow: string;
  content: MarketingContent["hero"];
  inputLabel: string;
  inputPlaceholder: string;
  submitLabel: string;
  secondaryLabel: string;
  trustBadges: readonly string[];
  errorText: string;
  loadingText: string;
  successText: string;
  previewRecommendation: string;
}

function isValidTargetUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function extractDomain(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return "sitepulse.studio";
  }
}

export function HeroExperience({
  locale,
  eyebrow,
  content,
  inputLabel,
  inputPlaceholder,
  submitLabel,
  secondaryLabel,
  trustBadges,
  errorText,
  loadingText,
  successText,
  previewRecommendation,
}: HeroExperienceProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [state, setState] = useState<SimulationState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [scoreValue, setScoreValue] = useState("--");
  const [issueValue, setIssueValue] = useState("--");
  const [targetDomain, setTargetDomain] = useState("sitepulse.studio");
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
      timersRef.current = [];
    };
  }, []);

  const statusText =
    state === "error"
      ? errorText
      : state === "running"
        ? loadingText
        : state === "ready"
          ? successText
          : content.statusIdle;

  const previewStatus = state === "running" ? content.statusRunning : state === "ready" ? content.statusReady : content.statusIdle;

  const statusClassName =
    state === "error"
      ? "text-rose-600 dark:text-rose-300"
      : state === "ready"
        ? "text-emerald-700 dark:text-emerald-300"
        : "text-slate-600 dark:text-slate-300";

  const recommendationText = useMemo(() => {
    if (state === "running") {
      return content.steps[Math.min(activeStep, content.steps.length - 1)]?.detail ?? previewRecommendation;
    }

    if (state === "ready") {
      return previewRecommendation;
    }

    return content.liveSummary;
  }, [activeStep, content.liveSummary, content.steps, previewRecommendation, state]);

  const clearTimers = () => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = url.trim();

    if (!isValidTargetUrl(target)) {
      clearTimers();
      setState("error");
      setActiveStep(0);
      setScoreValue("--");
      setIssueValue("--");
      return;
    }

    clearTimers();
    setState("running");
    setActiveStep(0);
    setScoreValue("--");
    setIssueValue("--");
    setTargetDomain(extractDomain(target));

    timersRef.current.push(
      window.setTimeout(() => setActiveStep(1), 320),
      window.setTimeout(() => setActiveStep(2), 820),
      window.setTimeout(() => {
        setScoreValue("87/100");
        setIssueValue("6");
        setState("ready");
      }, 1380),
      window.setTimeout(() => {
        router.push(`${buildLocalizedPath(locale, "demo")}?target=${encodeURIComponent(target)}`);
      }, 2350),
    );
  };

  return (
    <section className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center">
      <div className="min-w-0 space-y-6 lg:space-y-7">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-studio-600 dark:text-studio-200">{eyebrow}</p>
          <h1 className="max-w-3xl text-balance font-heading text-[clamp(2.3rem,5.5vw,4.6rem)] font-semibold leading-[0.98] text-slate-950 dark:text-slate-50">
            {content.title}
          </h1>
          <p className="max-w-2xl text-[clamp(1rem,2vw,1.15rem)] leading-8 text-slate-700 dark:text-slate-300">
            {content.subtitle}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[1.75rem] border border-slate-300/80 bg-white/90 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/70 dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:p-5"
        >
          <label htmlFor="hero-platform-url" className="sr-only">
            {inputLabel}
          </label>
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row">
            <input
              id="hero-platform-url"
              type="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                if (state !== "idle") {
                  setState("idle");
                  setActiveStep(0);
                  setScoreValue("--");
                  setIssueValue("--");
                }
              }}
              className="input-base h-12 min-w-0 flex-1 rounded-2xl"
              placeholder={inputPlaceholder}
              aria-invalid={state === "error"}
            />
            <button
              type="submit"
              disabled={state === "running"}
              className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-studio-500 via-cyan-500 to-sky-500 px-5 text-sm font-semibold text-white shadow-[0_16px_44px_rgba(8,145,178,0.32)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 disabled:cursor-not-allowed disabled:opacity-75 lg:w-auto"
            >
              {submitLabel}
            </button>
            <Link
              href={buildLocalizedPath(locale, "downloads")}
              prefetch={false}
              className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white/75 px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 hover:text-studio-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-studio-100 lg:w-auto"
            >
              {secondaryLabel}
            </Link>
          </div>
          <p className={`mt-3 min-h-5 text-sm ${statusClassName}`} aria-live="polite" role={state === "error" ? "alert" : "status"}>
            {statusText}
          </p>
        </form>

        <div className="flex min-w-0 flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] leading-relaxed text-slate-600 dark:text-slate-300">
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-slate-300/80 bg-white/70 px-3 py-1.5 dark:border-slate-700/80 dark:bg-slate-900/70"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="panel min-w-0 overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-studio-600 dark:text-studio-200">
                {content.studioEyebrow}
              </p>
              <h2 className="text-[clamp(1.25rem,2.8vw,1.8rem)] font-semibold text-slate-950 dark:text-slate-100">
                {content.liveLabel}
              </h2>
            </div>
            <span className="inline-flex h-10 items-center rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
              {previewStatus}
            </span>
          </div>

          <div className="rounded-[1.4rem] border border-slate-300/80 bg-white/80 p-4 dark:border-slate-700/80 dark:bg-slate-950/60">
            <div className="flex min-w-0 items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="truncate">{targetDomain}</span>
              <span className="rounded-full border border-slate-300/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] dark:border-slate-700/80">
                {previewStatus}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{content.liveSummary}</p>
          </div>

          <ol className="grid min-w-0 gap-4">
            {content.steps.map((step, index) => {
              const isActive = state !== "error" && index <= activeStep;
              return (
                <li
                  key={step.label}
                  className={`rounded-[1.2rem] border p-4 transition ${
                    isActive
                      ? "border-studio-400/70 bg-studio-500/10 shadow-[0_12px_30px_rgba(8,145,178,0.12)]"
                      : "border-slate-300/80 bg-white/70 dark:border-slate-700/80 dark:bg-slate-900/60"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-studio-500 text-white"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold text-slate-950 dark:text-slate-100">{step.label}</p>
                      <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{step.detail}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <article className="rounded-[1.2rem] border border-slate-300/80 bg-white/80 p-4 dark:border-slate-700/80 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{content.scoreLabel}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-100">{scoreValue}</p>
            </article>
            <article className="rounded-[1.2rem] border border-slate-300/80 bg-white/80 p-4 dark:border-slate-700/80 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{content.issueLabel}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-100">{issueValue}</p>
            </article>
            <article className="rounded-[1.2rem] border border-slate-300/80 bg-white/80 p-4 sm:col-span-2 dark:border-slate-700/80 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {content.recommendationLabel}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{recommendationText}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

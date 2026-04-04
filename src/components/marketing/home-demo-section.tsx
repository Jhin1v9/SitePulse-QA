"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppPreviewGrid } from "@/src/components/app-preview-grid";
import { landingDemoEventName, type LandingDemoDetail } from "@/src/components/marketing/home-demo-event";
import type { HeroPreviewStep } from "@/src/config/marketing-content";
import type { AppPreview } from "@/src/config/showcase";

type DemoState = "idle" | "running" | "ready";

interface HomeDemoSectionLabels {
  eyebrow: string;
  title: string;
  description: string;
  targetLabel: string;
  stageLabel: string;
  summaryLabel: string;
  emptyHint: string;
}

interface HomeDemoSectionProps {
  labels: HomeDemoSectionLabels;
  steps: readonly HeroPreviewStep[];
  statusIdle: string;
  statusRunning: string;
  statusReady: string;
  scoreLabel: string;
  issueLabel: string;
  recommendationLabel: string;
  recommendationText: string;
  previews: readonly AppPreview[];
}

function extractDomain(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return "sitepulse.studio";
  }
}

export function HomeDemoSection({
  labels,
  steps,
  statusIdle,
  statusRunning,
  statusReady,
  scoreLabel,
  issueLabel,
  recommendationLabel,
  recommendationText,
  previews,
}: HomeDemoSectionProps) {
  const [state, setState] = useState<DemoState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [targetDomain, setTargetDomain] = useState("sitepulse.studio");
  const [scoreValue, setScoreValue] = useState("--");
  const [issueValue, setIssueValue] = useState("--");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
      timersRef.current = [];
    };

    const handleDemoEvent = (event: Event) => {
      const customEvent = event as CustomEvent<LandingDemoDetail>;
      const nextTarget = customEvent.detail?.target?.trim();

      if (!nextTarget) {
        return;
      }

      clearTimers();
      setTargetDomain(extractDomain(nextTarget));
      setState("running");
      setActiveStep(0);
      setScoreValue("--");
      setIssueValue("--");
      setIsHighlighted(true);

      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      timersRef.current.push(
        window.setTimeout(() => setActiveStep(1), 320),
        window.setTimeout(() => setActiveStep(2), 780),
        window.setTimeout(() => {
          setScoreValue("87/100");
          setIssueValue("6");
          setState("ready");
        }, 1320),
        window.setTimeout(() => setIsHighlighted(false), 2200),
      );
    };

    window.addEventListener(landingDemoEventName, handleDemoEvent as EventListener);

    return () => {
      clearTimers();
      window.removeEventListener(landingDemoEventName, handleDemoEvent as EventListener);
    };
  }, []);

  const statusLabel = state === "running" ? statusRunning : state === "ready" ? statusReady : statusIdle;
  const summaryText = useMemo(() => {
    if (state === "idle") {
      return labels.emptyHint;
    }

    if (state === "running") {
      return steps[Math.min(activeStep, steps.length - 1)]?.detail ?? labels.emptyHint;
    }

    return recommendationText;
  }, [activeStep, labels.emptyHint, recommendationText, state, steps]);

  return (
    <section
      id="landing-demo"
      ref={sectionRef}
      className={`section-shell section-shell--accent scroll-mt-28 space-y-6 transition duration-500 ${
        isHighlighted ? "ring-1 ring-studio-400/45 shadow-[0_18px_54px_rgba(45,212,191,0.12)]" : ""
      }`}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{labels.eyebrow}</p>
        <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">{labels.title}</h2>
        <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{labels.description}</p>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-6">
        <article className="panel min-w-0 rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studio-600 dark:text-studio-200">{labels.targetLabel}</p>
              <h3 className="text-[clamp(1.25rem,3vw,1.7rem)] font-semibold text-slate-950 dark:text-slate-100">{targetDomain}</h3>
            </div>
            <span className="inline-flex h-10 items-center rounded-full border border-studio-400/35 bg-studio-500/10 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-studio-700 dark:text-studio-100">
              {statusLabel}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.stageLabel}</p>
            <div className="grid min-w-0 gap-3">
              {steps.map((step, index) => {
                const isActive = state !== "idle" && index <= activeStep;

                return (
                  <article
                    key={step.label}
                    className={`rounded-[1.25rem] border p-4 transition ${
                      isActive
                        ? "border-studio-400/60 bg-studio-500/10"
                        : "border-slate-300/80 bg-white/75 dark:border-slate-700/80 dark:bg-slate-950/55"
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
                  </article>
                );
              })}
            </div>
          </div>
        </article>

        <article className="panel min-w-0 rounded-[1.8rem] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.summaryLabel}</p>
          <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.25rem] border border-slate-300/80 bg-white/75 p-4 dark:border-slate-700/80 dark:bg-slate-950/55">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{scoreLabel}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-100">{scoreValue}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-300/80 bg-white/75 p-4 dark:border-slate-700/80 dark:bg-slate-950/55">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{issueLabel}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-100">{issueValue}</p>
            </div>
          </div>
          <div className="mt-4 rounded-[1.25rem] border border-slate-300/80 bg-white/75 p-4 dark:border-slate-700/80 dark:bg-slate-950/55">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{recommendationLabel}</p>
            <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{summaryText}</p>
          </div>
        </article>
      </div>

      <AppPreviewGrid previews={previews} />
    </section>
  );
}

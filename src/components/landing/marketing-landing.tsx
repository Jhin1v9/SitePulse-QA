"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

interface FeatureItem {
  title: string;
  iconLabel: string;
  detail: string;
}

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
}

interface PlanItem {
  name: string;
  price: string;
  description: string;
  features: readonly string[];
  highlighted: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const features: readonly FeatureItem[] = [
  {
    title: "SEO Audit",
    iconLabel: "SEO",
    detail: "Detect indexing leaks, metadata issues and technical SEO blockers.",
  },
  {
    title: "Performance Analysis",
    iconLabel: "PERF",
    detail: "Find loading bottlenecks and Core Web Vitals that hurt conversion.",
  },
  {
    title: "Accessibility Scanner",
    iconLabel: "A11Y",
    detail: "Identify contrast, navigation and semantic issues for inclusive UX.",
  },
  {
    title: "Mobile Optimization",
    iconLabel: "MOB",
    detail: "Surface layout and interaction problems that reduce mobile retention.",
  },
  {
    title: "Security Checks",
    iconLabel: "SEC",
    detail: "Catch trust and security risks before they damage brand credibility.",
  },
  {
    title: "UX Improvements",
    iconLabel: "UX",
    detail: "Prioritize friction fixes that improve journeys and increase conversion.",
  },
];

const testimonials: readonly TestimonialItem[] = [
  {
    quote:
      "The report quality is excellent. It tells our developers exactly what to fix first.",
    name: "Mina K.",
    role: "Lead Engineer, SaaS Startup",
  },
  {
    quote:
      "We closed hidden SEO and mobile issues in one sprint and lifted qualified traffic.",
    name: "Carlos M.",
    role: "Agency Founder",
  },
  {
    quote: "Fast, clear and reliable. It became part of every release cycle in our company.",
    name: "Daniel R.",
    role: "Ecommerce Operator",
  },
];

const plans: readonly PlanItem[] = [
  {
    name: "Free",
    price: "$0",
    description: "Ideal for trying your first automated audits.",
    features: ["Basic audit", "Core checks", "Limited scans"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49/mo",
    description: "Best for teams that need continuous quality control.",
    features: ["Full AI suite", "Actionable fixes", "Unlimited scans"],
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$149/mo",
    description: "For multi-client operations and advanced workflows.",
    features: ["Multi-site reports", "White-label export", "Priority support"],
    highlighted: false,
  },
];

function buildAuditPath(urlValue: string): string {
  const value = urlValue.trim();
  return value ? `/demo?target=${encodeURIComponent(value)}` : "/demo";
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-200">
      {text}
    </p>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="max-w-3xl space-y-3">
      <h2 className="text-balance font-heading text-[clamp(1.8rem,3.8vw,3rem)] font-semibold leading-tight">
        {title}
      </h2>
      <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">{subtitle}</p>
    </div>
  );
}

export function MarketingLanding() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved = window.localStorage.getItem("sitepulse-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sitepulse-theme", theme);
  }, [theme]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildAuditPath(websiteUrl));
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="relative overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#040814] dark:text-slate-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-[8%] h-80 w-80 rounded-full bg-sky-400/30 blur-[120px] dark:bg-sky-500/30" />
          <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-cyan-300/30 blur-[120px] dark:bg-cyan-500/20" />
          <div className="absolute bottom-0 left-1/2 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-indigo-300/20 blur-[140px] dark:bg-indigo-500/20" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
          <motion.section initial="hidden" animate="show" variants={containerVariants} className="space-y-9">
            <motion.div variants={itemVariants} className="flex justify-end">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex h-10 items-center rounded-full border border-slate-300/80 bg-white/70 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 backdrop-blur-xl transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/20 dark:bg-white/[0.06] dark:text-slate-200"
              >
                {theme === "dark" ? "Switch to light" : "Switch to dark"}
              </button>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
              <motion.div variants={itemVariants} className="space-y-6">
                <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-200">
                  AI Audit Platform
                </span>
                <h1 className="text-balance font-heading text-[clamp(2.2rem,5.3vw,4.5rem)] font-semibold leading-[1.03] tracking-tight">
                  Discover why your website is losing customers
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  Run a full AI powered website audit in under 60 seconds.
                </p>
                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-300/70 bg-white/70 p-3 shadow-xl shadow-slate-200/60 backdrop-blur-2xl dark:border-white/15 dark:bg-white/[0.05] dark:shadow-black/30">
                  <label htmlFor="hero-url" className="sr-only">Website URL</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id="hero-url"
                      type="url"
                      placeholder="https://yourdomain.com"
                      value={websiteUrl}
                      onChange={(event) => setWebsiteUrl(event.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-300/80 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/15 dark:bg-[#071327] dark:text-slate-100"
                    />
                    <button type="submit" className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-400/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                      Analyze my website
                    </button>
                  </div>
                </form>
              </motion.div>

              <motion.div variants={itemVariants} className="rounded-3xl border border-slate-300/70 bg-white/65 p-5 shadow-2xl shadow-slate-300/50 backdrop-blur-2xl dark:border-white/15 dark:bg-white/[0.05] dark:shadow-black/35">
                <div className="rounded-2xl border border-slate-300/70 bg-slate-100/75 p-4 dark:border-white/10 dark:bg-[#081326]">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Audit dashboard preview</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-300/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Site score</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">82/100</p>
                    </div>
                    <div className="rounded-xl border border-slate-300/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Performance</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">91</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="rounded-lg bg-rose-500/10 px-3 py-2 text-rose-700 dark:text-rose-200">Critical SEO: missing canonical tags</li>
                    <li className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-700 dark:text-amber-200">Mobile: LCP above 2.5s</li>
                    <li className="rounded-lg bg-cyan-500/10 px-3 py-2 text-cyan-700 dark:text-cyan-200">Accessibility: low contrast links</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-24 space-y-8">
            <motion.div variants={itemVariants}><SectionLabel text="Section 2 - Problem" /><SectionTitle title="Most websites hide costly problems" subtitle="Slow loading, broken SEO, weak mobile experience, accessibility gaps and security risks silently reduce revenue." /></motion.div>
            <div className="grid gap-4 md:grid-cols-3">
              <motion.article variants={itemVariants} className="rounded-2xl border border-slate-300/70 bg-white/70 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.04] dark:shadow-black/30"><p className="text-3xl font-semibold">61%</p><p className="mt-3 text-sm">Websites with technical SEO blockers</p></motion.article>
              <motion.article variants={itemVariants} className="rounded-2xl border border-slate-300/70 bg-white/70 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.04] dark:shadow-black/30"><p className="text-3xl font-semibold">53%</p><p className="mt-3 text-sm">Users leave due to poor mobile UX</p></motion.article>
              <motion.article variants={itemVariants} className="rounded-2xl border border-slate-300/70 bg-white/70 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.04] dark:shadow-black/30"><p className="text-3xl font-semibold">7% / sec</p><p className="mt-3 text-sm">Conversion loss from load delay</p></motion.article>
            </div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-24 space-y-8">
            <motion.div variants={itemVariants}><SectionLabel text="Section 3 - Solution" /><SectionTitle title="How it works" subtitle="Step 1 Enter your website. Step 2 AI scans your site. Step 3 Get a full technical report with actionable fixes." /></motion.div>
            <div className="grid gap-4 lg:grid-cols-3">
              <motion.article variants={itemVariants} className="rounded-2xl border border-slate-300/70 bg-white/70 p-6 dark:border-white/15 dark:bg-white/[0.04]"><p className="text-sm font-semibold">Step 1</p><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Enter your website URL and launch the scan.</p></motion.article>
              <motion.article variants={itemVariants} className="rounded-2xl border border-slate-300/70 bg-white/70 p-6 dark:border-white/15 dark:bg-white/[0.04]"><p className="text-sm font-semibold">Step 2</p><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">AI audits SEO, performance, accessibility, mobile, security and UX.</p></motion.article>
              <motion.article variants={itemVariants} className="rounded-2xl border border-slate-300/70 bg-white/70 p-6 dark:border-white/15 dark:bg-white/[0.04]"><p className="text-sm font-semibold">Step 3</p><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Receive prioritized issues and practical fixes for your team.</p></motion.article>
            </div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-24 space-y-8">
            <motion.div variants={itemVariants}><SectionLabel text="Section 4 - Features" /><SectionTitle title="Core audit modules built for conversion teams" subtitle="Everything in one dashboard, no manual checklist chaos." /></motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <motion.article key={feature.title} variants={itemVariants} className="rounded-2xl border border-slate-300/70 bg-white/70 p-6 dark:border-white/15 dark:bg-white/[0.04]">
                  <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-400/10 px-2 text-[0.62rem] font-semibold tracking-[0.12em] text-sky-700 dark:text-sky-200">{feature.iconLabel}</span>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{feature.detail}</p>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-24 space-y-8">
            <motion.div variants={itemVariants}><SectionLabel text="Section 5 - Dashboard Preview" /><SectionTitle title="See your website score, error list and recommendations in one place" subtitle="Technical clarity for faster decisions and better release quality." /></motion.div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-24 space-y-8">
            <motion.div variants={itemVariants}><SectionLabel text="Section 6 - Benefits" /><SectionTitle title="Business outcomes that matter" subtitle="Get more traffic, improve rankings, fix critical errors, increase conversions and improve user experience." /></motion.div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-24 space-y-8">
            <motion.div variants={itemVariants}><SectionLabel text="Section 7 - Social Proof" /><SectionTitle title="What teams say after running their first audits" subtitle="Proof from developers, agencies and entrepreneurs." /></motion.div>
            <div className="grid gap-4 lg:grid-cols-3">
              {testimonials.map((item) => (
                <motion.article key={item.name} variants={itemVariants} className="rounded-2xl border border-slate-300/70 bg-white/70 p-6 dark:border-white/15 dark:bg-white/[0.04]">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"><span aria-hidden>&ldquo;</span>{item.quote}<span aria-hidden>&rdquo;</span></p>
                  <p className="mt-4 text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{item.role}</p>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-24">
            <motion.div variants={itemVariants} className="rounded-3xl border border-sky-300/50 bg-gradient-to-br from-white/80 via-cyan-100/60 to-sky-100/70 p-8 shadow-2xl shadow-cyan-200/50 backdrop-blur-2xl dark:border-cyan-300/30 dark:from-cyan-500/20 dark:via-sky-500/10 dark:to-indigo-500/15 dark:shadow-cyan-900/30 sm:p-10">
              <SectionLabel text="Section 8 - Call To Action" />
              <h2 className="mt-3 text-balance font-heading text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-tight">Run your first audit now</h2>
              <form onSubmit={handleSubmit} className="mt-6">
                <label htmlFor="cta-url" className="sr-only">Website URL</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input id="cta-url" type="url" placeholder="https://yourdomain.com" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} className="h-12 w-full rounded-xl border border-slate-300/80 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/20 dark:bg-[#071327] dark:text-slate-100" />
                  <button type="submit" className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-400/35 transition hover:brightness-110">Analyze my website</button>
                </div>
              </form>
            </motion.div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-24 space-y-8">
            <motion.div variants={itemVariants}><SectionLabel text="Section 9 - Pricing" /><SectionTitle title="Simple plans for any stage" subtitle="Free plan, Pro plan and Agency plan." /></motion.div>
            <div className="grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <motion.article key={plan.name} variants={itemVariants} className={`rounded-2xl border p-6 ${plan.highlighted ? "border-cyan-300/60 bg-cyan-500/10 dark:border-cyan-300/45 dark:bg-cyan-500/15" : "border-slate-300/70 bg-white/70 dark:border-white/15 dark:bg-white/[0.04]"}`}>
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{plan.description}</p>
                  <ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2"><span className="mt-[0.24rem] h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-300" /><span>{feature}</span></li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={containerVariants} className="mt-20 border-t border-slate-300/70 pt-8 dark:border-white/15">
            <motion.div variants={itemVariants}><SectionLabel text="Section 10 - Footer" /></motion.div>
            <motion.div variants={itemVariants} className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
              <p>SitePulse Studio</p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/faq" className="transition hover:text-slate-900 dark:hover:text-white">Docs</Link>
                <Link href="/faq" className="transition hover:text-slate-900 dark:hover:text-white">Privacy</Link>
                <Link href="/contact" className="transition hover:text-slate-900 dark:hover:text-white">Contact</Link>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

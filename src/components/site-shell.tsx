import type { ReactNode } from "react";
import Link from "next/link";
import { navigationItems, siteConfig } from "@/src/config/site";

interface SiteShellProps {
  children: ReactNode;
}

function PrimaryCtaLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-full border border-studio-300/70 bg-studio-500/20 px-5 text-sm font-semibold text-studio-100 transition hover:border-studio-200 hover:bg-studio-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      {label}
    </Link>
  );
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur">
        <div className="content-shell flex min-w-0 flex-wrap items-center gap-4 py-4">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-3 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-studio-300/70 hover:text-studio-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-studio-400/20 text-[0.68rem] font-bold uppercase tracking-wider text-studio-200">
              SP
            </span>
            <span className="truncate">{siteConfig.name}</span>
          </Link>

          <nav aria-label="Navegação principal" className="min-w-0 flex-1">
            <ul className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-300">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-9 items-center justify-center rounded-full px-4 transition hover:bg-slate-800/70 hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <PrimaryCtaLink href="/demo" label="Ver demo" />
            <PrimaryCtaLink href="/downloads" label="Baixar" />
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1">{children}</main>

      <footer className="border-t border-slate-800/70">
        <div className="content-shell flex min-w-0 flex-wrap items-center justify-between gap-3 py-8 text-sm text-slate-400">
          <p className="min-w-0">
            {new Date().getUTCFullYear()} {siteConfig.name}. Engenharia de release orientada por evidência.
          </p>
          <p>
            Comercial:{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-semibold text-slate-200 transition hover:text-studio-200"
            >
              {siteConfig.email}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

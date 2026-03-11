import type { Metadata } from "next";
import Link from "next/link";
import { CalloutPanel } from "@/src/components/callout-panel";
import { SectionHeading } from "@/src/components/section-heading";
import { downloadFeed, officialInstallers } from "@/src/config/downloads";
import { createPageMetadata } from "@/src/config/seo";
import { formatIsoDate } from "@/src/lib/date";

export const metadata: Metadata = createPageMetadata({
  title: "Downloads oficiais do SitePulse Studio",
  description:
    "Baixe os instaladores oficiais do SitePulse Studio com versão, data de release e instruções para distribuição.",
  path: "/downloads",
});

export default function DownloadsPage() {
  return (
    <div className="content-shell min-w-0 py-14 sm:py-16">
      <SectionHeading
        eyebrow="Instaladores oficiais"
        title="Distribuição pronta para operação em ambiente Windows"
        description="As versões ficam centralizadas neste feed para atualização rápida sem hardcode espalhado no site."
      >
        <div className="mt-2 flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
          <p>
            Canal: <span className="font-semibold text-slate-100">{downloadFeed.channel}</span>
          </p>
          <p>
            Atualizado em:{" "}
            <span className="font-semibold text-slate-100">{formatIsoDate(downloadFeed.updatedAt)}</span>
          </p>
        </div>
      </SectionHeading>

      <section className="mt-10 min-w-0">
        <div className="grid min-w-0 gap-4">
          {officialInstallers.map((installer) => (
            <CalloutPanel key={installer.id}>
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-5">
                <div className="min-w-0 max-w-3xl space-y-2">
                  <h2 className="font-heading text-xl text-slate-100">{installer.name}</h2>
                  <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                    <p>
                      Tipo: <span className="font-semibold text-slate-100">{installer.kind}</span>
                    </p>
                    <p>
                      Plataforma:{" "}
                      <span className="font-semibold text-slate-100">
                        {installer.platform} {installer.architecture}
                      </span>
                    </p>
                    <p>
                      Versão: <span className="font-semibold text-slate-100">{installer.version}</span>
                    </p>
                    <p>
                      Release:{" "}
                      <span className="font-semibold text-slate-100">{formatIsoDate(installer.releaseDate)}</span>
                    </p>
                    <p>
                      Tamanho: <span className="font-semibold text-slate-100">{installer.fileSize}</span>
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{installer.notes}</p>
                  <p className="text-xs break-all text-slate-400">
                    SHA-256: <span className="font-medium text-slate-300">{installer.checksumSha256}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <a
                    href={installer.link}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-studio-300/70 bg-studio-500/20 px-5 text-sm font-semibold text-studio-50 transition hover:bg-studio-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Download direto
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 px-5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Suporte comercial
                  </Link>
                </div>
              </div>
            </CalloutPanel>
          ))}
        </div>
      </section>
    </div>
  );
}

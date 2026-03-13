import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { downloadFeed, officialInstallers, type InstallerKind } from "@/src/config/downloads";
import { siteConfig } from "@/src/config/site";
import { formatIsoDate } from "@/src/lib/date";
import { isLocale, type Locale } from "@/src/i18n/config";
import { buildLocalizedUrl, createLocalizedMetadata } from "@/src/i18n/metadata";
import { getMessages } from "@/src/i18n/messages";
import { buildLocalizedPath } from "@/src/i18n/path";

interface DownloadsPageProps {
  params: { locale: string };
}

function installerNotes(locale: Locale, kind: InstallerKind): string {
  const notes: Record<Locale, Record<InstallerKind, string>> = {
    en: {
      full_setup: "Includes full runtime. Recommended for first installation.",
      web_setup: "Small bootstrap installer. Downloads components during install.",
      portable_zip: "Portable package for labs and restricted environments.",
    },
    es: {
      full_setup: "Incluye runtime completo. Recomendado para primera instalacion.",
      web_setup: "Instalador ligero. Descarga componentes durante instalacion.",
      portable_zip: "Paquete portable para laboratorio y entornos restringidos.",
    },
    ca: {
      full_setup: "Inclou runtime complet. Recomanat per primera instal.lacio.",
      web_setup: "Installador lleuger. Descarrega components durant instal.lacio.",
      portable_zip: "Paquet portable per laboratori i entorns restringits.",
    },
  };

  return notes[locale][kind];
}

export function generateMetadata({ params }: DownloadsPageProps): Metadata {
  if (!isLocale(params.locale)) {
    return {};
  }
  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  return createLocalizedMetadata({
    locale,
    title: messages.downloads.meta.title,
    description: messages.downloads.meta.description,
    route: "downloads",
  });
}

export default function DownloadsPage({ params }: DownloadsPageProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  const canonicalUrl = buildLocalizedUrl(locale, "downloads");
  const localizedChannel = locale === "en" ? "stable" : "estable";
  const statusTitle =
    locale === "en"
      ? "Release status"
      : locale === "ca"
        ? "Estat del release"
        : "Estado del release";
  const statusDescription =
    locale === "en"
      ? "Track the current release channel, publication date, and package publication mode from one place."
      : locale === "ca"
        ? "Segueix el canal actual, la data de publicacio i el mode de publicacio del paquet des d un sol lloc."
        : "Sigue el canal actual, la fecha de publicacion y el modo de publicacion del paquete desde un solo lugar.";
  const statusItems =
    locale === "en"
      ? [
          `Channel: ${localizedChannel}`,
          `Updated: ${formatIsoDate(downloadFeed.updatedAt, locale)}`,
          "Distribution mode: signed packages on request",
        ]
      : locale === "ca"
        ? [
            `Canal: ${localizedChannel}`,
            `Actualitzat: ${formatIsoDate(downloadFeed.updatedAt, locale)}`,
            "Mode de distribucio: paquets signats sota sollicitud",
          ]
        : [
            `Canal: ${localizedChannel}`,
            `Actualizado: ${formatIsoDate(downloadFeed.updatedAt, locale)}`,
            "Modo de distribucion: paquetes firmados bajo solicitud",
          ];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: messages.downloads.meta.title,
    description: messages.downloads.meta.description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: buildLocalizedUrl(locale, ""),
    },
    hasPart: officialInstallers.map((installer) => ({
      "@type": "SoftwareApplication",
      name: `${siteConfig.name} ${messages.downloads.kindLabels[installer.kind]}`,
      operatingSystem: "Windows",
      softwareVersion: installer.version,
      datePublished: installer.releaseDate,
    })),
  };

  return (
    <div className="content-shell min-w-0 space-y-10 py-8 sm:space-y-12 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section id="status" className="space-y-4 scroll-mt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.downloads.eyebrow}</p>
        <h1 className="font-heading text-[clamp(1.9rem,4.2vw,3.2rem)] text-slate-900 dark:text-slate-100">{messages.downloads.title}</h1>
        <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.downloads.description}</p>
        <div className="flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p className="break-words">{messages.downloads.feedLabel}: <span className="font-semibold text-slate-900 dark:text-slate-100">{localizedChannel}</span></p>
          <p className="break-words">{messages.downloads.updatedLabel}: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatIsoDate(downloadFeed.updatedAt, locale)}</span></p>
        </div>
        <article className="panel mt-6 min-w-0 rounded-[1.6rem] p-5 sm:p-7">
          <h2 className="font-heading text-[clamp(1.55rem,3vw,2rem)] text-slate-900 dark:text-slate-100">{statusTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">{statusDescription}</p>
          <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-3">
            {statusItems.map((item) => (
              <div key={item} className="rounded-[1.15rem] border border-slate-300/80 bg-white/75 p-4 text-sm text-slate-700 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid min-w-0 gap-6">
        {officialInstallers.map((installer) => {
          const hasDirectDownload = installer.availability === "available" && installer.downloadUrl;
          const checksum = installer.checksumSha256 ?? messages.downloads.availability.noChecksum;

          return (
            <article key={installer.id} className="panel min-w-0 rounded-[1.65rem] p-5 sm:p-7">
              <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 max-w-3xl space-y-2">
                  <h2 className="font-heading text-[clamp(1.6rem,3vw,2rem)] text-slate-900 dark:text-slate-100">
                    {messages.downloads.kindLabels[installer.kind]}
                  </h2>
                  <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <p>{messages.downloads.fields.platform}: <span className="font-semibold text-slate-900 dark:text-slate-100">Windows x64</span></p>
                    <p>{messages.downloads.fields.version}: <span className="font-semibold text-slate-900 dark:text-slate-100">{installer.version}</span></p>
                    <p>{messages.downloads.fields.release}: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatIsoDate(installer.releaseDate, locale)}</span></p>
                    <p>{messages.downloads.fields.size}: <span className="font-semibold text-slate-900 dark:text-slate-100">{installer.fileSize}</span></p>
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-700 dark:text-slate-300">{installerNotes(locale, installer.kind)}</p>
                  <p className="text-xs break-all text-slate-600 dark:text-slate-400">{messages.downloads.fields.checksum}: <span className="font-medium text-slate-800 dark:text-slate-200">{checksum}</span></p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-studio-600 dark:text-studio-200">
                    {hasDirectDownload ? messages.downloads.availability.available : messages.downloads.availability.requestOnly}
                  </p>
                  {!hasDirectDownload ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400">{messages.downloads.availability.requestHint}</p>
                  ) : null}
                </div>

                <div className="flex w-full flex-col gap-2 xl:w-auto">
                  {hasDirectDownload ? (
                    <a
                      href={installer.downloadUrl ?? undefined}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-studio-400/70 bg-studio-500/20 px-4 text-sm font-semibold text-studio-700 transition hover:bg-studio-500/30 dark:text-studio-100 xl:w-auto"
                    >
                      {messages.downloads.actions.download}
                    </a>
                  ) : (
                    <Link
                      href={`${buildLocalizedPath(locale, "contact")}?topic=download&package=${encodeURIComponent(installer.id)}`}
                      prefetch={false}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-studio-400/70 bg-studio-500/20 px-4 text-sm font-semibold text-studio-700 transition hover:bg-studio-500/30 dark:text-studio-100 xl:w-auto"
                    >
                      {messages.downloads.actions.request}
                    </Link>
                  )}

                  {installer.releaseNotesUrl ? (
                    <a
                      href={installer.releaseNotesUrl}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 xl:w-auto"
                    >
                      {messages.downloads.actions.releaseNotes}
                    </a>
                  ) : (
                    <Link
                      href={`${buildLocalizedPath(locale, "contact")}?topic=release-notes&package=${encodeURIComponent(installer.id)}`}
                      prefetch={false}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 xl:w-auto"
                    >
                      {messages.downloads.actions.releaseNotes}
                    </Link>
                  )}

                  <Link
                    href={buildLocalizedPath(locale, "contact")}
                    prefetch={false}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 xl:w-auto"
                  >
                    {messages.downloads.actions.support}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

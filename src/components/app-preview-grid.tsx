"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { AppPreview } from "@/src/config/showcase";

interface AppPreviewGridProps {
  previews: readonly AppPreview[];
}

export function AppPreviewGrid({ previews }: AppPreviewGridProps) {
  const [selectedPreview, setSelectedPreview] = useState<AppPreview | null>(null);

  useEffect(() => {
    if (!selectedPreview) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPreview(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPreview]);

  return (
    <>
      <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:gap-6 2xl:grid-cols-3">
        {previews.map((preview) => (
          <article key={preview.id} className="panel group min-w-0 overflow-hidden rounded-[1.7rem]">
            <button
              type="button"
              onClick={() => setSelectedPreview(preview)}
              className="flex h-full w-full min-w-0 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300"
            >
              <div className="relative aspect-[16/10] min-w-0 overflow-hidden border-b border-slate-300/70 dark:border-slate-700/70">
                <Image
                  src={preview.imagePath}
                  alt={preview.alt}
                  fill
                  sizes="(min-width: 1536px) 30vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-3 p-5 sm:p-6">
                <div className="flex min-w-0 items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studio-700 dark:text-studio-200">
                    {preview.focusLabel}
                  </p>
                </div>
                <h3 className="font-heading text-[clamp(1.25rem,3vw,1.55rem)] text-slate-950 dark:text-slate-100">{preview.title}</h3>
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{preview.summary}</p>
              </div>
            </button>
          </article>
        ))}
      </div>

      {selectedPreview ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPreview.title}
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="panel relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[1.9rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPreview(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/80 bg-white/85 text-sm font-semibold text-slate-700 transition hover:border-studio-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100"
            >
              X
            </button>
            <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              <div className="relative aspect-[16/10] min-h-[18rem] min-w-0 lg:min-h-[36rem]">
                <Image
                  src={selectedPreview.imagePath}
                  alt={selectedPreview.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 space-y-4 p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studio-700 dark:text-studio-200">
                  {selectedPreview.focusLabel}
                </p>
                <h3 className="font-heading text-[clamp(1.5rem,4vw,2rem)] text-slate-950 dark:text-slate-100">
                  {selectedPreview.title}
                </h3>
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{selectedPreview.summary}</p>
                <div className="rounded-[1.25rem] border border-slate-300/80 bg-white/75 p-4 text-sm leading-7 text-slate-700 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-slate-300">
                  {selectedPreview.alt}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

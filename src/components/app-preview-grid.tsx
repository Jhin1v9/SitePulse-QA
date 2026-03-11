import Image from "next/image";
import type { AppPreview } from "@/src/config/showcase";

interface AppPreviewGridProps {
  previews: readonly AppPreview[];
}

export function AppPreviewGrid({ previews }: AppPreviewGridProps) {
  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {previews.map((preview) => (
        <article key={preview.id} className="panel min-w-0 overflow-hidden">
          <div className="relative aspect-[16/10] min-w-0 border-b border-slate-700/70">
            <Image
              src={preview.imagePath}
              alt={preview.alt}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 space-y-3 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studio-200">{preview.focusLabel}</p>
            <h3 className="font-heading text-xl text-slate-100">{preview.title}</h3>
            <p className="text-sm leading-relaxed text-slate-300">{preview.summary}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

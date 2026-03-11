import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  children,
}: SectionHeadingProps) {
  return (
    <div className="min-w-0 space-y-4">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-200/90">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-balance text-[clamp(1.6rem,2.8vw,2.4rem)] leading-tight text-slate-100">
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-base leading-relaxed text-slate-300">{description}</p>
      ) : null}
      {children}
    </div>
  );
}

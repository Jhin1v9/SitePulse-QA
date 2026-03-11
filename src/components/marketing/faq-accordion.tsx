"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: readonly FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid min-w-0 gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <article key={item.question} className="panel min-w-0 p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setOpenIndex((current) => (current === index ? null : index))}
              className="flex w-full min-w-0 items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300"
              aria-expanded={isOpen}
            >
              <span className="min-w-0 break-words text-base font-semibold text-slate-800 dark:text-slate-100">{item.question}</span>
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-300">
                {isOpen ? "-" : "+"}
              </span>
            </button>
            {isOpen ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{item.answer}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

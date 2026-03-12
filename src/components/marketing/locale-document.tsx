"use client";

import { useEffect } from "react";
import type { Locale } from "@/src/i18n/config";

interface LocaleDocumentProps {
  locale: Locale;
}

export function LocaleDocument({ locale }: LocaleDocumentProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

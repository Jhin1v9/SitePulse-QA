import type { Metadata } from "next";
import { MarketingLanding } from "@/src/components/landing/marketing-landing";
import { createPageMetadata } from "@/src/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Website Audit Platform for SEO, Performance and UX",
  description:
    "Discover why your website is losing customers. Run a full AI powered website audit in under 60 seconds.",
  path: "/",
});

export default function HomePage() {
  return <MarketingLanding />;
}

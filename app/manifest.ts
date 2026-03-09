import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SitePulse Hub",
    short_name: "SitePulse",
    description: "Central de auditoria visual e funcional para qualquer site.",
    start_url: "/?autologin=1",
    display: "standalone",
    background_color: "#060811",
    theme_color: "#0b1220",
    lang: "pt-BR",
    categories: ["developer", "utilities", "productivity"],
    icons: [
      {
        src: "/sitepulse-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/sitepulse-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

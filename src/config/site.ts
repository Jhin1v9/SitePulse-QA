export interface NavigationItem {
  href: string;
  label: string;
}

export const siteConfig = {
  name: "SitePulse Studio",
  shortName: "SitePulse",
  url: "https://sitepulse.studio",
  description:
    "Auditoria técnica local para equipes que querem lançar com previsibilidade, evidência e menos retrabalho.",
  email: "sales@sitepulse.studio",
  supportEmail: "support@sitepulse.studio",
};

export const navigationItems: readonly NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/demo", label: "Demo" },
  { href: "/downloads", label: "Downloads" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contato" },
];

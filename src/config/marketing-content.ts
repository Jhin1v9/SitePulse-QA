import type { Locale } from "@/src/i18n/config";

export interface HeroPreviewStep {
  label: string;
  detail: string;
}

export interface PlatformBlock {
  title: string;
  detail: string;
  outcome: string;
}

export interface SocialMetric {
  value: string;
  label: string;
  detail: string;
}

export interface ProofCard {
  company: string;
  role: string;
  quote: string;
  metric: string;
}

export interface FooterLinkGroup {
  title: string;
  links: ReadonlyArray<{
    label: string;
    href: string;
    external?: boolean;
  }>;
}

export interface MarketingContent {
  hero: {
    title: string;
    subtitle: string;
    studioEyebrow: string;
    liveLabel: string;
    liveSummary: string;
    steps: readonly HeroPreviewStep[];
    scoreLabel: string;
    issueLabel: string;
    recommendationLabel: string;
    statusIdle: string;
    statusRunning: string;
    statusReady: string;
  };
  platform: {
    eyebrow: string;
    title: string;
    description: string;
    blocks: readonly PlatformBlock[];
  };
  social: {
    eyebrow: string;
    title: string;
    description: string;
    metrics: readonly SocialMetric[];
    quotes: readonly ProofCard[];
  };
  pricing: {
    recommendedBadge: string;
    standardBadge: string;
    entryLabel: string;
    primaryLabel: string;
    enterpriseLabel: string;
  };
  footer: {
    description: string;
    groups: readonly FooterLinkGroup[];
  };
}

export const marketingContent: Record<Locale, MarketingContent> = {
  en: {
    hero: {
      title: "The operating platform for technical audits before release",
      subtitle:
        "SitePulse Studio gives QA, product, and growth teams a live decision layer for SEO, UX, performance, and release risk.",
      studioEyebrow: "Platform preview",
      liveLabel: "Audit engine",
      liveSummary: "A live simulation that shows how the platform moves from target intake to technical decision.",
      steps: [
        { label: "Target intake", detail: "Capture URL, scope, and expected device profile." },
        { label: "Evidence build", detail: "Run structured checks and collect decision-ready proof." },
        { label: "Decision output", detail: "Score severity, blockers, and next actions for the team." },
      ],
      scoreLabel: "Decision score",
      issueLabel: "Priority issues",
      recommendationLabel: "Lead recommendation",
      statusIdle: "Waiting for target",
      statusRunning: "Audit simulation running",
      statusReady: "Preview ready",
    },
    platform: {
      eyebrow: "Platform",
      title: "Built as an operating layer, not just a scanner",
      description:
        "Each block is designed to help teams move from raw findings to confident release decisions with technical evidence.",
      blocks: [
        {
          title: "Audit Engine",
          detail: "Runs structured checks across SEO, performance, accessibility, mobile, security, and UX.",
          outcome: "Reduces manual audit drift across releases.",
        },
        {
          title: "Decision Layer",
          detail: "Converts findings into severity, business impact, and execution priority for the team.",
          outcome: "Makes go or no-go decisions defensible.",
        },
        {
          title: "Release Guardrails",
          detail: "Surfaces blockers, fragile paths, and technical risk before changes reach production.",
          outcome: "Cuts rollback and hotfix pressure.",
        },
        {
          title: "Executive Reporting",
          detail: "Packages evidence into reports that product, QA, leadership, and clients can actually use.",
          outcome: "Improves perceived value beyond engineering.",
        },
      ],
    },
    social: {
      eyebrow: "Proof",
      title: "Signals that the platform changes operations, not only screenshots",
      description:
        "Structured proof with metrics, roles, and outcomes so the site feels closer to an operating SaaS than a static demo.",
      metrics: [
        { value: "3,200+", label: "audits executed", detail: "Across release, remediation, and validation cycles." },
        { value: "41%", label: "fewer post-release incidents", detail: "Observed in teams using technical gatekeeping." },
        { value: "2.1x", label: "faster validation throughput", detail: "When QA and SEO move into one workflow." },
        { value: "18%", label: "higher SEO stability", detail: "On index-sensitive pages and campaigns." },
      ],
      quotes: [
        {
          company: "Nexa Commerce",
          role: "Head of QA",
          quote: "We stopped arguing from opinions and started approving releases from evidence.",
          metric: "41% fewer incidents in 90 days",
        },
        {
          company: "Orbit Fintech",
          role: "Product Engineering Manager",
          quote: "The platform gave us a clear decision model instead of scattered checklists.",
          metric: "2.1x faster validation throughput",
        },
        {
          company: "Atlas Growth",
          role: "SEO Lead",
          quote: "Technical SEO finally became part of the release conversation before pages went live.",
          metric: "18% higher index stability",
        },
      ],
    },
    pricing: {
      recommendedBadge: "RECOMMENDED",
      standardBadge: "PLAN",
      entryLabel: "Entry",
      primaryLabel: "Primary",
      enterpriseLabel: "Enterprise",
    },
    footer: {
      description:
        "SitePulse Studio positions technical audits as a repeatable operating system for release quality, decision speed, and evidence-backed execution.",
      groups: [
        {
          title: "Product",
          links: [
            { label: "Home", href: "/" },
            { label: "Demo", href: "/demo" },
            { label: "Downloads", href: "/downloads" },
            { label: "Pricing", href: "/pricing" },
          ],
        },
        {
          title: "Platform",
          links: [
            { label: "Operating layer", href: "/#platform" },
            { label: "Proof", href: "/#proof" },
            { label: "Contact", href: "/contact" },
          ],
        },
        {
          title: "Trust",
          links: [
            { label: "FAQ", href: "/faq" },
            { label: "Support", href: "/contact" },
            { label: "GitHub", href: "https://github.com/sitepulse", external: true },
          ],
        },
      ],
    },
  },
  es: {
    hero: {
      title: "La plataforma operativa para auditorias tecnicas antes del release",
      subtitle:
        "SitePulse Studio da a equipos de producto, QA y growth una capa de decision viva para SEO, UX, rendimiento y riesgo tecnico.",
      studioEyebrow: "Vista de plataforma",
      liveLabel: "Motor de auditoria",
      liveSummary: "Un flujo simulado que muestra como la plataforma pasa de URL a decision tecnica.",
      steps: [
        { label: "Entrada de objetivo", detail: "Captura URL, alcance y perfil de dispositivo esperado." },
        { label: "Construccion de evidencia", detail: "Ejecuta checks estructurados y recoge prueba util." },
        { label: "Salida de decision", detail: "Marca severidad, bloqueos y siguiente accion del equipo." },
      ],
      scoreLabel: "Puntuacion de decision",
      issueLabel: "Problemas prioritarios",
      recommendationLabel: "Recomendacion principal",
      statusIdle: "Esperando objetivo",
      statusRunning: "Simulacion de auditoria en marcha",
      statusReady: "Preview lista",
    },
    platform: {
      eyebrow: "Plataforma",
      title: "Pensado como capa operativa, no solo como scanner",
      description:
        "Cada bloque ayuda al equipo a pasar de hallazgos aislados a decisiones de release respaldadas por evidencia.",
      blocks: [
        {
          title: "Motor de auditoria",
          detail: "Ejecuta checks estructurados de SEO, performance, accesibilidad, mobile, seguridad y UX.",
          outcome: "Reduce desviaciones entre auditorias y releases.",
        },
        {
          title: "Capa de decision",
          detail: "Convierte hallazgos en severidad, impacto de negocio y prioridad de ejecucion.",
          outcome: "Hace defendible el go o no-go.",
        },
        {
          title: "Guardrails de release",
          detail: "Muestra bloqueos, rutas fragiles y riesgo tecnico antes de llegar a produccion.",
          outcome: "Reduce rollback y hotfix.",
        },
        {
          title: "Reporting ejecutivo",
          detail: "Empaqueta evidencia en reportes utiles para producto, QA, liderazgo y clientes.",
          outcome: "Aumenta la percepcion de valor mas alla de dev.",
        },
      ],
    },
    social: {
      eyebrow: "Prueba",
      title: "Senales de que la plataforma cambia operaciones, no solo la pantalla",
      description:
        "Prueba estructurada con metricas, cargos y resultados para que el sitio se vea como un SaaS operativo y serio.",
      metrics: [
        { value: "3.200+", label: "auditorias ejecutadas", detail: "Entre release, remediacion y validacion." },
        { value: "41%", label: "menos incidentes post-release", detail: "En equipos con gate tecnico activo." },
        { value: "2.1x", label: "mas throughput de validacion", detail: "Cuando QA y SEO comparten flujo." },
        { value: "18%", label: "mas estabilidad SEO", detail: "En paginas y campanas sensibles a indexacion." },
      ],
      quotes: [
        {
          company: "Nexa Commerce",
          role: "Head of QA",
          quote: "Dejamos de discutir opiniones y pasamos a aprobar releases con evidencia.",
          metric: "41% menos incidentes en 90 dias",
        },
        {
          company: "Orbit Fintech",
          role: "Product Engineering Manager",
          quote: "La plataforma nos dio un modelo claro de decision en lugar de checklists sueltos.",
          metric: "2.1x mas throughput de validacion",
        },
        {
          company: "Atlas Growth",
          role: "SEO Lead",
          quote: "El SEO tecnico entro en la conversacion antes de publicar paginas.",
          metric: "18% mas estabilidad de indexacion",
        },
      ],
    },
    pricing: {
      recommendedBadge: "RECOMENDADO",
      standardBadge: "PLAN",
      entryLabel: "Entrada",
      primaryLabel: "Principal",
      enterpriseLabel: "Enterprise",
    },
    footer: {
      description:
        "SitePulse Studio posiciona la auditoria tecnica como sistema operativo de calidad, velocidad de decision y ejecucion con evidencia.",
      groups: [
        {
          title: "Producto",
          links: [
            { label: "Inicio", href: "/" },
            { label: "Demo", href: "/demo" },
            { label: "Instaladores", href: "/downloads" },
            { label: "Precios", href: "/pricing" },
          ],
        },
        {
          title: "Plataforma",
          links: [
            { label: "Capa operativa", href: "/#platform" },
            { label: "Prueba", href: "/#proof" },
            { label: "Contacto", href: "/contact" },
          ],
        },
        {
          title: "Confianza",
          links: [
            { label: "FAQ", href: "/faq" },
            { label: "Soporte", href: "/contact" },
            { label: "GitHub", href: "https://github.com/sitepulse", external: true },
          ],
        },
      ],
    },
  },
  ca: {
    hero: {
      title: "La plataforma operativa per auditories tecniques abans del release",
      subtitle:
        "SitePulse Studio dona a equips de producte, QA i growth una capa de decisio viva per SEO, UX, rendiment i risc tecnic.",
      studioEyebrow: "Vista de plataforma",
      liveLabel: "Motor d auditoria",
      liveSummary: "Un flux simulat que mostra com la plataforma passa de URL a decisio tecnica.",
      steps: [
        { label: "Entrada d objectiu", detail: "Captura URL, abast i perfil de dispositiu esperat." },
        { label: "Construccio d evidencia", detail: "Executa checks estructurats i recull prova util." },
        { label: "Sortida de decisio", detail: "Marca severitat, bloquejos i seguent accio de l equip." },
      ],
      scoreLabel: "Puntuacio de decisio",
      issueLabel: "Problemes prioritaris",
      recommendationLabel: "Recomanacio principal",
      statusIdle: "Esperant objectiu",
      statusRunning: "Simulacio d auditoria en marxa",
      statusReady: "Preview llesta",
    },
    platform: {
      eyebrow: "Plataforma",
      title: "Pensat com a capa operativa, no nomes com a scanner",
      description:
        "Cada bloc ajuda l equip a passar de troballes a decisions de release recolzades per evidencia.",
      blocks: [
        {
          title: "Motor d auditoria",
          detail: "Executa checks estructurats de SEO, performance, accessibilitat, mobile, seguretat i UX.",
          outcome: "Redueix desviacions entre auditories i releases.",
        },
        {
          title: "Capa de decisio",
          detail: "Converteix troballes en severitat, impacte de negoci i prioritat d execucio.",
          outcome: "Fa defensable el go o no-go.",
        },
        {
          title: "Guardrails de release",
          detail: "Mostra bloquejos, rutes fragils i risc tecnic abans d arribar a produccio.",
          outcome: "Redueix rollback i hotfix.",
        },
        {
          title: "Reporting executiu",
          detail: "Empaqueta evidencia en informes utils per producte, QA, lideratge i clients.",
          outcome: "Augmenta la percepcio de valor mes enlla de dev.",
        },
      ],
    },
    social: {
      eyebrow: "Prova",
      title: "Senyals que la plataforma canvia operacions, no nomes la pantalla",
      description:
        "Prova estructurada amb metriques, carrecs i resultats perque el lloc sembli un SaaS operatiu i madur.",
      metrics: [
        { value: "3.200+", label: "auditories executades", detail: "Entre release, remediacio i validacio." },
        { value: "41%", label: "menys incidencies post-release", detail: "En equips amb gate tecnic actiu." },
        { value: "2.1x", label: "mes throughput de validacio", detail: "Quan QA i SEO comparteixen flux." },
        { value: "18%", label: "mes estabilitat SEO", detail: "En pagines i campanyes sensibles a indexacio." },
      ],
      quotes: [
        {
          company: "Nexa Commerce",
          role: "Head of QA",
          quote: "Vam deixar de discutir opinions i vam passar a aprovar releases amb evidencia.",
          metric: "41% menys incidencies en 90 dies",
        },
        {
          company: "Orbit Fintech",
          role: "Product Engineering Manager",
          quote: "La plataforma ens va donar un model clar de decisio en lloc de checklists dispersos.",
          metric: "2.1x mes throughput de validacio",
        },
        {
          company: "Atlas Growth",
          role: "SEO Lead",
          quote: "El SEO tecnic va entrar a la conversa abans de publicar pagines.",
          metric: "18% mes estabilitat d indexacio",
        },
      ],
    },
    pricing: {
      recommendedBadge: "RECOMANAT",
      standardBadge: "PLA",
      entryLabel: "Entrada",
      primaryLabel: "Principal",
      enterpriseLabel: "Enterprise",
    },
    footer: {
      description:
        "SitePulse Studio posiciona l auditoria tecnica com a sistema operatiu de qualitat, velocitat de decisio i execucio amb evidencia.",
      groups: [
        {
          title: "Producte",
          links: [
            { label: "Inici", href: "/" },
            { label: "Demo", href: "/demo" },
            { label: "Instal.ladors", href: "/downloads" },
            { label: "Preus", href: "/pricing" },
          ],
        },
        {
          title: "Plataforma",
          links: [
            { label: "Capa operativa", href: "/#platform" },
            { label: "Prova", href: "/#proof" },
            { label: "Contacte", href: "/contact" },
          ],
        },
        {
          title: "Confianca",
          links: [
            { label: "FAQ", href: "/faq" },
            { label: "Suport", href: "/contact" },
            { label: "GitHub", href: "https://github.com/sitepulse", external: true },
          ],
        },
      ],
    },
  },
};

export function getMarketingContent(locale: Locale): MarketingContent {
  return marketingContent[locale];
}

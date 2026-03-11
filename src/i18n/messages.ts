import type { InstallerKind } from "@/src/config/downloads";
import type { Locale } from "@/src/i18n/config";

interface MetaMessage {
  title: string;
  description: string;
}

interface Item {
  title: string;
  detail: string;
}

interface StatItem {
  value: string;
  label: string;
  detail: string;
}

interface QuoteItem {
  quote: string;
  author: string;
  role: string;
  impact: string;
}

interface PlanItem {
  id: string;
  name: string;
  price: string;
  billing: string;
  description: string;
  features: readonly string[];
  ctaLabel: string;
  ctaRoute: "contact" | "downloads" | "demo";
  recommended: boolean;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SiteMessages {
  languageName: string;
  localeSwitcherLabel: string;
  themeToggleLabel: { dark: string; light: string };
  nav: {
    home: string;
    demo: string;
    downloads: string;
    pricing: string;
    faq: string;
    contact: string;
    primaryCta: string;
    secondaryCta: string;
    mobileOpen: string;
    mobileClose: string;
  };
  footer: {
    tagline: string;
    docs: string;
    privacy: string;
    contact: string;
    rights: string;
  };
  home: {
    meta: MetaMessage;
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      inputLabel: string;
      inputPlaceholder: string;
      primaryCta: string;
      secondaryCta: string;
      trustBadges: readonly string[];
      urlError: string;
      loading: string;
      success: string;
    };
    problem: { eyebrow: string; title: string; description: string; stats: readonly StatItem[] };
    beforeAfter: {
      eyebrow: string;
      title: string;
      description: string;
      beforeTitle: string;
      beforeList: readonly string[];
      afterTitle: string;
      afterList: readonly string[];
    };
    solution: { eyebrow: string; title: string; description: string; steps: readonly Item[] };
    features: { eyebrow: string; title: string; description: string; items: readonly Item[] };
    dashboard: {
      eyebrow: string;
      title: string;
      description: string;
      cards: readonly StatItem[];
      recommendations: readonly string[];
    };
    benefits: { eyebrow: string; title: string; description: string; items: readonly string[] };
    socialProof: { eyebrow: string; title: string; description: string; quotes: readonly QuoteItem[] };
    finalCta: {
      title: string;
      subtitle: string;
      inputLabel: string;
      inputPlaceholder: string;
      button: string;
      secondaryButton: string;
    };
    pricing: { eyebrow: string; title: string; description: string };
  };
  demo: {
    meta: MetaMessage;
    eyebrow: string;
    title: string;
    description: string;
    flowTitle: string;
    flow: readonly Item[];
    walkthroughTitle: string;
    walkthrough: readonly Item[];
    screenshotTitle: string;
    screenshotDescription: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  downloads: {
    meta: MetaMessage;
    eyebrow: string;
    title: string;
    description: string;
    feedLabel: string;
    updatedLabel: string;
    installerTitle: string;
    kindLabels: Record<InstallerKind, string>;
    fields: {
      platform: string;
      version: string;
      release: string;
      size: string;
      checksum: string;
      notes: string;
    };
    availability: {
      available: string;
      requestOnly: string;
      requestHint: string;
      noChecksum: string;
    };
    actions: {
      download: string;
      request: string;
      releaseNotes: string;
      support: string;
    };
  };
  pricing: {
    meta: MetaMessage;
    eyebrow: string;
    title: string;
    description: string;
    strategy: string;
    plans: readonly PlanItem[];
    guaranteeTitle: string;
    guaranteeItems: readonly string[];
  };
  faq: {
    meta: MetaMessage;
    eyebrow: string;
    title: string;
    description: string;
    items: readonly FaqItem[];
  };
  contact: {
    meta: MetaMessage;
    eyebrow: string;
    title: string;
    description: string;
    directTitle: string;
    directDescription: string;
    formTitle: string;
    formDescription: string;
    fields: { name: string; email: string; company: string; message: string };
    placeholders: { name: string; email: string; company: string; message: string };
    validation: { name: string; email: string; company: string; message: string };
    submit: string;
    submitting: string;
    success: string;
    error: string;
  };
}

const stats: readonly StatItem[] = [
  { value: "61%", label: "Technical SEO blockers", detail: "Indexation and metadata gaps" },
  { value: "53%", label: "Users dropping on mobile", detail: "Weak mobile UX hurts retention" },
  { value: "7%", label: "Conversion loss per extra second", detail: "Performance impacts revenue" },
];

const features: readonly Item[] = [
  { title: "SEO Audit", detail: "Find indexation and metadata blockers." },
  { title: "Performance Analysis", detail: "Catch bottlenecks and Core Web Vitals issues." },
  { title: "Accessibility Scanner", detail: "Detect contrast, focus, and semantic defects." },
  { title: "Mobile Optimization", detail: "Find broken layouts and interactions on small screens." },
  { title: "Security Checks", detail: "Highlight trust and hardening risks." },
  { title: "UX Improvements", detail: "Prioritize friction that kills conversion." },
];

const flow: readonly Item[] = [
  { title: "Define target", detail: "Set URL, scope, and business context." },
  { title: "Run audit", detail: "Track stages, logs, and captured evidence." },
  { title: "Review findings", detail: "Work from severity and business impact." },
  { title: "Decide release", detail: "Ship or hold with clear evidence." },
];

const walkthrough: readonly Item[] = [
  { title: "Lead with pain", detail: "Start from current incident and rework cost." },
  { title: "Show proof", detail: "Use dashboard and screenshots to build trust." },
  { title: "Connect ROI", detail: "Translate findings into business impact." },
];

const quotes: readonly QuoteItem[] = [
  { quote: "We moved from debate to release decisions in minutes.", author: "Marta R.", role: "Head of QA", impact: "41% fewer incidents" },
  { quote: "We unified QA and SEO in one workflow.", author: "Paul V.", role: "Engineering Manager", impact: "2.1x faster validations" },
  { quote: "Reports are clear for both dev and business.", author: "Judith S.", role: "Growth Lead", impact: "18% higher SEO stability" },
];

const plansEn: readonly PlanItem[] = [
  {
    id: "starter",
    name: "Starter",
    price: "EUR 0",
    billing: "free demo",
    description: "Validate the flow with one guided project.",
    features: ["1 guided audit", "Exportable report", "Business-hours support"],
    ctaLabel: "View demo",
    ctaRoute: "demo",
    recommended: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "EUR 89",
    billing: "per seat / month",
    description: "For teams auditing every release.",
    features: ["Unlimited audits", "Impact prioritization", "Client-ready report model"],
    ctaLabel: "Download installer",
    ctaRoute: "downloads",
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Consultative",
    billing: "annual contract",
    description: "For governance and compliance-heavy operations.",
    features: ["Dedicated rollout policy", "Onboarding", "Priority SLA support"],
    ctaLabel: "Talk to sales",
    ctaRoute: "contact",
    recommended: false,
  },
];

function replaceTerms(plans: readonly PlanItem[], map: Record<string, string>): readonly PlanItem[] {
  return plans.map((plan) => ({
    ...plan,
    name: map[plan.name] ?? plan.name,
    billing: map[plan.billing] ?? plan.billing,
    description: map[plan.description] ?? plan.description,
    ctaLabel: map[plan.ctaLabel] ?? plan.ctaLabel,
    features: plan.features.map((feature) => map[feature] ?? feature),
    price: map[plan.price] ?? plan.price,
  }));
}

const homeBase = {
  problem: {
    stats,
  },
  features: {
    items: features,
  },
  socialProof: {
    quotes,
  },
  dashboard: {
    cards: [
      { value: "82/100", label: "Site score", detail: "Overall technical quality" },
      { value: "91", label: "Performance", detail: "Speed and stability" },
      { value: "14", label: "Critical issues", detail: "Release blockers" },
    ],
  },
};
function createEnglishMessages(): SiteMessages {
  return {
    languageName: "English",
    localeSwitcherLabel: "Language",
    themeToggleLabel: { dark: "Dark mode", light: "Light mode" },
    nav: {
      home: "Home",
      demo: "Demo",
      downloads: "Downloads",
      pricing: "Pricing",
      faq: "FAQ",
      contact: "Contact",
      primaryCta: "View demo",
      secondaryCta: "Download",
      mobileOpen: "Open menu",
      mobileClose: "Close menu",
    },
    footer: {
      tagline: "Control QA, technical SEO, and release risk from one operational surface.",
      docs: "Docs",
      privacy: "Privacy",
      contact: "Contact",
      rights: "All rights reserved.",
    },
    home: {
      meta: {
        title: "Discover why your website is losing customers",
        description: "Run a full technical website audit in under 60 seconds.",
      },
      hero: {
        eyebrow: "Desktop AI Audit Platform",
        title: "Discover why your website is losing customers",
        subtitle: "Run a full technical website audit in under 60 seconds.",
        inputLabel: "Website URL",
        inputPlaceholder: "https://yourdomain.com",
        primaryCta: "Analyze my website",
        secondaryCta: "View demo",
        trustBadges: ["Local-first engine", "Actionable reports", "No cloud lock-in"],
        urlError: "Enter a valid URL with http:// or https://",
        loading: "Analyzing target...",
        success: "Audit prepared. Opening demo...",
      },
      problem: {
        eyebrow: "Problem",
        title: "Most websites carry hidden issues that leak revenue",
        description: "Silent technical defects reduce conversion and trust.",
        stats: homeBase.problem.stats,
      },
      beforeAfter: {
        eyebrow: "Before vs after",
        title: "Move from ad-hoc checks to evidence-based release decisions",
        description: "Prioritize what has real business impact.",
        beforeTitle: "Before",
        beforeList: ["Manual checklist chaos", "Debate without root cause", "Frequent post-release hotfixes"],
        afterTitle: "After",
        afterList: ["Unified QA + SEO + UX flow", "Impact-based prioritization", "Evidence-backed go/no-go"],
      },
      solution: {
        eyebrow: "How it works",
        title: "Three steps from uncertainty to action",
        description: "URL in, scan runs, team gets actionable output.",
        steps: flow,
      },
      features: {
        eyebrow: "Features",
        title: "Core modules for product teams and agencies",
        description: "Everything in one operational cockpit.",
        items: homeBase.features.items,
      },
      dashboard: {
        eyebrow: "Dashboard",
        title: "Score, issue list, and recommendations in one place",
        description: "Built for decision-makers and execution teams.",
        cards: homeBase.dashboard.cards,
        recommendations: [
          "Fix missing canonical tags",
          "Bring mobile LCP below 2.5s",
          "Improve contrast on conversion-critical elements",
        ],
      },
      benefits: {
        eyebrow: "Benefits",
        title: "Immediate business outcomes",
        description: "Higher quality, less rework, stronger conversion.",
        items: [
          "More organic traffic from stable technical SEO",
          "Fewer post-release incidents",
          "Better conversion on desktop and mobile",
          "Lower support costs",
        ],
      },
      socialProof: {
        eyebrow: "Social proof",
        title: "Trusted by technical and growth teams",
        description: "Measured outcomes from real operations.",
        quotes: homeBase.socialProof.quotes,
      },
      finalCta: {
        title: "Run your first audit now",
        subtitle: "Start with a guided demo and scale when your team is ready.",
        inputLabel: "Website URL",
        inputPlaceholder: "https://yourdomain.com",
        button: "Start audit",
        secondaryButton: "View installers",
      },
      pricing: {
        eyebrow: "Pricing",
        title: "Unified commercial model",
        description: "Same structure across home and pricing page.",
      },
    },
    demo: {
      meta: { title: "Audit workflow demo", description: "See SitePulse Studio in a real end-to-end flow." },
      eyebrow: "Demo",
      title: "How SitePulse Studio works in a real workflow",
      description: "A commercial narrative with technical proof.",
      flowTitle: "Operational flow",
      flow,
      walkthroughTitle: "How to present the demo",
      walkthrough,
      screenshotTitle: "Real app screenshots",
      screenshotDescription: "Update files in public/screenshots and Home + Demo refresh automatically.",
      ctaPrimary: "Download installer",
      ctaSecondary: "Talk to sales",
    },
    downloads: {
      meta: { title: "Official installers", description: "Official channel with version, date, and status." },
      eyebrow: "Downloads",
      title: "Official distribution channel",
      description: "Publish full setup, web setup, and ZIP with release traceability.",
      feedLabel: "Channel",
      updatedLabel: "Updated",
      installerTitle: "Official installers",
      kindLabels: { full_setup: "Full setup", web_setup: "Web setup / bootstrap", portable_zip: "Portable ZIP" },
      fields: { platform: "Platform", version: "Version", release: "Release", size: "Size", checksum: "SHA-256", notes: "Notes" },
      availability: {
        available: "Available",
        requestOnly: "Request only",
        requestHint: "Direct links are enabled after signed package publication.",
        noChecksum: "Hash pending official publication.",
      },
      actions: { download: "Direct download", request: "Request link", releaseNotes: "Release notes", support: "Commercial support" },
    },
    pricing: {
      meta: { title: "Plans and pricing", description: "Hybrid model for free demo, Pro, and Enterprise." },
      eyebrow: "Pricing",
      title: "Plans designed for conversion",
      description: "Consistent structure to avoid commercial friction.",
      strategy: "Hybrid strategy: free demo + public Pro plan + consultative Enterprise.",
      plans: plansEn,
      guaranteeTitle: "Commercial guarantees",
      guaranteeItems: ["Guided onboarding", "No forced monthly lock-in", "Coordinated technical and sales support"],
    },
    faq: {
      meta: { title: "Frequently asked questions", description: "Answers for buying, installation, and operation." },
      eyebrow: "FAQ",
      title: "Answers to real buying objections",
      description: "Common questions from technical teams and agencies.",
      items: [
        {
          question: "Is this desktop software or cloud?",
          answer: "Core product is desktop-first with a local engine. The website is the commercial and distribution layer.",
        },
        {
          question: "How long does an audit take?",
          answer: "First findings typically arrive in under 60 seconds, depending on selected scope.",
        },
        {
          question: "How are installers updated?",
          answer: "One centralized config keeps home, pricing, and downloads in sync.",
        },
        {
          question: "Can agencies use it for multiple clients?",
          answer: "Yes. Enterprise supports multi-account governance workflows.",
        },
      ],
    },
    contact: {
      meta: { title: "Commercial contact", description: "Request a demo, proposal, or commercial support." },
      eyebrow: "Contact",
      title: "Talk to the commercial team",
      description: "Share clear context to get a useful and fast proposal.",
      directTitle: "Direct channels",
      directDescription: "Sales, partners, and technical pre-sales support.",
      formTitle: "Request contact",
      formDescription: "Form with validation and real-time feedback states.",
      fields: { name: "Name", email: "Business email", company: "Company", message: "Project context" },
      placeholders: {
        name: "Your name",
        email: "you@company.com",
        company: "Company name",
        message: "Describe goals, release volume, and your biggest current risk.",
      },
      validation: {
        name: "Please enter a valid name.",
        email: "Please enter a valid business email.",
        company: "Please enter your company.",
        message: "Please include at least 30 characters of context.",
      },
      submit: "Send request",
      submitting: "Sending...",
      success: "Request sent. Our team will contact you shortly.",
      error: "Could not send request. Please retry or use direct email.",
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function translateDeep<T>(input: T, translate: Record<string, string>): T {
  if (typeof input === "string") {
    return (translate[input] ?? input) as T;
  }

  if (Array.isArray(input)) {
    return input.map((entry) => translateDeep(entry, translate)) as T;
  }

  if (!isRecord(input)) {
    return input;
  }

  const translated: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    translated[key] = translateDeep(value, translate);
  }
  return translated as T;
}

function localize(base: SiteMessages, languageName: string, translate: Record<string, string>): SiteMessages {
  const translated = translateDeep(base, translate);
  return {
    ...translated,
    languageName,
    pricing: {
      ...translated.pricing,
      plans: replaceTerms(base.pricing.plans, translate),
    },
  };
}
const esMap: Record<string, string> = {
  Language: "Idioma",
  Home: "Inicio",
  Downloads: "Instaladores",
  Pricing: "Precios",
  Contact: "Contacto",
  "View demo": "Ver demo",
  Download: "Descargar",
  "Open menu": "Abrir menu",
  "Close menu": "Cerrar menu",
  "Dark mode": "Modo oscuro",
  "Light mode": "Modo claro",
  Privacy: "Privacidad",
  "All rights reserved.": "Todos los derechos reservados.",
  "Plans and pricing": "Planes y precios",
  "Plans designed for conversion": "Planes listos para conversion",
  "Hybrid strategy: free demo + public Pro plan + consultative Enterprise.":
    "Estrategia hibrida: demo gratuita + plan Pro publico + Enterprise consultivo.",
  Starter: "Starter",
  Pro: "Pro",
  Enterprise: "Enterprise",
  "free demo": "demo gratuita",
  "per seat / month": "por usuario / mes",
  "annual contract": "contrato anual",
  "Validate the flow with one guided project.": "Valida valor con un proyecto guiado.",
  "For teams auditing every release.": "Para equipos que auditan cada release.",
  "For governance and compliance-heavy operations.": "Para operaciones con gobernanza y compliance.",
  "1 guided audit": "1 auditoria guiada",
  "Exportable report": "Reporte exportable",
  "Business-hours support": "Soporte por email en horario comercial",
  "Unlimited audits": "Auditorias ilimitadas",
  "Impact prioritization": "Priorizacion por impacto",
  "Client-ready report model": "Modelo de reporte para cliente",
  "Dedicated rollout policy": "Politicas de rollout",
  Onboarding: "Onboarding tecnico-comercial",
  "Priority SLA support": "SLA prioritario",
  "Talk to sales": "Hablar con ventas",
  "Download installer": "Descargar instalador",
  "Control QA, technical SEO, and release risk from one operational surface.":
    "Controla QA, SEO tecnico y riesgo de release desde una sola operacion.",
  "Discover why your website is losing customers": "Descubre por que tu sitio web esta perdiendo clientes",
  "Run a full technical website audit in under 60 seconds.":
    "Ejecuta una auditoria tecnica completa en menos de 60 segundos.",
  "Desktop AI Audit Platform": "Plataforma desktop de auditoria AI",
  "Website URL": "URL del sitio",
  "Analyze my website": "Analizar mi sitio",
  "Local-first engine": "Engine local",
  "Actionable reports": "Reportes accionables",
  "No cloud lock-in": "Sin lock-in de nube",
  "Enter a valid URL with http:// or https://": "Introduce una URL valida con http:// o https://",
  "Analyzing target...": "Analizando objetivo...",
  "Audit prepared. Opening demo...": "Analisis listo. Abriendo demo...",
  Problem: "Problema",
  "Most websites carry hidden issues that leak revenue": "La mayoria de sitios tiene fallos ocultos que cuestan dinero",
  "Silent technical defects reduce conversion and trust.":
    "Errores tecnicos silenciosos reducen conversion y confianza.",
  "Before vs after": "Antes vs despues",
  "Move from ad-hoc checks to evidence-based release decisions":
    "Pasa de auditorias improvisadas a decisiones de release con evidencia",
  "Prioritize what has real business impact.": "Prioriza lo que tiene impacto real de negocio.",
  Before: "Antes",
  After: "Despues",
  "Manual checklist chaos": "Checklist manual disperso",
  "Debate without root cause": "Debate sin causa raiz",
  "Frequent post-release hotfixes": "Hotfixes frecuentes tras deploy",
  "Unified QA + SEO + UX flow": "Flujo QA + SEO + UX unificado",
  "Impact-based prioritization": "Priorizacion por impacto",
  "Evidence-backed go/no-go": "Go/No-go con evidencia",
  "How it works": "Como funciona",
  "Three steps from uncertainty to action": "Tres pasos para pasar de dudas a acciones",
  "URL in, scan runs, team gets actionable output.": "URL, escaneo y salida accionable para el equipo.",
  "Define target": "Definir objetivo",
  "Set URL, scope, and business context.": "Define URL, alcance y contexto de negocio.",
  "Run audit": "Ejecutar auditoria",
  "Track stages, logs, and captured evidence.": "Sigue etapas, logs y evidencia capturada.",
  "Review findings": "Revisar hallazgos",
  "Work from severity and business impact.": "Prioriza por severidad e impacto de negocio.",
  "Decide release": "Decidir release",
  "Ship or hold with clear evidence.": "Publica o bloquea con evidencia clara.",
  Features: "Modulos",
  "Core modules for product teams and agencies": "Modulos clave para equipos de producto y agencias",
  "Everything in one operational cockpit.": "Todo en una sola superficie operativa.",
  Dashboard: "Dashboard",
  "Score, issue list, and recommendations in one place":
    "Score, lista de errores y recomendaciones en un solo lugar",
  "Built for decision-makers and execution teams.": "Disenado para decision y ejecucion tecnica.",
  "Fix missing canonical tags": "Corregir etiquetas canonical ausentes",
  "Bring mobile LCP below 2.5s": "Reducir LCP mobile por debajo de 2.5s",
  "Improve contrast on conversion-critical elements": "Mejorar contraste en elementos de conversion",
  Benefits: "Beneficios",
  "Immediate business outcomes": "Impacto de negocio inmediato",
  "Higher quality, less rework, stronger conversion.": "Mas calidad, menos retrabajo y mejor conversion.",
  "More organic traffic from stable technical SEO": "Mas trafico organico por SEO tecnico estable",
  "Fewer post-release incidents": "Menos incidentes post-deploy",
  "Better conversion on desktop and mobile": "Mejor conversion en desktop y mobile",
  "Lower support costs": "Menor coste de soporte",
  "Social proof": "Prueba social",
  "Trusted by technical and growth teams": "Equipos tecnicos que ya confian en SitePulse Studio",
  "Measured outcomes from real operations.": "Resultados medibles en operaciones reales.",
  "Run your first audit now": "Ejecuta tu primera auditoria ahora",
  "Start with a guided demo and scale when your team is ready.":
    "Empieza con demo guiada y escala cuando tu equipo lo necesite.",
  "Start audit": "Iniciar auditoria",
  "View installers": "Ver instaladores",
  "Unified commercial model": "Modelo comercial unificado",
  "Same structure across home and pricing page.": "Misma estructura entre home y pricing.",
  "Audit workflow demo": "Demo del flujo de auditoria",
  "See SitePulse Studio in a real end-to-end flow.": "Mira SitePulse Studio en un flujo real de punta a punta.",
  "How SitePulse Studio works in a real workflow": "Como funciona SitePulse Studio en un flujo real",
  "A commercial narrative with technical proof.": "Narrativa comercial con prueba tecnica.",
  "Operational flow": "Flujo operacional",
  "How to present the demo": "Como presentar la demo",
  "Real app screenshots": "Screenshots reales del app",
  "Update files in public/screenshots and Home + Demo refresh automatically.":
    "Actualiza archivos en public/screenshots y Home + Demo se refrescan automaticamente.",
  "Official installers": "Instaladores oficiales",
  "Official channel with version, date, and status.": "Canal oficial con version, fecha y estado.",
  "Official distribution channel": "Canal oficial de distribucion",
  "Publish full setup, web setup, and ZIP with release traceability.":
    "Publica setup completo, web setup y ZIP con trazabilidad de release.",
  Channel: "Canal",
  Updated: "Actualizado",
  "Full setup": "Setup completo",
  "Web setup / bootstrap": "Setup web / bootstrap",
  "Portable ZIP": "ZIP portable",
  Platform: "Plataforma",
  Version: "Version",
  Release: "Release",
  Size: "Tamano",
  Notes: "Notas",
  Available: "Disponible",
  "Request only": "Bajo solicitud",
  "Direct links are enabled after signed package publication.":
    "El enlace directo se habilita tras publicar el paquete firmado.",
  "Hash pending official publication.": "Hash pendiente hasta publicacion oficial.",
  "Direct download": "Descarga directa",
  "Request link": "Solicitar enlace",
  "Release notes": "Notas de release",
  "Commercial support": "Soporte comercial",
  "Commercial guarantees": "Garantias comerciales",
  "Guided onboarding": "Onboarding guiado",
  "No forced monthly lock-in": "Sin lock-in mensual",
  "Coordinated technical and sales support": "Soporte tecnico y comercial coordinado",
  FAQ: "FAQ",
  "Frequently asked questions": "Preguntas frecuentes",
  "Answers for buying, installation, and operation.": "Respuestas sobre compra, instalacion y operacion.",
  "Answers to real buying objections": "Respuestas a objeciones reales de compra",
  "Common questions from technical teams and agencies.":
    "Preguntas comunes de equipos tecnicos y agencias.",
  "Is this desktop software or cloud?": "Es software desktop o cloud?",
  "Core product is desktop-first with a local engine. The website is the commercial and distribution layer.":
    "El producto principal es desktop con engine local. La web es la capa comercial y de distribucion.",
  "How long does an audit take?": "Cuanto tarda una auditoria?",
  "First findings typically arrive in under 60 seconds, depending on selected scope.":
    "Los primeros hallazgos suelen llegar en menos de 60 segundos segun alcance.",
  "How are installers updated?": "Como se actualizan los instaladores?",
  "One centralized config keeps home, pricing, and downloads in sync.":
    "Una configuracion central mantiene home, pricing y downloads sincronizados.",
  "Can agencies use it for multiple clients?": "Sirve para agencias con varios clientes?",
  "Yes. Enterprise supports multi-account governance workflows.":
    "Si. Enterprise soporta flujos multi-cuenta con gobernanza.",
  "Commercial contact": "Contacto comercial",
  "Request a demo, proposal, or commercial support.": "Solicita demo, propuesta o soporte comercial.",
  "Talk to the commercial team": "Habla con el equipo comercial",
  "Share clear context to get a useful and fast proposal.":
    "Comparte contexto claro para recibir una propuesta util y rapida.",
  "Direct channels": "Canales directos",
  "Sales, partners, and technical pre-sales support.":
    "Ventas, partners y soporte tecnico de pre-venta.",
  "Request contact": "Solicitar contacto",
  "Form with validation and real-time feedback states.": "Formulario con validacion y feedback en tiempo real.",
  Name: "Nombre",
  "Business email": "Email corporativo",
  Company: "Empresa",
  "Project context": "Contexto del proyecto",
  "Your name": "Tu nombre",
  "Company name": "Nombre de empresa",
  "Describe goals, release volume, and your biggest current risk.":
    "Describe objetivos, volumen de releases y principal riesgo actual.",
  "Please enter a valid name.": "Introduce un nombre valido.",
  "Please enter a valid business email.": "Introduce un email corporativo valido.",
  "Please enter your company.": "Introduce tu empresa.",
  "Please include at least 30 characters of context.": "Incluye al menos 30 caracteres de contexto.",
  "Send request": "Enviar solicitud",
  "Sending...": "Enviando...",
  "Request sent. Our team will contact you shortly.": "Solicitud enviada. Te contactamos en breve.",
  "Could not send request. Please retry or use direct email.":
    "No se pudo enviar la solicitud. Intenta de nuevo o usa email directo.",
};

const caMap: Record<string, string> = {
  Language: "Idioma",
  Home: "Inici",
  Downloads: "Instal.ladors",
  Pricing: "Preus",
  Contact: "Contacte",
  "View demo": "Veure demo",
  Download: "Baixar",
  "Open menu": "Obrir menu",
  "Close menu": "Tancar menu",
  "Dark mode": "Mode fosc",
  "Light mode": "Mode clar",
  Privacy: "Privacitat",
  "All rights reserved.": "Tots els drets reservats.",
  "Plans and pricing": "Plans i preus",
  "Plans designed for conversion": "Plans llestos per conversio",
  "Hybrid strategy: free demo + public Pro plan + consultative Enterprise.":
    "Estrategia hibrida: demo gratuita + pla Pro public + Enterprise consultiu.",
  Starter: "Starter",
  Pro: "Pro",
  Enterprise: "Enterprise",
  "free demo": "demo gratuita",
  "per seat / month": "per usuari / mes",
  "annual contract": "contracte anual",
  "Validate the flow with one guided project.": "Valida valor amb un projecte guiat.",
  "For teams auditing every release.": "Per equips que auditen cada release.",
  "For governance and compliance-heavy operations.": "Per operacions amb governanca i compliance.",
  "1 guided audit": "1 auditoria guiada",
  "Exportable report": "Informe exportable",
  "Business-hours support": "Suport per email en horari comercial",
  "Unlimited audits": "Auditories il.limitades",
  "Impact prioritization": "Prioritzacio per impacte",
  "Client-ready report model": "Model d informe per client",
  "Dedicated rollout policy": "Policies de rollout",
  Onboarding: "Onboarding tecnic-comercial",
  "Priority SLA support": "SLA prioritari",
  "Talk to sales": "Parlar amb vendes",
  "Download installer": "Baixar instal.lador",
  "Control QA, technical SEO, and release risk from one operational surface.":
    "Controla QA, SEO tecnic i risc de release des d una sola operacio.",
  "Discover why your website is losing customers": "Descobreix per que el teu web esta perdent clients",
  "Run a full technical website audit in under 60 seconds.":
    "Executa una auditoria tecnica completa en menys de 60 segons.",
  "Desktop AI Audit Platform": "Plataforma desktop d auditoria AI",
  "Website URL": "URL del web",
  "Analyze my website": "Analitzar el meu web",
  "Local-first engine": "Engine local",
  "Actionable reports": "Informes accionables",
  "No cloud lock-in": "Sense lock-in de nuvol",
  "Enter a valid URL with http:// or https://": "Introdueix una URL valida amb http:// o https://",
  "Analyzing target...": "Analitzant objectiu...",
  "Audit prepared. Opening demo...": "Analisi llesta. Obrint demo...",
  Problem: "Problema",
  "Most websites carry hidden issues that leak revenue": "La majoria de webs te errors ocults que costen diners",
  "Silent technical defects reduce conversion and trust.":
    "Errors tecnics silenciosos redueixen conversio i confiança.",
  "Before vs after": "Abans vs despres",
  "Move from ad-hoc checks to evidence-based release decisions":
    "Passa d auditories improvisades a decisions de release amb evidencia",
  "Prioritize what has real business impact.": "Prioritza el que te impacte real de negoci.",
  Before: "Abans",
  After: "Despres",
  "Manual checklist chaos": "Checklist manual dispers",
  "Debate without root cause": "Debat sense causa arrel",
  "Frequent post-release hotfixes": "Hotfixes frequents despres del deploy",
  "Unified QA + SEO + UX flow": "Flux QA + SEO + UX unificat",
  "Impact-based prioritization": "Prioritzacio per impacte",
  "Evidence-backed go/no-go": "Go/No-go amb evidencia",
  "How it works": "Com funciona",
  "Three steps from uncertainty to action": "Tres passos per passar de dubtes a accions",
  "URL in, scan runs, team gets actionable output.": "URL, escaneig i sortida accionable per l equip.",
  "Define target": "Definir objectiu",
  "Set URL, scope, and business context.": "Defineix URL, abast i context de negoci.",
  "Run audit": "Executar auditoria",
  "Track stages, logs, and captured evidence.": "Segueix etapes, logs i evidencia capturada.",
  "Review findings": "Revisar incidencies",
  "Work from severity and business impact.": "Prioritza per severitat i impacte de negoci.",
  "Decide release": "Decidir release",
  "Ship or hold with clear evidence.": "Publica o bloqueja amb evidencia clara.",
  Features: "Moduls",
  "Core modules for product teams and agencies": "Moduls clau per equips de producte i agencies",
  "Everything in one operational cockpit.": "Tot en una sola superficie operativa.",
  Dashboard: "Dashboard",
  "Score, issue list, and recommendations in one place":
    "Score, llista d errors i recomanacions en un sol lloc",
  "Built for decision-makers and execution teams.": "Dissenyat per decisio i execucio tecnica.",
  "Fix missing canonical tags": "Corregir etiquetes canonical absents",
  "Bring mobile LCP below 2.5s": "Reduir LCP mobile per sota de 2.5s",
  "Improve contrast on conversion-critical elements": "Millorar contrast en elements de conversio",
  Benefits: "Beneficis",
  "Immediate business outcomes": "Impacte de negoci immediat",
  "Higher quality, less rework, stronger conversion.": "Mes qualitat, menys retraball i millor conversio.",
  "More organic traffic from stable technical SEO": "Mes trafic organic per SEO tecnic estable",
  "Fewer post-release incidents": "Menys incidencies post-deploy",
  "Better conversion on desktop and mobile": "Millor conversio en desktop i mobile",
  "Lower support costs": "Menor cost de suport",
  "Social proof": "Prova social",
  "Trusted by technical and growth teams": "Equips tecnics que ja confien en SitePulse Studio",
  "Measured outcomes from real operations.": "Resultats mesurables en operacions reals.",
  "Run your first audit now": "Executa la teva primera auditoria ara",
  "Start with a guided demo and scale when your team is ready.":
    "Comenca amb demo guiada i escala quan l equip ho necessiti.",
  "Start audit": "Iniciar auditoria",
  "View installers": "Veure instal.ladors",
  "Unified commercial model": "Model comercial unificat",
  "Same structure across home and pricing page.": "Mateixa estructura entre home i pricing.",
  "Audit workflow demo": "Demo del flux d auditoria",
  "See SitePulse Studio in a real end-to-end flow.": "Mira SitePulse Studio en un flux real de punta a punta.",
  "How SitePulse Studio works in a real workflow": "Com funciona SitePulse Studio en un flux real",
  "A commercial narrative with technical proof.": "Narrativa comercial amb prova tecnica.",
  "Operational flow": "Flux operacional",
  "How to present the demo": "Com presentar la demo",
  "Real app screenshots": "Screenshots reals de l app",
  "Update files in public/screenshots and Home + Demo refresh automatically.":
    "Actualitza arxius a public/screenshots i Home + Demo es refresquen automaticament.",
  "Official installers": "Instal.ladors oficials",
  "Official channel with version, date, and status.": "Canal oficial amb versio, data i estat.",
  "Official distribution channel": "Canal oficial de distribucio",
  "Publish full setup, web setup, and ZIP with release traceability.":
    "Publica setup complet, web setup i ZIP amb tracabilitat de release.",
  Channel: "Canal",
  Updated: "Actualitzat",
  "Full setup": "Setup complet",
  "Web setup / bootstrap": "Setup web / bootstrap",
  "Portable ZIP": "ZIP portable",
  Platform: "Plataforma",
  Version: "Versio",
  Release: "Release",
  Size: "Mida",
  Notes: "Notes",
  Available: "Disponible",
  "Request only": "Sota sollicitud",
  "Direct links are enabled after signed package publication.":
    "L enllac directe s habilita despres de publicar el paquet signat.",
  "Hash pending official publication.": "Hash pendent fins publicacio oficial.",
  "Direct download": "Descarrega directa",
  "Request link": "Solicitar enllac",
  "Release notes": "Notes de release",
  "Commercial support": "Suport comercial",
  "Commercial guarantees": "Garanties comercials",
  "Guided onboarding": "Onboarding guiat",
  "No forced monthly lock-in": "Sense lock-in mensual",
  "Coordinated technical and sales support": "Suport tecnic i comercial coordinat",
  FAQ: "FAQ",
  "Frequently asked questions": "Preguntes frequents",
  "Answers for buying, installation, and operation.": "Respostes sobre compra, instal.lacio i operacio.",
  "Answers to real buying objections": "Respostes a objeccions reals de compra",
  "Common questions from technical teams and agencies.": "Preguntes comunes d equips tecnics i agencies.",
  "Is this desktop software or cloud?": "Es software desktop o cloud?",
  "Core product is desktop-first with a local engine. The website is the commercial and distribution layer.":
    "El producte principal es desktop amb engine local. El web es la capa comercial i de distribucio.",
  "How long does an audit take?": "Quant tarda una auditoria?",
  "First findings typically arrive in under 60 seconds, depending on selected scope.":
    "Els primers resultats solen arribar en menys de 60 segons segons abast.",
  "How are installers updated?": "Com s actualitzen els instal.ladors?",
  "One centralized config keeps home, pricing, and downloads in sync.":
    "Una configuracio central mante home, pricing i downloads sincronitzats.",
  "Can agencies use it for multiple clients?": "Serveix per agencies amb diversos clients?",
  "Yes. Enterprise supports multi-account governance workflows.":
    "Si. Enterprise suporta fluxos multi-compte amb governanca.",
  "Commercial contact": "Contacte comercial",
  "Request a demo, proposal, or commercial support.": "Solicita demo, proposta o suport comercial.",
  "Talk to the commercial team": "Parla amb l equip comercial",
  "Share clear context to get a useful and fast proposal.":
    "Comparteix context clar per rebre una proposta util i rapida.",
  "Direct channels": "Canals directes",
  "Sales, partners, and technical pre-sales support.": "Vendes, partners i suport tecnic de pre-venda.",
  "Request contact": "Solicitar contacte",
  "Form with validation and real-time feedback states.": "Formulari amb validacio i feedback en temps real.",
  Name: "Nom",
  "Business email": "Email corporatiu",
  Company: "Empresa",
  "Project context": "Context del projecte",
  "Your name": "El teu nom",
  "Company name": "Nom d empresa",
  "Describe goals, release volume, and your biggest current risk.":
    "Descriu objectius, volum de releases i principal risc actual.",
  "Please enter a valid name.": "Introdueix un nom valid.",
  "Please enter a valid business email.": "Introdueix un email corporatiu valid.",
  "Please enter your company.": "Introdueix la teva empresa.",
  "Please include at least 30 characters of context.": "Inclou almenys 30 caracters de context.",
  "Send request": "Enviar sollicitud",
  "Sending...": "Enviant...",
  "Request sent. Our team will contact you shortly.": "Sollicitud enviada. Et contactem en breu.",
  "Could not send request. Please retry or use direct email.":
    "No s ha pogut enviar la sollicitud. Torna a provar o usa email directe.",
};

const en = createEnglishMessages();
const es = localize(en, "Espanol", esMap);
const ca = localize(en, "Catala", caMap);

export const messages: Record<Locale, SiteMessages> = {
  en,
  es,
  ca,
};

export function getMessages(locale: Locale): SiteMessages {
  return messages[locale];
}

export type { MetaMessage, PlanItem, SiteMessages };

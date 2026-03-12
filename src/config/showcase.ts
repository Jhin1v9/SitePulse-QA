import type { Locale } from "@/src/i18n/config";

export interface AppPreview {
  id: string;
  title: string;
  summary: string;
  imagePath: string;
  alt: string;
  focusLabel: string;
}

export interface BuyerReason {
  title: string;
  detail: string;
}

export interface UsageStep {
  title: string;
  detail: string;
}

export interface SocialProofItem {
  company: string;
  role: string;
  quote: string;
  impact: string;
}

export interface CaseSnapshot {
  name: string;
  segment: string;
  result: string;
  summary: string;
}

const previewCatalog: Record<Locale, readonly AppPreview[]> = {
  en: [
    {
      id: "operations",
      title: "Operations panel",
      summary: "Tracks audit progress, stages, runtime logs, and release risk from one operational surface.",
      imagePath: "/screenshots/studio-operations.svg",
      alt: "Preview of the SitePulse Studio operations panel.",
      focusLabel: "Live operations",
    },
    {
      id: "evidence",
      title: "Evidence report",
      summary: "Groups findings by severity, cause, impact, and recommendation for release decision making.",
      imagePath: "/screenshots/studio-evidence.svg",
      alt: "Preview of the SitePulse Studio evidence report.",
      focusLabel: "Technical evidence",
    },
    {
      id: "seo",
      title: "Integrated technical SEO",
      summary: "Validates indexing, metadata, and technical SEO signals before publication to reduce regressions.",
      imagePath: "/screenshots/studio-seo.svg",
      alt: "Preview of the technical SEO analysis in SitePulse Studio.",
      focusLabel: "SEO baseline",
    },
  ],
  es: [
    {
      id: "operations",
      title: "Panel de operaciones",
      summary: "Monitorea progreso de auditoria, etapas, logs y riesgo de release en una sola superficie.",
      imagePath: "/screenshots/studio-operations.svg",
      alt: "Vista del panel de operaciones de SitePulse Studio.",
      focusLabel: "Operacion en vivo",
    },
    {
      id: "evidence",
      title: "Reporte de evidencia",
      summary: "Agrupa hallazgos por severidad, causa, impacto y recomendacion para decidir el release.",
      imagePath: "/screenshots/studio-evidence.svg",
      alt: "Vista del reporte de evidencia de SitePulse Studio.",
      focusLabel: "Evidencia tecnica",
    },
    {
      id: "seo",
      title: "SEO tecnico integrado",
      summary: "Valida indexacion, metadatos y senales SEO tecnicas antes de publicar para reducir regresiones.",
      imagePath: "/screenshots/studio-seo.svg",
      alt: "Vista del analisis de SEO tecnico en SitePulse Studio.",
      focusLabel: "Baseline SEO",
    },
  ],
  ca: [
    {
      id: "operations",
      title: "Panell d operacions",
      summary: "Monitora progres d auditoria, etapes, logs i risc de release en una sola superficie.",
      imagePath: "/screenshots/studio-operations.svg",
      alt: "Vista del panell d operacions de SitePulse Studio.",
      focusLabel: "Operacio en viu",
    },
    {
      id: "evidence",
      title: "Informe d evidencia",
      summary: "Agrupa troballes per severitat, causa, impacte i recomanacio per decidir el release.",
      imagePath: "/screenshots/studio-evidence.svg",
      alt: "Vista de l informe d evidencia de SitePulse Studio.",
      focusLabel: "Evidencia tecnica",
    },
    {
      id: "seo",
      title: "SEO tecnic integrat",
      summary: "Valida indexacio, metadades i senyals SEO tecniques abans de publicar per reduir regressions.",
      imagePath: "/screenshots/studio-seo.svg",
      alt: "Vista de l analisi de SEO tecnic a SitePulse Studio.",
      focusLabel: "Baseline SEO",
    },
  ],
};

export function getAppPreviews(locale: Locale): readonly AppPreview[] {
  return previewCatalog[locale];
}

export const buyerReasons: readonly BuyerReason[] = [
  {
    title: "Para que serve",
    detail:
      "Evitar release cega. O SitePulse Studio transforma validacao tecnica em operacao rastreavel para reduzir falha em producao.",
  },
  {
    title: "Para quem serve",
    detail:
      "Times de produto, QA e engenharia que precisam de velocidade com controle, sem depender de checklist manual disperso.",
  },
  {
    title: "Porque comprar agora",
    detail:
      "Cada falha evitada reduz custo de suporte, reputacao e retrabalho. O ROI aparece na primeira rotina de release.",
  },
];

export const usageSteps: readonly UsageStep[] = [
  {
    title: "1. Defina alvo e objetivo",
    detail: "Informe dominio, escopo de auditoria e ambiente para iniciar uma execucao padronizada.",
  },
  {
    title: "2. Rode a engine local",
    detail: "Acompanhe ao vivo o protocolo com status operacional e checkpoints de qualidade.",
  },
  {
    title: "3. Leia o relatorio",
    detail: "Analise severidade, causa e impacto para priorizar correcoes antes do deploy.",
  },
  {
    title: "4. Decida com confianca",
    detail: "Aprove, bloqueie ou reprograme a release com base em evidencia tecnica objetiva.",
  },
];

export const socialProofItems: readonly SocialProofItem[] = [
  {
    company: "Nexa Commerce",
    role: "Head of QA",
    quote:
      "Paramos de discutir opiniao na hora da release. O SitePulse Studio entrega diagnostico tecnico claro para decidir rapido.",
    impact: "-41% incidentes pos-deploy em 90 dias",
  },
  {
    company: "Orbit Fintech",
    role: "Product Engineering Manager",
    quote:
      "Com a trilha de evidencias, o time reduziu rollback e ganhou previsibilidade sem perder velocidade de entrega.",
    impact: "2.1x mais throughput de validacao",
  },
  {
    company: "Atlas Growth",
    role: "SEO Lead",
    quote:
      "A integracao de SEO tecnico no mesmo fluxo de QA evitou regressao organica em campanhas criticas.",
    impact: "+18% estabilidade de paginas indexadas",
  },
];

export const caseSnapshots: readonly CaseSnapshot[] = [
  {
    name: "Case Retail",
    segment: "E-commerce",
    result: "-38% retrabalho",
    summary: "Padronizou auditoria de release em squads e reduziu custo de hotfix na operacao.",
  },
  {
    name: "Case SaaS B2B",
    segment: "Software",
    result: "-44% falhas criticas",
    summary: "Implementou gate tecnico antes do deploy e melhorou taxa de aprovacao de release.",
  },
  {
    name: "Case Portal Conteudo",
    segment: "Midia digital",
    result: "+27% eficiencia SEO",
    summary: "Ajustou risco tecnico de indexacao antes da publicacao de paginas estrategicas.",
  },
];

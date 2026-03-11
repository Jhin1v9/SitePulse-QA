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

export const appPreviews: readonly AppPreview[] = [
  {
    id: "operations",
    title: "Painel de Operacoes",
    summary: "Monitora progresso da auditoria, estagios, logs e status de risco em tempo real.",
    imagePath: "/screenshots/studio-operations.svg",
    alt: "Preview do painel de operacoes do SitePulse Studio.",
    focusLabel: "Operacao ao vivo",
  },
  {
    id: "evidence",
    title: "Relatorio de Evidencias",
    summary: "Consolida achados por severidade, causa, impacto e recomendacao para decisao de release.",
    imagePath: "/screenshots/studio-evidence.svg",
    alt: "Preview do relatorio de evidencias do SitePulse Studio.",
    focusLabel: "Diagnostico tecnico",
  },
  {
    id: "seo",
    title: "SEO Tecnico Integrado",
    summary: "Valida indexacao, metadados e sinais tecnicos antes da publicacao para reduzir regressao organica.",
    imagePath: "/screenshots/studio-seo.svg",
    alt: "Preview da analise de SEO tecnico no SitePulse Studio.",
    focusLabel: "Baseline de SEO",
  },
];

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

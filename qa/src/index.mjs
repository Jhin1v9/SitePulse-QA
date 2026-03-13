#!/usr/bin/env node
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { loadIssueLearningStore, saveIssueLearningStore } from "./issue-learning-store.mjs";
import { attachLearningSnapshot, ingestCompletedRun, resolveLearningForIssue } from "./issue-learning-service.mjs";

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_PARTIAL = 2;
const CHECKPOINT_VERSION = 1;
const SERVERLESS_ENV_KEYS = [
  "VERCEL",
  "AWS_LAMBDA_FUNCTION_VERSION",
  "AWS_EXECUTION_ENV",
  "LAMBDA_TASK_ROOT",
  "SITEPULSE_FORCE_SERVERLESS_CHROMIUM",
];
const STATIC_ASSET_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".avif",
  ".bmp",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".mp4",
  ".webm",
  ".mp3",
  ".wav",
];
const TELEMETRY_DOMAINS = [
  "google-analytics.com",
  "googletagmanager.com",
];
const LANGUAGE_STOPWORDS = {
  es: [
    "para",
    "como",
    "sitio",
    "equipo",
    "ventas",
    "prueba",
    "instalador",
    "contacto",
    "precios",
    "descargar",
    "hallazgos",
    "flujo",
    "seguridad",
  ],
  ca: [
    "per",
    "amb",
    "equip",
    "descarrega",
    "contacte",
    "preus",
    "evidencia",
    "lloc",
    "solucio",
    "pantalla",
    "auditoria",
    "prova",
    "flux",
  ],
  en: [
    "with",
    "from",
    "your",
    "website",
    "download",
    "pricing",
    "contact",
    "proof",
    "report",
    "issues",
    "security",
    "performance",
    "workflow",
    "release",
    "start",
    "current",
  ],
  pt: [
    "com",
    "para",
    "vendas",
    "precos",
    "baixar",
    "contato",
    "solucao",
    "prova",
    "relatorio",
    "equipe",
    "fluxo",
    "seguranca",
    "usuario",
  ],
};
const LANGUAGE_LABEL = {
  es: "espanhol",
  ca: "catalao",
  en: "ingles",
  pt: "portugues",
};

let activeLearningRuntime = {
  storePath: "",
  store: { entries: {}, lastRunByContext: {}, processedRuns: [], updatedAt: "" },
};

const CODE = {
  ROUTE_LOAD_FAIL: "ROUTE_LOAD_FAIL",
  BTN_CLICK_ERROR: "BTN_CLICK_ERROR",
  BTN_NO_EFFECT: "BTN_NO_EFFECT",
  HTTP_4XX: "HTTP_4XX",
  HTTP_5XX: "HTTP_5XX",
  NET_REQUEST_FAILED: "NET_REQUEST_FAILED",
  JS_RUNTIME_ERROR: "JS_RUNTIME_ERROR",
  CONSOLE_ERROR: "CONSOLE_ERROR",
  CONTENT_LANGUAGE_CONFLICT: "CONTENT_LANGUAGE_CONFLICT",
  VISUAL_SECTION_ORDER_INVALID: "VISUAL_SECTION_ORDER_INVALID",
  VISUAL_SECTION_MISSING: "VISUAL_SECTION_MISSING",
  VISUAL_LAYOUT_OVERFLOW: "VISUAL_LAYOUT_OVERFLOW",
  VISUAL_LAYER_OVERLAP: "VISUAL_LAYER_OVERLAP",
  VISUAL_ALIGNMENT_DRIFT: "VISUAL_ALIGNMENT_DRIFT",
  VISUAL_TIGHT_SPACING: "VISUAL_TIGHT_SPACING",
  VISUAL_GAP_INCONSISTENCY: "VISUAL_GAP_INCONSISTENCY",
  VISUAL_EDGE_HUGGING: "VISUAL_EDGE_HUGGING",
  VISUAL_WIDTH_INCONSISTENCY: "VISUAL_WIDTH_INCONSISTENCY",
  VISUAL_BOUNDARY_COLLISION: "VISUAL_BOUNDARY_COLLISION",
  VISUAL_FOLD_PRESSURE: "VISUAL_FOLD_PRESSURE",
  VISUAL_HIERARCHY_COLLAPSE: "VISUAL_HIERARCHY_COLLAPSE",
  VISUAL_CLUSTER_COLLISION: "VISUAL_CLUSTER_COLLISION",
};

const ACTION_STATUS = {
  CLICKED_EFFECT: "clicked_effect",
  CLICKED_NO_EFFECT: "clicked_no_effect",
  SKIPPED_NOT_VISIBLE: "skipped_not_visible",
  SKIPPED_DISABLED: "skipped_disabled",
  SKIPPED_ACTIVE: "skipped_already_active",
  CLICK_ERROR: "click_error",
  ANALYSIS_ONLY: "analysis_only",
  ROUTE_LIMIT: "route_limit",
};

const ISSUE_GUIDE = {
  [CODE.ROUTE_LOAD_FAIL]: {
    technical:
      "Falha ao abrir a rota dentro do timeout configurado. Pode envolver erro de render, middleware, auth ou timeout de backend.",
    layman:
      "A pagina nao abriu quando deveria. Para o usuario final, parece que o site travou ou ficou indisponivel.",
    recommendation:
      "Validar middleware/auth, tempo de resposta e erros do servidor para a rota; adicionar fallback visual para carregamento.",
  },
  [CODE.BTN_CLICK_ERROR]: {
    technical:
      "O clique do botao gerou excecao de automacao ou estado invalido na interface.",
    layman:
      "O botao existe, mas ao clicar ele falha em vez de executar a acao esperada.",
    recommendation:
      "Revisar handler do botao, estado desabilitado, seletores e erros de runtime ligados ao evento de clique.",
  },
  [CODE.BTN_NO_EFFECT]: {
    technical:
      "Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.",
    layman:
      "O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.",
    recommendation:
      "Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.",
  },
  [CODE.HTTP_4XX]: {
    technical:
      "Requisicao da interface retornou erro 4xx, geralmente payload invalido, permissao ausente ou endpoint incorreto.",
    layman:
      "O site tentou falar com o servidor, mas a requisicao foi rejeitada por erro de dados ou permissao.",
    recommendation:
      "Conferir contrato da API, autenticacao/autorizacao e validacao de campos antes de enviar.",
  },
  [CODE.HTTP_5XX]: {
    technical:
      "Requisicao da interface retornou erro 5xx, indicando falha interna no backend ou dependencia.",
    layman:
      "O servidor caiu ou nao conseguiu processar a acao pedida pelo usuario.",
    recommendation:
      "Investigar logs do backend, tratar excecoes, aplicar retry/fallback e monitoramento no endpoint afetado.",
  },
  [CODE.NET_REQUEST_FAILED]: {
    technical:
      "A requisicao falhou na camada de rede (DNS, conexao, CORS, timeout, cancelamento nao esperado).",
    layman:
      "O site tentou buscar dados, mas a comunicacao com o servidor falhou.",
    recommendation:
      "Verificar disponibilidade da API, CORS, URL/basePath e implementar mensagem amigavel com tentativa de nova carga.",
  },
  [CODE.JS_RUNTIME_ERROR]: {
    technical:
      "Erro de JavaScript em runtime no navegador, potencialmente quebrando fluxo ou renderizacao.",
    layman:
      "Uma falha de codigo no navegador interrompeu parte do funcionamento da tela.",
    recommendation:
      "Adicionar tratamento de erro, validacao de null/undefined e cobertura de testes para o fluxo afetado.",
  },
  [CODE.CONSOLE_ERROR]: {
    technical:
      "Mensagem de erro registrada no console do navegador durante a navegacao auditada.",
    layman:
      "Algo deu errado por baixo dos panos, mesmo que a tela ainda apareca.",
    recommendation:
      "Inspecionar stack/message no console, remover erros silenciosos e corrigir integracoes quebradas.",
  },
  [CODE.CONTENT_LANGUAGE_CONFLICT]: {
    technical:
      "A pagina declara um idioma principal, mas ainda exibe blocos relevantes em outro idioma visivel. Isso normalmente indica i18n incompleto, textos hardcoded ou rotas reutilizando copy errada.",
    layman:
      "A tela mistura idiomas diferentes. Para quem visita, isso passa falta de acabamento e reduz confianca.",
    recommendation:
      "Identificar os textos fora do idioma principal, mover toda a copy para a camada oficial de traducao e validar novamente a rota inteira.",
  },
  [CODE.VISUAL_SECTION_ORDER_INVALID]: {
    technical:
      "A ordem visual entre secoes no DOM/scroll esta invertida para uma regra funcional esperada (ex.: FAQ renderizada abaixo do footer).",
    layman:
      "As partes da pagina aparecem na ordem errada. Isso confunde o usuario e quebra o fluxo da leitura.",
    recommendation:
      "Revisar o plano de renderizacao das secoes e garantir que a secao anterior obrigatoria venha antes da posterior em todas as viewports.",
  },
  [CODE.VISUAL_SECTION_MISSING]: {
    technical:
      "Uma secao obrigatoria da regra visual nao foi encontrada ou nao ficou visivel na rota auditada.",
    layman:
      "Uma parte importante da pagina nao apareceu quando deveria.",
    recommendation:
      "Validar condicoes de exibicao, IDs/seletores, dados de configuracao e flags mobile/desktop para garantir renderizacao consistente.",
  },
  [CODE.VISUAL_LAYOUT_OVERFLOW]: {
    technical:
      "Um bloco visual excedeu a largura util do viewport e esta vazando horizontalmente ou cortando a composicao.",
    layman:
      "Parte da interface esta saindo para fora da tela ou ficando espremida de um jeito errado.",
    recommendation:
      "Revisar widths/min-widths, containers, imagens e widgets fixos para impedir overflow horizontal e manter o layout dentro do viewport.",
  },
  [CODE.VISUAL_LAYER_OVERLAP]: {
    technical:
      "Dois blocos visuais relevantes estao ocupando a mesma area renderizada, sugerindo colisao de camadas ou empilhamento incorreto.",
    layman:
      "Um elemento esta ficando em cima do outro de um jeito que atrapalha a leitura ou o uso da tela.",
    recommendation:
      "Corrigir stacking, offsets, alturas e posicionamento para impedir que cards, secoes ou overlays cubram conteudo principal.",
  },
  [CODE.VISUAL_ALIGNMENT_DRIFT]: {
    technical:
      "Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.",
    layman:
      "Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.",
    recommendation:
      "Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.",
  },
  [CODE.VISUAL_TIGHT_SPACING]: {
    technical:
      "Blocos relevantes ficaram com espacamento vertical apertado demais, sugerindo colisoes proximas, respiracao insuficiente ou composicao comprimida.",
    layman:
      "Partes grandes da tela ficaram grudadas demais, como se faltasse respiro entre os blocos.",
    recommendation:
      "Aumentar espacamento vertical entre secoes/cards principais, revisar margins e garantir uma hierarquia visual com respiracao consistente.",
  },
  [CODE.VISUAL_GAP_INCONSISTENCY]: {
    technical:
      "A malha vertical perdeu consistencia: gaps equivalentes entre blocos variam demais e quebram o ritmo do layout.",
    layman:
      "A distancia entre partes parecidas da tela muda demais e a pagina fica visualmente sem padrao.",
    recommendation:
      "Padronizar a escala de espacamento entre secoes equivalentes e remover gaps isolados que deixam a composicao irregular.",
  },
  [CODE.VISUAL_EDGE_HUGGING]: {
    technical:
      "Um bloco estrutural ficou proximo demais da borda util do viewport, sem gutter suficiente para manter leitura e respiracao.",
    layman:
      "Uma parte importante da tela ficou grudada demais na lateral, como se faltasse margem para a interface respirar.",
    recommendation:
      "Revisar gutters laterais, paddings de container e alinhamento de cards/sections para manter afastamento consistente das bordas.",
  },
  [CODE.VISUAL_WIDTH_INCONSISTENCY]: {
    technical:
      "Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.",
    layman:
      "Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.",
    recommendation:
      "Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.",
  },
  [CODE.VISUAL_BOUNDARY_COLLISION]: {
    technical:
      "Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.",
    layman:
      "Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.",
    recommendation:
      "Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.",
  },
  [CODE.VISUAL_FOLD_PRESSURE]: {
    technical:
      "A primeira dobra da pagina concentrou blocos demais em pouco espaco util, comprimindo leitura, hierarquia e respiracao visual.",
    layman:
      "Tem coisa demais logo no comeco da pagina. A tela fica pesada e dificulta entender o que e mais importante.",
    recommendation:
      "Simplificar a primeira dobra, mover conteudo secundario para baixo e reforcar hierarquia entre hero, prova principal, CTA e indicadores.",
  },
  [CODE.VISUAL_HIERARCHY_COLLAPSE]: {
    technical:
      "Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.",
    layman:
      "O titulo e o texto ficaram parecidos demais. Isso enfraquece a leitura e dificulta entender o que e principal.",
    recommendation:
      "Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.",
  },
  [CODE.VISUAL_CLUSTER_COLLISION]: {
    technical:
      "Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.",
    layman:
      "Cards ou blocos lado a lado ficaram grudados demais, como se a grade estivesse apertada ou sem espaco para respirar.",
    recommendation:
      "Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.",
  },
};

const ISSUE_PLAYBOOK = {
  [CODE.ROUTE_LOAD_FAIL]: {
    priority: "P0",
    firstChecks: [
      "Reproduzir a rota no browser com logs do servidor ativos.",
      "Validar middleware/auth/redirect da rota.",
      "Conferir timeout e dependencias externas da pagina.",
    ],
    commandHints: [
      "rg -n \"middleware|redirect\\(|notFound\\(|throw new Error\" src",
      "rg -n \"export default function|generateMetadata|getServerSideProps|fetch\\(\" src/app src",
    ],
    likelyAreas: [
      "src/app/**/page.tsx",
      "src/middleware.ts",
      "src/app/api/**/route.ts",
    ],
  },
  [CODE.BTN_CLICK_ERROR]: {
    priority: "P1",
    firstChecks: [
      "Inspecionar handler onClick e estado disabled/loading.",
      "Verificar se elemento clicavel esta coberto por overlay.",
      "Reproduzir erro no console e stack trace.",
    ],
    commandHints: [
      "rg -n \"onClick|disabled|aria-disabled|pointer-events\" src/components src/app",
      "rg -n \"try\\s*\\{|catch\\s*\\(\" src/components src/app",
    ],
    likelyAreas: [
      "src/components/**",
      "src/app/**",
    ],
  },
  [CODE.BTN_NO_EFFECT]: {
    priority: "P1",
    firstChecks: [
      "Checar se o clique altera URL, estado, modal, scroll ou request.",
      "Garantir feedback visual e tratamento de sucesso/erro.",
      "Confirmar que callbacks nao estao vazios ou condicionados indevidamente.",
    ],
    commandHints: [
      "rg -n \"onClick|scrollToSection|router\\.push|setState|set[A-Z]\" src/components src/lib",
      "rg -n \"TODO|placeholder|noop|return;\" src/components src/app",
    ],
    likelyAreas: [
      "src/components/layout/**",
      "src/components/sections/**",
    ],
  },
  [CODE.HTTP_4XX]: {
    priority: "P1",
    firstChecks: [
      "Validar payload enviado e schema esperado no endpoint.",
      "Revisar autenticacao/autorizacao e headers.",
      "Checar rota e metodo HTTP corretos.",
    ],
    commandHints: [
      "rg -n \"fetch\\(|axios|/api/|POST|PATCH|PUT|DELETE\" src",
      "rg -n \"zod|schema|safeParse|parse\\(\" src",
    ],
    likelyAreas: [
      "src/app/api/**/route.ts",
      "src/lib/**",
      "src/components/**",
    ],
  },
  [CODE.HTTP_5XX]: {
    priority: "P0",
    firstChecks: [
      "Ler logs do backend na hora da falha.",
      "Capturar stack trace e parametros de entrada.",
      "Aplicar tratamento de excecao + resposta consistente.",
    ],
    commandHints: [
      "rg -n \"throw new Error|console\\.error|try\\s*\\{|catch\\s*\\(\" src/app/api src/lib",
      "rg -n \"createClient|supabase|db|storage\" src",
    ],
    likelyAreas: [
      "src/app/api/**/route.ts",
      "src/lib/**",
    ],
  },
  [CODE.NET_REQUEST_FAILED]: {
    priority: "P1",
    firstChecks: [
      "Verificar URL/basePath/CORS e disponibilidade do endpoint.",
      "Validar timeouts e cancelamentos inesperados.",
      "Garantir fallback na UI para falha de rede.",
    ],
    commandHints: [
      "rg -n \"fetch\\(|AbortController|signal|timeout|baseUrl\" src",
      "rg -n \"CORS|origin|headers\" src/app/api src/lib",
    ],
    likelyAreas: [
      "src/lib/**",
      "src/components/**",
      "src/app/api/**/route.ts",
    ],
  },
  [CODE.JS_RUNTIME_ERROR]: {
    priority: "P0",
    firstChecks: [
      "Mapear stack do erro no console para arquivo/linha.",
      "Corrigir null/undefined e estados nao inicializados.",
      "Adicionar guard clauses e fallback de render.",
    ],
    commandHints: [
      "rg -n \"\\?\\.|\\!\\.|as any|null|undefined\" src/components src/app src/lib",
      "rg -n \"window\\.|document\\.|localStorage\" src/components src/app",
    ],
    likelyAreas: [
      "src/components/**",
      "src/app/**",
      "src/lib/**",
    ],
  },
  [CODE.CONSOLE_ERROR]: {
    priority: "P2",
    firstChecks: [
      "Classificar erro: warning ruido vs falha funcional real.",
      "Eliminar erros silenciosos repetitivos.",
      "Confirmar que nao existe regressao apos ajuste.",
    ],
    commandHints: [
      "rg -n \"console\\.error|console\\.warn\" src",
      "rg -n \"catch\\s*\\(.*\\)\\s*\\{\\s*\\}\" src",
    ],
    likelyAreas: [
      "src/components/**",
      "src/lib/**",
    ],
  },
  [CODE.CONTENT_LANGUAGE_CONFLICT]: {
    priority: "P1",
    firstChecks: [
      "Mapear em quais blocos a copy saiu do idioma principal.",
      "Conferir se os textos vieram da camada de i18n ou ficaram hardcoded no componente.",
      "Revalidar header, footer, CTA, demo, pricing e mensagens de estado na rota afetada.",
    ],
    commandHints: [
      "rg -n \"contact|pricing|download|proof|report|start|with|from|your|demo\" src app companion",
      "rg -n \"i18n|locale|messages|translations|dictionary|lang\" src app companion",
    ],
    likelyAreas: [
      "src/i18n/**",
      "src/config/**",
      "src/components/**",
      "app/**",
    ],
  },
  [CODE.VISUAL_SECTION_ORDER_INVALID]: {
    priority: "P0",
    firstChecks: [
      "Comparar ordem real no DOM com regra visual da config.",
      "Revisar plano de render e flags mobile/desktop.",
      "Garantir secao informativa antes do footer em todas as viewports.",
    ],
    commandHints: [
      "rg -n \"sectionOrderRules|buildSectionRenderPlan|service-details|footer\" app qa",
      "rg -n \"mobile|desktop|enabled\" src/lib src/components",
    ],
    likelyAreas: [
      "src/lib/section-flow.ts",
      "src/components/sections/HomeSections.tsx",
      "src/components/layout/**",
    ],
  },
  [CODE.VISUAL_SECTION_MISSING]: {
    priority: "P1",
    firstChecks: [
      "Validar seletor/ID esperado na regra visual.",
      "Conferir condicoes de renderizacao da secao.",
      "Checar se a secao esta visivel (display/visibility/altura).",
    ],
    commandHints: [
      "rg -n \"id=\\\"|sectionId|service-details|footer|hero|services\" src/components src/app",
      "rg -n \"enabled|mobile|desktop|infoEnabled\" src/lib src/components",
    ],
    likelyAreas: [
      "src/components/sections/**",
      "src/lib/section-flow.ts",
      "data/site-config.local.json",
    ],
  },
  [CODE.VISUAL_LAYOUT_OVERFLOW]: {
    priority: "P1",
    firstChecks: [
      "Identificar qual bloco esta ultrapassando o viewport horizontal ou verticalmente.",
      "Revisar widths fixos, translateX, negative margins e wrappers sem max-width.",
      "Confirmar que containers com carrossel ou grid tratam overflow sem empurrar o layout.",
    ],
    commandHints: [
      "rg -n \"overflow|max-width|min-width|translateX|margin-left|margin-right|100vw|calc\\(\" src",
      "rg -n \"carousel|slider|marquee|grid-cols|flex-nowrap|whitespace-nowrap\" src",
    ],
    likelyAreas: [
      "src/components/**",
      "src/app/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_LAYER_OVERLAP]: {
    priority: "P1",
    firstChecks: [
      "Localizar quais blocos estao ocupando a mesma area visual sem intencao clara.",
      "Revisar z-index, positioning, negative margins e overlays persistentes.",
      "Garantir spacing vertical/horizontal entre cards, secoes e sidebars.",
    ],
    commandHints: [
      "rg -n \"z-index|position:\\s*(absolute|fixed|sticky|relative)|inset|top:|left:|right:|bottom:\" src",
      "rg -n \"margin-top|margin-bottom|translateY|translateX|-mt-|-mb-\" src",
    ],
    likelyAreas: [
      "src/components/layout/**",
      "src/components/sections/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_ALIGNMENT_DRIFT]: {
    priority: "P2",
    firstChecks: [
      "Comparar alinhamento horizontal dos blocos principais ao longo da pagina.",
      "Padronizar container, gutters e max-width entre secoes equivalentes.",
      "Remover deslocamentos isolados que quebram a coluna principal.",
    ],
    commandHints: [
      "rg -n \"container|max-width|mx-auto|padding-inline|px-|pl-|pr-|left:\" src",
      "rg -n \"section|wrapper|content|shell|layout\" src/components src/app",
    ],
    likelyAreas: [
      "src/components/layout/**",
      "src/components/sections/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_TIGHT_SPACING]: {
    priority: "P1",
    firstChecks: [
      "Medir gaps verticais entre blocos consecutivos da composicao principal.",
      "Revisar margins/paddings de cards, seções e wrappers que ficaram visualmente colados.",
      "Garantir respiro suficiente antes de CTA, FAQ, listas e grids longos.",
    ],
    commandHints: [
      "rg -n \"gap:|row-gap|margin-top|margin-bottom|padding-top|padding-bottom|-mt-|-mb-|space-y-\" src",
      "rg -n \"section|card|panel|stack|wrapper|content\" src/components src/styles",
    ],
    likelyAreas: [
      "src/components/sections/**",
      "src/components/layout/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_GAP_INCONSISTENCY]: {
    priority: "P2",
    firstChecks: [
      "Comparar a escala de espacamento entre blocos equivalentes na mesma pagina.",
      "Unificar tokens/gutters de spacing entre secoes irmas.",
      "Remover overrides isolados que aumentam ou reduzem gaps sem criterio.",
    ],
    commandHints: [
      "rg -n \"gap:|row-gap|margin-top|margin-bottom|padding-top|padding-bottom|space-y-|space-x-\" src",
      "rg -n \"token|spacing|gutter|container|max-width|section\" src/components src/styles",
    ],
    likelyAreas: [
      "src/components/layout/**",
      "src/components/sections/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_EDGE_HUGGING]: {
    priority: "P1",
    firstChecks: [
      "Medir o gutter lateral dos blocos estruturais em todas as viewports relevantes.",
      "Revisar paddings do container principal e cards com largura util alta.",
      "Eliminar componentes que encostam na borda sem comportamento full-bleed intencional.",
    ],
    commandHints: [
      "rg -n \"padding-inline|padding-left|padding-right|px-|pl-|pr-|container|max-width|width:\" src",
      "rg -n \"full-bleed|bleed|edge|gutter|wrapper|shell\" src/components src/styles",
    ],
    likelyAreas: [
      "src/components/layout/**",
      "src/components/sections/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_WIDTH_INCONSISTENCY]: {
    priority: "P2",
    firstChecks: [
      "Comparar a largura dos blocos principais que deveriam compartilhar a mesma coluna estrutural.",
      "Padronizar max-width e largura util entre sections irmas.",
      "Remover overrides isolados que deixam um bloco estreito/largo demais sem contexto.",
    ],
    commandHints: [
      "rg -n \"max-width|min-width|width:|w-\\[|w-full|container|content|max-w-\" src",
      "rg -n \"section|panel|card|wrapper|content|shell\" src/components src/styles",
    ],
    likelyAreas: [
      "src/components/layout/**",
      "src/components/sections/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_BOUNDARY_COLLISION]: {
    priority: "P1",
    firstChecks: [
      "Medir o gap real entre blocos consecutivos que compartilham a mesma coluna visual.",
      "Revisar bordas, dividers, margins e paddings que deixam blocos encostados.",
      "Garantir separacao clara entre conteudo principal, CTA, FAQ, listas e cards longos.",
    ],
    commandHints: [
      "rg -n \"border|divider|margin-top|margin-bottom|padding-top|padding-bottom|gap:|row-gap|space-y-\" src",
      "rg -n \"section|card|panel|stack|wrapper|content\" src/components src/styles",
    ],
    likelyAreas: [
      "src/components/sections/**",
      "src/components/layout/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_FOLD_PRESSURE]: {
    priority: "P2",
    firstChecks: [
      "Mapear quantos blocos estruturais entram na primeira dobra e qual deles deveria descer na hierarquia.",
      "Revisar hero, prova social, KPIs, cards e grids empilhados cedo demais.",
      "Manter na primeira dobra so o que ajuda a orientar, converter ou explicar a pagina.",
    ],
    commandHints: [
      "rg -n \"hero|banner|kpi|stats|trust|cta|cards|grid|faq|features\" src/components src/app",
      "rg -n \"section|wrapper|panel|stack|content|max-width|gap:|space-y-\" src/components src/styles",
    ],
    likelyAreas: [
      "src/components/sections/**",
      "src/components/layout/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_HIERARCHY_COLLAPSE]: {
    priority: "P2",
    firstChecks: [
      "Comparar contraste visual entre heading principal e corpo dentro do mesmo bloco.",
      "Reforcar escala tipografica, peso e espacamento entre titulo, subtitulo e texto de apoio.",
      "Validar se a hierarquia continua clara em desktop e nos viewports mobile auditados.",
    ],
    commandHints: [
      "rg -n \"font-size|font-weight|line-height|letter-spacing|heading|title|subtitle|eyebrow\" src",
      "rg -n \"h1|h2|h3|role=\\\"heading\\\"|text-xl|text-2xl|text-3xl|text-sm|text-base\" src/components src/styles",
    ],
    likelyAreas: [
      "src/components/sections/**",
      "src/components/ui/**",
      "src/styles/**",
    ],
  },
  [CODE.VISUAL_CLUSTER_COLLISION]: {
    priority: "P1",
    firstChecks: [
      "Medir o gap horizontal real entre cards/blocos na mesma linha.",
      "Ajustar grid/flex gap e min-width para impedir colunas grudadas ou espremidas.",
      "Validar a composicao nos viewports mobile e desktop sem permitir clusters se tocando.",
    ],
    commandHints: [
      "rg -n \"grid-template-columns|gap:|column-gap|flex-wrap|justify-content|min-width|max-width|grid-cols|gap-x-\" src",
      "rg -n \"card|panel|tile|cluster|grid|columns|stack\" src/components src/styles",
    ],
    likelyAreas: [
      "src/components/sections/**",
      "src/components/ui/**",
      "src/styles/**",
    ],
  },
};

function nowIso() {
  return new Date().toISOString();
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function shortHash(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function normalizeText(value) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeLanguageCode(value) {
  const normalized = normalizeText(String(value ?? "")).toLowerCase();
  if (!normalized) return "";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("ca")) return "ca";
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("pt")) return "pt";
  return "";
}

function normalizeLanguageSample(value) {
  return normalizeText(String(value ?? ""))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreLanguageSample(text, lang) {
  const normalized = ` ${normalizeLanguageSample(text)} `;
  if (!normalized.trim()) return 0;
  return (LANGUAGE_STOPWORDS[lang] ?? []).reduce((score, token) => {
    return normalized.includes(` ${token} `) ? score + 1 : score;
  }, 0);
}

function classifyLanguageSample(text) {
  const scores = Object.keys(LANGUAGE_STOPWORDS).map((lang) => ({
    lang,
    score: scoreLanguageSample(text, lang),
  }));
  scores.sort((left, right) => right.score - left.score || left.lang.localeCompare(right.lang));
  const best = scores[0] ?? { lang: "", score: 0 };
  const second = scores[1] ?? { lang: "", score: 0 };
  return {
    lang: best.score >= 2 && best.score > second.score ? best.lang : "",
    score: best.score,
    secondScore: second.score,
    scores,
  };
}

function languageLabel(lang) {
  return LANGUAGE_LABEL[lang] || lang || "idioma nao mapeado";
}

function detectLanguageConflict(snapshot = {}) {
  const samples = Array.isArray(snapshot.uiTextSamples)
    ? snapshot.uiTextSamples.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  if (!samples.length) return null;

  const aggregate = new Map();
  const analyses = samples.map((text) => {
    const result = classifyLanguageSample(text);
    for (const row of result.scores) {
      aggregate.set(row.lang, (aggregate.get(row.lang) ?? 0) + row.score);
    }
    return {
      text,
      lang: result.lang,
      score: result.score,
      secondScore: result.secondScore,
    };
  });

  const sortedAggregate = Array.from(aggregate.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const declaredLang = normalizeLanguageCode(snapshot.lang);
  const primaryLang = declaredLang || (sortedAggregate[0]?.[1] >= 4 ? sortedAggregate[0][0] : "");
  if (!primaryLang) return null;

  const conflictsByLang = new Map();
  for (const sample of analyses) {
    if (!sample.lang || sample.lang === primaryLang || sample.score < 2) continue;
    const bucket = conflictsByLang.get(sample.lang) ?? [];
    if (!bucket.some((entry) => entry.text === sample.text)) {
      bucket.push(sample);
    }
    conflictsByLang.set(sample.lang, bucket);
  }

  const rankedConflicts = Array.from(conflictsByLang.entries())
    .map(([lang, items]) => ({
      lang,
      items,
      score: items.reduce((total, item) => total + item.score, 0),
    }))
    .sort((left, right) => right.items.length - left.items.length || right.score - left.score || left.lang.localeCompare(right.lang));
  const strongestConflict = rankedConflicts[0];
  if (!strongestConflict || strongestConflict.items.length < 2 || strongestConflict.score < 4) {
    return null;
  }

  return {
    documentLang: declaredLang,
    primaryLang,
    conflictingLang: strongestConflict.lang,
    conflictingTexts: strongestConflict.items.slice(0, 4).map((item) => item.text),
    confidence: strongestConflict.items.length >= 3 ? "high" : "medium",
  };
}

function normalizeLearningOutcome(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "validated") return "validated";
  if (normalized === "failed") return "failed";
  if (normalized === "partial") return "partial";
  return "";
}

function normalizeLearningCase(input, index = 0) {
  const entry = input && typeof input === "object" ? input : {};
  return {
    id: String(entry.id || `learning-${index + 1}`),
    outcome: normalizeLearningOutcome(entry.outcome),
    title: normalizeText(entry.title || `Learning case ${index + 1}`),
    symptom: normalizeText(entry.symptom),
    attempt: normalizeText(entry.attempt),
    result: normalizeText(entry.result),
    finalFix: normalizeText(entry.finalFix),
    source: normalizeText(entry.source),
  };
}

function summarizeLearningCases(cases) {
  const summary = {
    validated: 0,
    failed: 0,
    partial: 0,
  };
  for (const item of cases) {
    if (item.outcome === "validated") summary.validated += 1;
    if (item.outcome === "failed") summary.failed += 1;
    if (item.outcome === "partial") summary.partial += 1;
  }
  return summary;
}

function sanitizeFileToken(value, fallback = "item") {
  const normalized = normalizeText(String(value ?? ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function escapeLocatorAttr(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function severityRank(level) {
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function maxSeverity(left, right) {
  return severityRank(right) > severityRank(left) ? right : left;
}

function inferActionIntent(action) {
  const label = normalizeText(action?.label);
  const href = normalizeText(action?.href);
  const kind = normalizeText(action?.kind || "button");
  const hay = `${label} ${normalizeText(action?.ariaLabel)} ${normalizeText(action?.title)} ${href}`.toLowerCase();

  if (hay.includes("whatsapp") || hay.includes("wa.me") || hay.includes("api.whatsapp")) {
    return {
      area: "contato",
      expectedFunction: "Abrir contato via WhatsApp",
      expectedTechnical:
        "Abrir link externo de WhatsApp (wa.me/api.whatsapp) ou CTA de contato sem erro.",
      userExplanation:
        "Permite que o visitante inicie conversa imediata pelo WhatsApp.",
    };
  }

  if (
    hay.includes("contato") ||
    hay.includes("contact") ||
    hay.includes("contacto") ||
    hay.includes("/contact")
  ) {
    return {
      area: "contato",
      expectedFunction: "Levar para canal de contato",
      expectedTechnical: "Navegar para pagina/ancora de contato ou abrir formulario/modal de contato.",
      userExplanation: "Conduz o visitante para falar com a empresa.",
    };
  }

  if (
    hay.includes("menu") ||
    hay.includes("abrir menu") ||
    hay.includes("toggle") ||
    kind === "menuitem"
  ) {
    return {
      area: "navegacao",
      expectedFunction: "Abrir/fechar menu de navegacao",
      expectedTechnical: "Alternar estado do menu (aria-expanded, classes, visibilidade de links).",
      userExplanation: "Mostra os links principais do site para o usuario navegar.",
    };
  }

  if (
    hay.includes("ver mais") ||
    hay.includes("saber mais") ||
    hay.includes("leer mas") ||
    hay.includes("leer más") ||
    hay.includes("saiba mais")
  ) {
    return {
      area: "conteudo",
      expectedFunction: "Expandir detalhes ou abrir pagina complementar",
      expectedTechnical: "Executar expansao de conteudo, abrir modal ou navegar para detalhe.",
      userExplanation: "Mostra mais informacoes sobre o servico/oferta.",
    };
  }

  if (
    hay.includes("voltar") ||
    hay.includes("anterior") ||
    hay.includes("proximo") ||
    hay.includes("próximo")
  ) {
    return {
      area: "navegacao",
      expectedFunction: "Navegacao entre secoes/etapas",
      expectedTechnical: "Mudar slide, secao, etapa ou historico conforme contexto.",
      userExplanation: "Permite avancar ou voltar no fluxo de leitura.",
    };
  }

  if (
    hay.includes("aceito") ||
    hay.includes("acepto") ||
    hay.includes("consent") ||
    hay.includes("cookie")
  ) {
    return {
      area: "privacidade",
      expectedFunction: "Registrar consentimento",
      expectedTechnical: "Confirmar preferencia de cookies/privacidade e ocultar o banner.",
      userExplanation: "Confirma a preferencia de privacidade do visitante.",
    };
  }

  if (
    hay.includes("comprar") ||
    hay.includes("agendar") ||
    hay.includes("reservar") ||
    hay.includes("orcamento") ||
    hay.includes("orçamento")
  ) {
    return {
      area: "conversao",
      expectedFunction: "Iniciar acao de conversao",
      expectedTechnical:
        "Abrir checkout/formulario/whatsapp de venda ou enviar evento principal de conversao.",
      userExplanation: "Leva o visitante para a acao principal de negocio.",
    };
  }

  if (kind === "link" || href.startsWith("/") || href.startsWith("http")) {
    return {
      area: "navegacao",
      expectedFunction: "Navegar para outra pagina",
      expectedTechnical: "Executar navegacao para a URL de destino sem erro de carregamento.",
      userExplanation: "Leva o visitante para outra parte do site.",
    };
  }

  if (kind === "tab" || kind === "summary") {
    return {
      area: "conteudo",
      expectedFunction: "Alternar bloco de conteudo",
      expectedTechnical: "Mudar aba/accordion e exibir o conteudo correspondente.",
      userExplanation: "Mostra um bloco especifico de informacoes na mesma tela.",
    };
  }

  return {
    area: "interacao",
    expectedFunction: "Executar acao interativa",
    expectedTechnical: "Disparar handler do elemento e refletir resultado visual/funcional.",
    userExplanation: "Deve reagir ao clique com resultado visivel para o usuario.",
  };
}

function actionStatusLabel(status) {
  if (status === ACTION_STATUS.CLICKED_EFFECT) return "Executou com efeito visivel";
  if (status === ACTION_STATUS.CLICKED_NO_EFFECT) return "Clique sem efeito visivel";
  if (status === ACTION_STATUS.SKIPPED_NOT_VISIBLE) return "Nao clicado: nao visivel";
  if (status === ACTION_STATUS.SKIPPED_DISABLED) return "Nao clicado: desabilitado";
  if (status === ACTION_STATUS.SKIPPED_ACTIVE) return "Nao clicado: ja estava ativo";
  if (status === ACTION_STATUS.CLICK_ERROR) return "Falha ao clicar";
  if (status === ACTION_STATUS.ROUTE_LIMIT) return "Nao executado: limite de rota";
  return "Mapeado sem clique (modo analise)";
}

function describeActionResult(result) {
  if (!result?.ok) {
    if (result?.reason === "button_not_visible") return ACTION_STATUS.SKIPPED_NOT_VISIBLE;
    if (result?.reason === "button_disabled") return ACTION_STATUS.SKIPPED_DISABLED;
    if (result?.reason === "button_already_active") return ACTION_STATUS.SKIPPED_ACTIVE;
    return ACTION_STATUS.CLICK_ERROR;
  }
  return result.effectDetected ? ACTION_STATUS.CLICKED_EFFECT : ACTION_STATUS.CLICKED_NO_EFFECT;
}

function toShortPath(urlLike) {
  if (!urlLike) return "";
  try {
    const url = new URL(urlLike);
    return `${url.pathname}${url.search}`;
  } catch {
    return String(urlLike);
  }
}

function inferActualFunctionFromResult(result, fallbackDetail = "") {
  if (!result?.ok) {
    if (result?.reason === "button_not_visible") return "Elemento nao estava visivel para clique.";
    if (result?.reason === "button_disabled") return "Elemento estava desabilitado.";
    if (result?.reason === "button_already_active") return "Elemento ja estava no estado ativo.";
    return fallbackDetail || "Falhou ao executar o clique.";
  }

  if (result.navigationChanged) {
    return `Navegou de ${toShortPath(result.beforeHref)} para ${toShortPath(result.afterHref)}.`;
  }

  if (result.effectSignals?.length) {
    const map = {
      title_changed: "titulo mudou",
      dom_changed: "conteudo da pagina mudou",
      root_class_changed: "estado visual mudou",
      dialog_changed: "modal/dialog mudou",
      scroll_changed: "rolagem mudou",
      network_request: "houve requisicao de rede",
      dialog_event: "houve interacao de dialog",
    };
    const labels = result.effectSignals.map((item) => map[item] ?? item).join(", ");
    return `Acao executada na mesma pagina com efeito: ${labels}.`;
  }

  if (result.effectDetected) {
    return "Acao executada com alteracao visivel na interface.";
  }
  return "Clique ocorreu, mas sem efeito observavel.";
}

function makeActionRecord(input) {
  return {
    id: shortHash(`${input.route}|${input.label}|${input.kind}|${input.index}`),
    route: input.route,
    label: input.label,
    kind: input.kind,
    href: input.href || "",
    role: input.role || "",
    expectedFunction: input.expectedFunction,
    expectedTechnical: input.expectedTechnical,
    expectedForUser: input.expectedForUser,
    status: input.status,
    statusLabel: actionStatusLabel(input.status),
    actualFunction: input.actualFunction,
    detail: input.detail || "",
    effectDetected: Boolean(input.effectDetected),
    beforeUrl: input.beforeUrl || "",
    afterUrl: input.afterUrl || "",
    checkedAt: nowIso(),
    area: input.area || "interacao",
    signals: Array.isArray(input.signals) ? input.signals : [],
  };
}

const SEO_BASELINE_CHECKLIST = [
  {
    id: "title",
    label: "Title unico e com tamanho ideal (30-65)",
    why: "E o texto principal que aparece no Google.",
    codes: ["SEO_TITLE_MISSING", "SEO_TITLE_LENGTH"],
    recommendation: "Defina um title unico por pagina com foco na intencao do usuario.",
  },
  {
    id: "meta_description",
    label: "Meta description clara (70-170)",
    why: "Ajuda a pessoa entender a pagina antes de clicar.",
    codes: ["SEO_META_DESCRIPTION_MISSING", "SEO_META_DESCRIPTION_LENGTH"],
    recommendation: "Crie descricao objetiva com beneficio real e chamada para acao.",
  },
  {
    id: "heading_h1",
    label: "Estrutura de headings com 1 H1",
    why: "Organiza o tema principal da pagina para Google e usuarios.",
    codes: ["SEO_H1_MISSING", "SEO_H1_MULTIPLE"],
    recommendation: "Mantenha apenas um H1 claro e use H2/H3 para secoes.",
  },
  {
    id: "lang_viewport",
    label: "HTML com lang e viewport mobile",
    why: "Melhora indexacao correta por idioma e experiencia em celular.",
    codes: ["SEO_LANG_MISSING", "SEO_VIEWPORT_MISSING"],
    recommendation: "Adicione lang em <html> e meta viewport no <head>.",
  },
  {
    id: "canonical",
    label: "Canonical definido",
    why: "Evita conteudo duplicado em URLs diferentes.",
    codes: ["SEO_CANONICAL_MISSING"],
    recommendation: "Defina <link rel=\"canonical\"> para cada pagina indexavel.",
  },
  {
    id: "indexing",
    label: "Pagina indexavel (sem noindex indevido)",
    why: "Sem isso o Google pode ignorar paginas importantes.",
    codes: ["SEO_NOINDEX"],
    recommendation: "Remova noindex das paginas que precisam ranquear.",
  },
  {
    id: "images_alt",
    label: "Imagens com alt descritivo",
    why: "Ajuda SEO de imagem e acessibilidade.",
    codes: ["SEO_IMG_ALT_MISSING"],
    recommendation: "Preencha alt nas imagens relevantes com descricao real.",
  },
  {
    id: "structured_data",
    label: "Schema JSON-LD (LocalBusiness/Service/FAQ)",
    why: "Aumenta chance de rich results no Google.",
    codes: ["SEO_STRUCTURED_DATA_MISSING"],
    recommendation: "Adicione dados estruturados validos por pagina.",
  },
  {
    id: "content_depth",
    label: "Conteudo util e suficiente",
    why: "Paginas rasas tendem a ranquear pior.",
    codes: ["SEO_CONTENT_THIN"],
    recommendation: "Adicione conteudo especifico, provas, FAQs e diferenciais.",
  },
  {
    id: "internal_links",
    label: "Links internos entre paginas",
    why: "Ajuda rastreamento e distribuicao de autoridade.",
    codes: ["SEO_INTERNAL_LINKS_LOW"],
    recommendation: "Inclua links para servicos, contato, cidade e paginas correlatas.",
  },
  {
    id: "social_meta",
    label: "Meta social (Open Graph + Twitter Card)",
    why: "Melhora compartilhamento e CTR em redes sociais.",
    codes: ["SEO_OPEN_GRAPH_INCOMPLETE", "SEO_TWITTER_CARD_MISSING"],
    recommendation: "Complete og:title, og:description, og:image, og:type e twitter:card.",
  },
  {
    id: "meta_robots",
    label: "Meta robots presente e coerente",
    why: "Define como bots devem indexar/seguir links.",
    codes: ["SEO_META_ROBOTS_MISSING"],
    recommendation: "Defina meta robots adequada para cada tipo de pagina.",
  },
];

function buildSeoChecklist(issues) {
  const codeSet = new Set((issues ?? []).map((item) => String(item.code)));
  return SEO_BASELINE_CHECKLIST.map((item) => {
    const missingCodes = item.codes.filter((code) => codeSet.has(code));
    return {
      id: item.id,
      label: item.label,
      why: item.why,
      status: missingCodes.length ? "missing" : "ok",
      missingCodes,
      recommendation: item.recommendation,
    };
  });
}

function buildSeoFixPrompt(input) {
  const checklist = Array.isArray(input?.checklist) ? input.checklist : [];
  const missing = checklist.filter((row) => row.status === "missing");
  const topIssues = Array.isArray(input?.issues) ? input.issues.slice(0, 20) : [];
  const score = Number(input?.overallScore ?? 0);
  const baseUrl = normalizeText(input?.baseUrl);

  if (!missing.length && !topIssues.length) {
    return [
      "Atue como especialista SEO tecnico e de conteudo.",
      `Site auditado: ${baseUrl || "(base URL nao informada)"}`,
      `Score atual: ${score}/100.`,
      "Nao ha gaps SEO relevantes nesta rodada.",
      "Objetivo: manter baseline, evitar regressao e monitorar periodicamente.",
    ].join("\n");
  }

  return [
    "Atue como especialista SEO senior com foco em causa raiz e impacto real no ranking.",
    `Site auditado: ${baseUrl || "(base URL nao informada)"}`,
    `Score SEO atual: ${score}/100.`,
    "Objetivo: corrigir todos os itens pendentes abaixo sem fix cosmetico.",
    "",
    "Checklist SEO pendente (explicacao para leigos + acao):",
    ...missing.map((row, index) => `${index + 1}. ${row.label} | por que importa: ${row.why} | o que fazer: ${row.recommendation}`),
    "",
    "Issues SEO detectadas:",
    ...topIssues.map((issue, index) =>
      `${index + 1}. [${issue.code}] (${issue.severity}) ${issue.detail} | recomendacao: ${issue.recommendation}${issue.finalResolution ? ` | padrao_validado: ${issue.finalResolution}` : issue.possibleResolution ? ` | tentativa_sugerida: ${issue.possibleResolution}` : ""}`,
    ),
    "",
    "Entrega obrigatoria:",
    "- listar arquivos alterados e motivo de cada alteracao",
    "- mostrar antes/depois dos metadados principais",
    "- validar novamente e comprovar melhoria de score",
  ].join("\n");
}

function evaluateSeoSnapshot(snapshot) {
  const checks = [];
  let overall = 100;
  let technical = 100;
  let content = 100;
  let accessibility = 100;

  const applyPenalty = (input) => {
    if (input.status === "pass") return;
    checks.push(input);
    overall = Math.max(0, overall - input.weight);
    if (input.category === "technical") technical = Math.max(0, technical - input.weight);
    if (input.category === "content") content = Math.max(0, content - input.weight);
    if (input.category === "accessibility") accessibility = Math.max(0, accessibility - input.weight);
  };

  if (!snapshot.title) {
    applyPenalty({
      code: "SEO_TITLE_MISSING",
      status: "fail",
      severity: "high",
      category: "content",
      weight: 18,
      detail: "Pagina sem <title> definido.",
      recommendation: "Defina um title unico e claro para cada pagina.",
    });
  } else if (snapshot.titleLength < 30 || snapshot.titleLength > 65) {
    applyPenalty({
      code: "SEO_TITLE_LENGTH",
      status: "warn",
      severity: "medium",
      category: "content",
      weight: 6,
      detail: `Title com ${snapshot.titleLength} caracteres (ideal: 30-65).`,
      recommendation: "Ajuste o tamanho do title para melhorar leitura no Google.",
    });
  }

  if (!snapshot.metaDescription) {
    applyPenalty({
      code: "SEO_META_DESCRIPTION_MISSING",
      status: "fail",
      severity: "high",
      category: "content",
      weight: 16,
      detail: "Meta description ausente.",
      recommendation: "Adicione meta description unica com proposta clara da pagina.",
    });
  } else if (snapshot.metaDescriptionLength < 70 || snapshot.metaDescriptionLength > 170) {
    applyPenalty({
      code: "SEO_META_DESCRIPTION_LENGTH",
      status: "warn",
      severity: "medium",
      category: "content",
      weight: 5,
      detail: `Meta description com ${snapshot.metaDescriptionLength} caracteres (ideal: 70-170).`,
      recommendation: "Ajuste o tamanho da meta description para evitar corte no resultado de busca.",
    });
  }

  if (snapshot.h1Count === 0) {
    applyPenalty({
      code: "SEO_H1_MISSING",
      status: "fail",
      severity: "high",
      category: "content",
      weight: 14,
      detail: "Nenhum H1 encontrado na pagina.",
      recommendation: "Inclua 1 H1 claro descrevendo o tema principal da pagina.",
    });
  } else if (snapshot.h1Count > 1) {
    applyPenalty({
      code: "SEO_H1_MULTIPLE",
      status: "warn",
      severity: "medium",
      category: "content",
      weight: 5,
      detail: `${snapshot.h1Count} H1 encontrados (ideal: 1).`,
      recommendation: "Mantenha um unico H1 para reforcar hierarquia semantica.",
    });
  }

  if (!snapshot.lang) {
    applyPenalty({
      code: "SEO_LANG_MISSING",
      status: "warn",
      severity: "medium",
      category: "technical",
      weight: 7,
      detail: "Atributo lang ausente em <html>.",
      recommendation: "Defina lang no HTML para melhorar indexacao e acessibilidade.",
    });
  }

  if (!snapshot.hasViewport) {
    applyPenalty({
      code: "SEO_VIEWPORT_MISSING",
      status: "fail",
      severity: "high",
      category: "technical",
      weight: 10,
      detail: "Meta viewport ausente.",
      recommendation: "Adicione meta viewport para boa experiencia mobile.",
    });
  }

  if (!snapshot.canonicalUrl) {
    applyPenalty({
      code: "SEO_CANONICAL_MISSING",
      status: "warn",
      severity: "low",
      category: "technical",
      weight: 4,
      detail: "Link canonical ausente.",
      recommendation: "Defina canonical para evitar duplicidade de URL.",
    });
  }

  if (!snapshot.hasMetaRobots) {
    applyPenalty({
      code: "SEO_META_ROBOTS_MISSING",
      status: "warn",
      severity: "low",
      category: "technical",
      weight: 3,
      detail: "Meta robots ausente.",
      recommendation: "Defina meta robots explicita para controle de indexacao.",
    });
  }

  if (snapshot.robotsNoindex) {
    applyPenalty({
      code: "SEO_NOINDEX",
      status: "fail",
      severity: "high",
      category: "technical",
      weight: 25,
      detail: "Meta robots contem noindex.",
      recommendation: "Remova noindex das paginas que precisam aparecer no Google.",
    });
  }

  if (snapshot.imagesTotal > 0 && snapshot.imagesMissingAlt > 0) {
    const missingRatio = snapshot.imagesMissingAlt / snapshot.imagesTotal;
    applyPenalty({
      code: "SEO_IMG_ALT_MISSING",
      status: missingRatio >= 0.35 ? "fail" : "warn",
      severity: missingRatio >= 0.35 ? "high" : "medium",
      category: "accessibility",
      weight: missingRatio >= 0.35 ? 16 : 8,
      detail: `${snapshot.imagesMissingAlt}/${snapshot.imagesTotal} imagens sem alt.`,
      recommendation: "Preencha atributo alt descritivo nas imagens relevantes.",
    });
  }

  if (!snapshot.hasStructuredData) {
    applyPenalty({
      code: "SEO_STRUCTURED_DATA_MISSING",
      status: "warn",
      severity: "low",
      category: "technical",
      weight: 4,
      detail: "Nenhum JSON-LD encontrado.",
      recommendation: "Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.",
    });
  }

  if (!snapshot.ogComplete) {
    applyPenalty({
      code: "SEO_OPEN_GRAPH_INCOMPLETE",
      status: "warn",
      severity: "medium",
      category: "content",
      weight: 6,
      detail: "Open Graph incompleto (faltando og:title, og:description, og:image ou og:type).",
      recommendation: "Complete as metas Open Graph para melhorar compartilhamento e CTR.",
    });
  }

  if (!snapshot.hasTwitterCard) {
    applyPenalty({
      code: "SEO_TWITTER_CARD_MISSING",
      status: "warn",
      severity: "low",
      category: "content",
      weight: 3,
      detail: "Twitter Card ausente.",
      recommendation: "Adicione meta twitter:card e metadados sociais complementares.",
    });
  }

  if (snapshot.wordCount < 80) {
    applyPenalty({
      code: "SEO_CONTENT_THIN",
      status: "warn",
      severity: "medium",
      category: "content",
      weight: 7,
      detail: `Conteudo textual curto (${snapshot.wordCount} palavras).`,
      recommendation: "Adicione conteudo util e especifico sobre servico/local para SEO local.",
    });
  }

  if (snapshot.internalLinks < 2) {
    applyPenalty({
      code: "SEO_INTERNAL_LINKS_LOW",
      status: "warn",
      severity: "low",
      category: "technical",
      weight: 4,
      detail: `Poucos links internos (${snapshot.internalLinks}).`,
      recommendation: "Aumente links internos para melhorar rastreio e distribuicao de autoridade.",
    });
  }

  if (!checks.length) {
    checks.push({
      code: "SEO_OK",
      status: "pass",
      severity: "low",
      category: "technical",
      weight: 0,
      detail: "Checks principais de SEO sem falhas relevantes nesta rota.",
      recommendation: "Manter monitoramento continuo.",
    });
  }

  return {
    score: Math.max(0, Math.round(overall)),
    categoryScore: {
      technical: Math.max(0, Math.round(technical)),
      content: Math.max(0, Math.round(content)),
      accessibility: Math.max(0, Math.round(accessibility)),
    },
    checks,
  };
}

async function captureSeoSnapshot(page, route) {
  const url = page.url();
  const snapshot = await page.evaluate(() => {
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const isVisible = (element) => {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      if (!style || style.visibility === "hidden" || style.display === "none") return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const title = clean(document.title);
    const metaDescription = clean(document.querySelector('meta[name="description"]')?.getAttribute("content"));
    const canonicalUrl = clean(document.querySelector('link[rel="canonical"]')?.getAttribute("href"));
    const lang = clean(document.documentElement?.getAttribute("lang"));
    const robots = clean(document.querySelector('meta[name="robots"]')?.getAttribute("content"));
    const ogTitle = clean(document.querySelector('meta[property="og:title"]')?.getAttribute("content"));
    const ogDescription = clean(document.querySelector('meta[property="og:description"]')?.getAttribute("content"));
    const ogImage = clean(document.querySelector('meta[property="og:image"]')?.getAttribute("content"));
    const ogType = clean(document.querySelector('meta[property="og:type"]')?.getAttribute("content"));
    const twitterCard = clean(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content"));
    const hasMetaRobots = Boolean(document.querySelector('meta[name="robots"]'));
    const hasViewport = Boolean(document.querySelector('meta[name="viewport"]'));
    const images = Array.from(document.querySelectorAll("img"));
    const imagesMissingAlt = images.filter((img) => !clean(img.getAttribute("alt"))).length;
    const structuredScripts = document.querySelectorAll('script[type="application/ld+json"]').length;
    const text = clean(document.body?.innerText);
    const wordCount = text ? text.split(" ").filter(Boolean).length : 0;
    const uiTextSamples = [];
    const seenSamples = new Set();
    for (const element of Array.from(document.querySelectorAll("h1, h2, h3, h4, p, a[href], button, label, summary, li, span"))) {
      if (!isVisible(element)) continue;
      const sample = clean(element.textContent);
      if (sample.length < 12 || sample.length > 160) continue;
      if (seenSamples.has(sample)) continue;
      seenSamples.add(sample);
      uiTextSamples.push(sample);
      if (uiTextSamples.length >= 80) break;
    }

    const links = Array.from(document.querySelectorAll("a[href]"));
    const internalLinks = links.filter((node) => {
      const href = clean(node.getAttribute("href"));
      if (!href) return false;
      if (href.startsWith("#")) return true;
      if (href.startsWith("/")) return true;
      try {
        const parsed = new URL(href, window.location.href);
        return parsed.origin === window.location.origin;
      } catch {
        return false;
      }
    }).length;

    return {
      title,
      titleLength: title.length,
      metaDescription,
      metaDescriptionLength: metaDescription.length,
      h1Count: document.querySelectorAll("h1").length,
      canonicalUrl,
      lang,
      hasMetaRobots,
      robotsNoindex: /(^|\\s|,)noindex(\\s|,|$)/i.test(robots),
      ogComplete: Boolean(ogTitle && ogDescription && ogImage && ogType),
      hasTwitterCard: Boolean(twitterCard),
      hasViewport,
      imagesTotal: images.length,
      imagesMissingAlt,
      hasStructuredData: structuredScripts > 0,
      structuredDataCount: structuredScripts,
      internalLinks,
      wordCount,
      uiTextSamples,
    };
  });

  const evaluated = evaluateSeoSnapshot(snapshot);
  const languageConflict = detectLanguageConflict(snapshot);
  return {
    route,
    url,
    ...snapshot,
    ...evaluated,
    languageConflict,
  };
}

function buildLanguageConflictIssue(pageResult) {
  const conflict = pageResult?.languageConflict;
  if (!conflict) return null;

  const primaryLang = conflict.documentLang || conflict.primaryLang;
  const samples = (conflict.conflictingTexts ?? []).map((item) => `"${item}"`).join(" | ");
  const detail = [
    `A pagina foi detectada como ${languageLabel(primaryLang)}, mas ainda mostra textos em ${languageLabel(conflict.conflictingLang)}.`,
    samples ? `Exemplos: ${samples}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    code: CODE.CONTENT_LANGUAGE_CONFLICT,
    severity: severityFromCode(CODE.CONTENT_LANGUAGE_CONFLICT),
    route: pageResult.route || "/",
    detail,
    url: pageResult.url || "",
  };
}

function finalizeSeoReport(report, enabled = true) {
  if (!enabled) {
    report.seo = {
      overallScore: 0,
      pagesAnalyzed: 0,
      categoryScore: { technical: 0, content: 0, accessibility: 0 },
      issues: [],
      topRecommendations: ["SEO ignorado nesta rodada pelo escopo selecionado."],
      checklist: [],
      fixPrompt: "",
      pages: [],
      skipped: true,
      skippedReason: "audit_scope_disabled_seo",
    };
    return;
  }
  const pages = Array.isArray(report?.seo?.pages) ? report.seo.pages : [];
  if (!pages.length) {
    report.seo = {
      overallScore: 0,
      pagesAnalyzed: 0,
      categoryScore: { technical: 0, content: 0, accessibility: 0 },
      issues: [],
      topRecommendations: [],
      checklist: buildSeoChecklist([]),
      fixPrompt: buildSeoFixPrompt({ checklist: buildSeoChecklist([]), issues: [], overallScore: 0, baseUrl: report?.meta?.baseUrl }),
      pages: [],
    };
    return;
  }

  const avg = (values) => {
    if (!values.length) return 0;
    return Math.round(values.reduce((acc, item) => acc + item, 0) / values.length);
  };

  const overallScore = avg(pages.map((page) => Number(page.score || 0)));
  const categoryScore = {
    technical: avg(pages.map((page) => Number(page.categoryScore?.technical || 0))),
    content: avg(pages.map((page) => Number(page.categoryScore?.content || 0))),
    accessibility: avg(pages.map((page) => Number(page.categoryScore?.accessibility || 0))),
  };

  const grouped = new Map();
  for (const page of pages) {
    for (const check of page.checks ?? []) {
      if (check.status === "pass") continue;
      const key = check.code;
      const current = grouped.get(key) ?? {
        code: check.code,
        severity: check.severity || "low",
        detail: check.detail || "",
        recommendation: check.recommendation || "Sem recomendacao.",
        category: check.category || "technical",
        count: 0,
        affectedRoutes: new Set(),
      };
      current.severity = maxSeverity(current.severity, check.severity || "low");
      current.count += 1;
      current.affectedRoutes.add(page.route);
      if (!current.detail && check.detail) current.detail = check.detail;
      if (!current.recommendation && check.recommendation) current.recommendation = check.recommendation;
      grouped.set(key, current);
    }
  }

  const issues = Array.from(grouped.values())
    .map((item) => {
      const learning = resolveLearningForIssue(activeLearningRuntime.store, {
        code: item.code,
        route: Array.from(item.affectedRoutes)[0] || "/",
        action: item.category ? `seo:${item.category}` : "",
        detail: item.detail,
      });
      const learningCases = Array.isArray(learning?.cases)
        ? learning.cases.map((entry, index) => normalizeLearningCase(entry, index)).filter((entry) => entry.outcome || entry.title)
        : [];
      const learningCounts =
        learning?.learningCounts && typeof learning.learningCounts === "object"
          ? {
              validated: Number(learning.learningCounts.validated || 0),
              failed: Number(learning.learningCounts.failed || 0),
              partial: Number(learning.learningCounts.partial || 0),
            }
          : summarizeLearningCases(learningCases);
      return {
        code: item.code,
        severity: item.severity,
        category: item.category,
        detail: item.detail,
        recommendation: item.recommendation,
        possibleResolution: learning?.possibleSolution ?? "",
        finalResolution: learning?.finalSolution ?? "",
        learningSource: learning?.source ?? "",
        learningCases,
        learningCounts,
        learningStatus: learning?.learningStatus ?? "",
        resolutionConfidence: learning?.resolutionConfidence ?? "",
        finalResolutionOrigin: learning?.finalResolutionOrigin ?? "",
        promotionSource: learning?.promotionSource ?? "",
        promotionCount: learning?.promotionCount ?? 0,
        lastValidatedAt: learning?.lastValidatedAt ?? "",
        manualOverrideCount: learning?.manualOverrideCount ?? 0,
        lastManualOverrideAt: learning?.lastManualOverrideAt ?? "",
        lastManualOverrideBy: learning?.lastManualOverrideBy ?? "",
        lastManualOverrideNote: learning?.lastManualOverrideNote ?? "",
        count: item.count,
        affectedRoutes: Array.from(item.affectedRoutes).sort(),
      };
    })
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.count - a.count || a.code.localeCompare(b.code));

  const checklist = buildSeoChecklist(issues);
  const fixPrompt = buildSeoFixPrompt({
    checklist,
    issues,
    overallScore,
    baseUrl: report?.meta?.baseUrl,
  });

  report.seo = {
    overallScore,
    pagesAnalyzed: pages.length,
    categoryScore,
    issues,
    topRecommendations: issues.slice(0, 8).map((item) => item.finalResolution || item.possibleResolution || item.recommendation),
    checklist,
    fixPrompt,
    pages,
  };
}

function uniqueNormalizedLines(values, maxItems = 8) {
  const out = [];
  const seen = new Set();
  for (const value of values ?? []) {
    const normalized = normalizeText(value);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
    if (out.length >= maxItems) break;
  }
  return out;
}

function parseHttpDetail(detail) {
  const normalized = normalizeText(detail);
  const match = normalized.match(/^(\d{3})\s+([A-Z]+)\s+(.+)$/);
  if (!match) return null;
  const status = Number(match[1]);
  if (!Number.isFinite(status)) return null;
  return {
    status,
    method: match[2],
    requestUrl: match[3],
  };
}

function parseRequestFailedDetail(detail) {
  const normalized = normalizeText(detail);
  const match = normalized.match(/^([A-Z]+)\s+(.+?)\s+::\s+(.+)$/);
  if (!match) return null;
  return {
    method: match[1],
    requestUrl: match[2],
    failureText: match[3],
    failureLower: match[3].toLowerCase(),
  };
}

function tryParsePathname(urlLike) {
  if (!urlLike) return "";
  try {
    return new URL(urlLike).pathname || urlLike;
  } catch {
    return urlLike;
  }
}

const HTTP_STATUS_INTELLIGENCE = {
  400: {
    subtype: "bad_request_payload",
    title: "HTTP 400 Bad Request",
    probableCauses: [
      "Payload fora do schema esperado.",
      "Headers obrigatorios ausentes (Content-Type, Authorization).",
      "Parametro de query/body invalido.",
    ],
    technicalChecks: [
      "Comparar payload real com schema esperado no endpoint.",
      "Validar serializacao JSON e headers obrigatorios.",
      "Logar body validado no backend em ambiente de teste.",
    ],
    recommendedActions: [
      "Aplicar validacao de formulario antes do fetch.",
      "Padronizar retorno de erro de campo para feedback em tela.",
    ],
    commandHints: [
      "rg -n \"fetch\\(|axios|POST|PUT|PATCH\" src",
      "rg -n \"zod|schema|safeParse|parse\\(\" src/app/api src/lib",
    ],
  },
  401: {
    subtype: "auth_missing_or_expired",
    title: "HTTP 401 Unauthorized",
    probableCauses: [
      "Token ausente/expirado.",
      "Sessao invalida apos refresh.",
      "Header Authorization nao enviado.",
    ],
    technicalChecks: [
      "Verificar emissao/refresh de token no frontend.",
      "Conferir middleware de auth do endpoint.",
      "Auditar fluxo de logout/relogin automatico.",
    ],
    recommendedActions: [
      "Revalidar sessao antes de chamadas protegidas.",
      "Exibir CTA de login quando ocorrer 401.",
    ],
    commandHints: [
      "rg -n \"Authorization|Bearer|token|session\" src",
      "rg -n \"middleware|auth|requireAuth\" src/app src/lib",
    ],
  },
  403: {
    subtype: "forbidden_permission",
    title: "HTTP 403 Forbidden",
    probableCauses: [
      "Usuario sem permissao para a acao.",
      "RBAC/ACL bloqueando o endpoint.",
      "Protecao CSRF/origin recusando a chamada.",
    ],
    technicalChecks: [
      "Conferir claims/permissoes do usuario.",
      "Comparar regra de autorizacao com o caso de uso.",
      "Validar controles CSRF e origin.",
    ],
    recommendedActions: [
      "Ajustar regra de permissao ou fluxo de autorizacao.",
      "Mostrar mensagem de acesso negado orientando proximo passo.",
    ],
    commandHints: [
      "rg -n \"role|permission|acl|rbac\" src",
      "rg -n \"csrf|origin|sameSite\" src/app/api src/lib",
    ],
  },
  404: {
    subtype: "endpoint_not_found",
    title: "HTTP 404 Not Found",
    probableCauses: [
      "Endpoint incorreto no frontend.",
      "Base URL/env aponta para ambiente errado.",
      "Reescrita/proxy nao encaminha a rota.",
    ],
    technicalChecks: [
      "Comparar URL do fetch com rotas realmente expostas.",
      "Validar variaveis de ambiente de API.",
      "Revisar rewrites/proxy.",
    ],
    recommendedActions: [
      "Centralizar construcao de endpoint para evitar typo.",
      "Adicionar teste de contrato para rotas criticas.",
    ],
    commandHints: [
      "rg -n \"baseUrl|API_URL|NEXT_PUBLIC|/api/\" src",
      "rg -n \"export async function GET|POST|PUT|PATCH|DELETE\" src/app/api",
    ],
  },
  405: {
    subtype: "method_not_allowed",
    title: "HTTP 405 Method Not Allowed",
    probableCauses: [
      "Metodo HTTP divergente entre UI e API.",
      "Handler do metodo nao implementado.",
      "Gateway bloqueando verbo.",
    ],
    technicalChecks: [
      "Comparar method do fetch com metodo aceito no endpoint.",
      "Validar export dos handlers HTTP no route.ts.",
      "Conferir politica do proxy para verbos.",
    ],
    recommendedActions: [
      "Alinhar metodo da chamada com o contrato da API.",
      "Retornar erro funcional claro para metodo invalido.",
    ],
    commandHints: [
      "rg -n \"fetch\\(|method:\\s*\\\"\" src",
      "rg -n \"export async function GET|POST|PUT|PATCH|DELETE\" src/app/api",
    ],
  },
  408: {
    subtype: "request_timeout",
    title: "HTTP 408 Request Timeout",
    probableCauses: [
      "Endpoint lento ou dependencia externa lenta.",
      "Timeout de gateway curto para a operacao.",
      "Sem retry controlado no cliente.",
    ],
    technicalChecks: [
      "Medir latencia do endpoint/dependencias.",
      "Conferir timeout de fetch e proxy.",
      "Validar se ha gargalo de query/API externa.",
    ],
    recommendedActions: [
      "Otimizar endpoint e adicionar retry idempotente com backoff.",
      "Mostrar estado de tentativa novamente na UI.",
    ],
    commandHints: [
      "rg -n \"timeout|AbortController|signal|retry|backoff\" src",
    ],
  },
  409: {
    subtype: "resource_conflict",
    title: "HTTP 409 Conflict",
    probableCauses: [
      "Conflito de estado/versao do recurso.",
      "Duplicidade por chave unica.",
      "Falta de idempotencia em repeticao de request.",
    ],
    technicalChecks: [
      "Auditar restricoes unicas e regras de negocio.",
      "Mapear corrida entre requests simultaneas.",
      "Avaliar uso de versionamento/etag.",
    ],
    recommendedActions: [
      "Implementar operacoes idempotentes.",
      "Exibir mensagem orientando atualizar e reenviar.",
    ],
    commandHints: [
      "rg -n \"upsert|unique|conflict|transaction\" src",
      "rg -n \"idempot|retry|etag|version\" src",
    ],
  },
  413: {
    subtype: "payload_too_large",
    title: "HTTP 413 Payload Too Large",
    probableCauses: [
      "Upload/body acima do limite permitido.",
      "Sem compressao/chunking para payload grande.",
      "Limite de parser/gateway muito baixo.",
    ],
    technicalChecks: [
      "Medir tamanho real do payload enviado.",
      "Revisar limites no backend/proxy.",
      "Validar estrategia de upload.",
    ],
    recommendedActions: [
      "Validar tamanho no cliente antes de enviar.",
      "Adotar upload em partes para arquivos grandes.",
    ],
    commandHints: [
      "rg -n \"multipart|form-data|upload|bodyParser|maxFile\" src",
    ],
  },
  415: {
    subtype: "unsupported_media_type",
    title: "HTTP 415 Unsupported Media Type",
    probableCauses: [
      "Content-Type incorreto para o endpoint.",
      "Body enviado com serializacao invalida.",
      "Endpoint espera multipart e recebeu JSON (ou vice-versa).",
    ],
    technicalChecks: [
      "Conferir header Content-Type enviado.",
      "Validar parse do body no backend.",
      "Alinhar formato de payload no contrato da API.",
    ],
    recommendedActions: [
      "Padronizar Content-Type por endpoint.",
      "Adicionar erro de validacao claro no backend.",
    ],
    commandHints: [
      "rg -n \"Content-Type|headers\" src",
      "rg -n \"request\\.json\\(|formData\\(|multipart\" src/app/api",
    ],
  },
  422: {
    subtype: "validation_failed",
    title: "HTTP 422 Unprocessable Entity",
    probableCauses: [
      "Campos obrigatorios faltando.",
      "Formato de campo invalido para regra de negocio.",
      "Schema rejeitou payload no backend.",
    ],
    technicalChecks: [
      "Inspecionar detalhe do erro de schema retornado.",
      "Replicar validacao do backend no frontend.",
      "Conferir mascara/conversao de tipos antes do envio.",
    ],
    recommendedActions: [
      "Mostrar erro por campo na UI.",
      "Unificar schema entre frontend e backend.",
    ],
    commandHints: [
      "rg -n \"zod|yup|schema|safeParse\" src",
      "rg -n \"form|react-hook-form|validation\" src/components src/app",
    ],
  },
  429: {
    subtype: "rate_limited",
    title: "HTTP 429 Too Many Requests",
    probableCauses: [
      "Burst de requests sem debounce/throttle.",
      "Retry sem backoff gerando avalanche.",
      "Limite de API baixo para o fluxo.",
    ],
    technicalChecks: [
      "Contar requests disparadas por acao.",
      "Verificar debounce/throttle em campos dinamicos.",
      "Auditar politica de retry e rate limit.",
    ],
    recommendedActions: [
      "Aplicar backoff exponencial e deduplicacao de request.",
      "Cachear leituras repetidas.",
    ],
    commandHints: [
      "rg -n \"debounce|throttle|retry|backoff\" src",
      "rg -n \"useEffect\\(|fetch\\(\" src/components src/app",
    ],
  },
  500: {
    subtype: "internal_server_error",
    title: "HTTP 500 Internal Server Error",
    probableCauses: [
      "Excecao nao tratada no endpoint.",
      "Dependencia critica indisponivel (DB/API externa/storage).",
      "Dados inesperados sem validacao defensiva.",
    ],
    technicalChecks: [
      "Correlacionar request com stack trace do backend.",
      "Logar entrada e saida do endpoint com contexto.",
      "Reproduzir com o mesmo payload.",
    ],
    recommendedActions: [
      "Encapsular endpoint com try/catch e erro consistente.",
      "Adicionar validacoes e fallback de dependencia.",
    ],
    commandHints: [
      "rg -n \"throw new Error|try\\s*\\{|catch\\s*\\(\" src/app/api src/lib",
      "rg -n \"db|prisma|supabase|axios|fetch\" src/app/api src/lib",
    ],
  },
  502: {
    subtype: "bad_gateway_upstream",
    title: "HTTP 502 Bad Gateway",
    probableCauses: [
      "Gateway recebeu resposta invalida do upstream.",
      "Servico upstream caiu/reiniciou.",
      "Roteamento interno com falha.",
    ],
    technicalChecks: [
      "Verificar saude do upstream no horario da falha.",
      "Inspecionar logs de proxy/gateway.",
      "Conferir timeout/keep-alive entre servicos.",
    ],
    recommendedActions: [
      "Implementar retry seletivo para falha transiente.",
      "Adicionar fallback para indisponibilidade parcial.",
    ],
    commandHints: [
      "rg -n \"proxy|rewrites|upstream|gateway\" next.config.js src",
      "rg -n \"fetch\\(|axios\\(\" src/app/api src/lib",
    ],
  },
  503: {
    subtype: "service_unavailable",
    title: "HTTP 503 Service Unavailable",
    probableCauses: [
      "Servico em sobrecarga/manutencao.",
      "Escalabilidade insuficiente para o pico.",
      "Dependencia critica indisponivel.",
    ],
    technicalChecks: [
      "Checar health checks e disponibilidade.",
      "Analisar saturacao de CPU/memoria/conexoes.",
      "Mapear backlog/filas de processamento.",
    ],
    recommendedActions: [
      "Adicionar fallback com mensagem clara de indisponibilidade.",
      "Ajustar autoscaling/protecao de carga.",
    ],
    commandHints: [
      "rg -n \"health|ready|liveness|status\" src/app/api src/lib",
      "rg -n \"queue|worker|retry|circuit\" src",
    ],
  },
  504: {
    subtype: "gateway_timeout",
    title: "HTTP 504 Gateway Timeout",
    probableCauses: [
      "Upstream excedeu timeout do gateway.",
      "Endpoint com operacao lenta.",
      "Dependencia externa com latencia alta.",
    ],
    technicalChecks: [
      "Mapear etapa lenta no trace da request.",
      "Conferir timeout de gateway e backend.",
      "Avaliar cache para leituras repetidas.",
    ],
    recommendedActions: [
      "Otimizar trecho lento e reduzir encadeamento de chamadas.",
      "Configurar timeout/retry com idempotencia.",
    ],
    commandHints: [
      "rg -n \"timeout|AbortController|signal\" src",
      "rg -n \"cache|revalidate|unstable_cache\" src/app src/lib",
    ],
  },
};

function diagnoseHttpStatus(status, method, requestUrl) {
  const data = HTTP_STATUS_INTELLIGENCE[status];
  const requestPath = tryParsePathname(requestUrl);
  const isServerError = status >= 500;

  const fallbackData = isServerError
    ? {
        subtype: "server_error_generic",
        title: `HTTP ${status} Server Error`,
        probableCauses: [
          "Erro interno nao mapeado explicitamente.",
          "Falha de dependencia intermitente.",
          "Excecao nao tratada no backend.",
        ],
        technicalChecks: [
          "Capturar stack trace e contexto da request.",
          "Mapear dependencia que falhou.",
          "Garantir resposta de erro padronizada.",
        ],
        recommendedActions: [
          "Tratar excecoes no endpoint e reforcar logs.",
          "Monitorar taxa de erro por rota.",
        ],
        commandHints: [
          "rg -n \"throw new Error|console.error|try\\s*\\{|catch\\s*\\(\" src/app/api src/lib",
        ],
      }
    : {
        subtype: "client_error_generic",
        title: `HTTP ${status} Client Error`,
        probableCauses: [
          "Contrato frontend/backend desalinhado.",
          "Permissao/cabecalho/payload invalido.",
          "Endpoint incorreto ou regra de negocio rejeitou a acao.",
        ],
        technicalChecks: [
          "Comparar request real com contrato da API.",
          "Verificar autenticacao/autorizacao.",
          "Inspecionar detalhe do erro devolvido pelo backend.",
        ],
        recommendedActions: [
          "Ajustar payload e validacoes.",
          "Padronizar erros para feedback claro na UI.",
        ],
        commandHints: [
          "rg -n \"fetch\\(|axios|Authorization|Content-Type\" src",
          "rg -n \"schema|zod|validate|safeParse\" src/app/api src/lib",
        ],
      };

  const selected = data ?? fallbackData;
  return {
    category: "http",
    subtype: selected.subtype,
    confidence: "high",
    title: selected.title,
    httpStatus: status,
    method,
    requestUrl,
    requestPath,
    failureText: "",
    probableCauses: selected.probableCauses,
    technicalChecks: selected.technicalChecks,
    recommendedActions: selected.recommendedActions,
    commandHints: selected.commandHints,
    likelyAreas: ["src/app/api/**/route.ts", "src/lib/**"],
    technicalExplanation: isServerError
      ? "Erro HTTP 5xx retornado pela API, ligado a excecao de backend ou dependencia indisponivel."
      : "Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.",
    laymanExplanation: isServerError
      ? "O servidor nao conseguiu concluir a operacao."
      : "A requisicao foi rejeitada por dados/permissao/rota incorreta.",
    recommendedResolution: selected.recommendedActions.join(" "),
  };
}

function diagnoseNetworkFailure(method, requestUrl, failureText) {
  const lower = String(failureText ?? "").toLowerCase();
  const requestPath = tryParsePathname(requestUrl);
  const base = {
    category: "network",
    subtype: "network_unknown",
    confidence: "medium",
    title: `Falha de rede em ${method || "fetch"}`,
    httpStatus: null,
    method,
    requestUrl,
    requestPath,
    failureText,
    probableCauses: [],
    technicalChecks: [],
    recommendedActions: [],
    commandHints: [],
    likelyAreas: ["src/lib/**", "src/app/api/**/route.ts", "src/components/**"],
    technicalExplanation:
      "A requisicao falhou antes de receber resposta HTTP valida. Normalmente envolve conectividade, CORS, DNS, certificado ou timeout.",
    laymanExplanation:
      "O app tentou buscar dados, mas nao conseguiu conversar com o servidor.",
    recommendedResolution:
      "Verificar conectividade, CORS e URL da API. Garantir fallback amigavel e opcao de tentar novamente.",
  };

  if (lower.includes("err_insufficient_resources")) {
    return {
      ...base,
      subtype: "runtime_resource_limited",
      title: "Limite de recursos no ambiente de auditoria",
      probableCauses: [
        "Ambiente serverless sem recursos suficientes para abrir/renderizar a pagina.",
        "Bloqueio do site para trafego de datacenter/headless.",
        "Pagina exige mais memoria/conexoes do que o runtime liberou.",
      ],
      technicalChecks: [
        "Comparar execucao no servidor vs CMD local para a mesma URL.",
        "Validar se o erro ocorre apenas em ambiente cloud/serverless.",
        "Executar rodada local headed para confirmar comportamento real da pagina.",
      ],
      recommendedActions: [
        "Usar auditoria completa via CMD local para diagnostico de botoes/layout.",
        "No servidor, tratar como sinal de limite de runtime e manter fallback HTTP.",
      ],
      commandHints: [
        "npm --prefix qa run audit:cmd -- --config \"audit.default.json\" --base-url \"https://SEU-SITE\" --no-server --fresh --live-log --human-log",
      ],
    };
  }

  if (lower.includes("cors") || lower.includes("cross-origin")) {
    return {
      ...base,
      subtype: "network_cors_blocked",
      title: "Falha de rede: CORS bloqueado",
      probableCauses: [
        "Origin atual nao permitido no backend.",
        "Preflight OPTIONS sem headers corretos.",
        "Uso de credentials/cookies sem configuracao CORS.",
      ],
      technicalChecks: [
        "Validar Access-Control-Allow-Origin/Methods/Headers.",
        "Inspecionar resposta do preflight OPTIONS.",
        "Revisar credentials e SameSite.",
      ],
      recommendedActions: [
        "Permitir origin correto e headers necessarios.",
        "Adicionar erro de CORS com explicacao na UI.",
      ],
      commandHints: [
        "rg -n \"Access-Control-Allow|CORS|origin\" src/app/api src/lib",
        "rg -n \"credentials|withCredentials|sameSite\" src",
      ],
    };
  }

  if (lower.includes("err_name_not_resolved") || lower.includes("dns") || lower.includes("name not resolved")) {
    return {
      ...base,
      subtype: "network_dns_failure",
      title: "Falha de rede: DNS",
      probableCauses: [
        "Hostname da API incorreto.",
        "DNS do ambiente nao resolve o dominio.",
        "Variavel de ambiente com URL invalida.",
      ],
      technicalChecks: [
        "Conferir dominio configurado no fetch/baseUrl.",
        "Testar resolucao DNS no ambiente de deploy.",
        "Validar variaveis NEXT_PUBLIC/ENV por ambiente.",
      ],
      recommendedActions: [
        "Corrigir host da API por ambiente.",
        "Validar URL na inicializacao do app.",
      ],
      commandHints: [
        "rg -n \"NEXT_PUBLIC|API_URL|baseUrl|baseURL\" src",
      ],
    };
  }

  if (
    lower.includes("err_cert") ||
    lower.includes("ssl") ||
    lower.includes("tls") ||
    lower.includes("certificate")
  ) {
    return {
      ...base,
      subtype: "network_tls_certificate",
      title: "Falha de rede: TLS/SSL",
      probableCauses: [
        "Certificado invalido/expirado.",
        "Dominio nao corresponde ao certificado.",
        "Handshake TLS falhando no host/proxy.",
      ],
      technicalChecks: [
        "Validar certificado e cadeia de confianca.",
        "Checar expiracao/SAN do dominio.",
        "Revisar configuracao HTTPS do host/proxy.",
      ],
      recommendedActions: [
        "Renovar/corrigir certificado da API.",
        "Eliminar chamadas mixed-content.",
      ],
      commandHints: [
        "rg -n \"https://|http://\" src",
        "rg -n \"proxy|rewrites|headers\" next.config.js src",
      ],
    };
  }

  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("err_timed_out")) {
    return {
      ...base,
      subtype: "network_timeout",
      title: "Falha de rede: timeout",
      probableCauses: [
        "Servidor demorou alem do limite.",
        "Rede com latencia alta/instavel.",
        "Sem timeout/retry controlado no cliente.",
      ],
      technicalChecks: [
        "Medir latencia da API no horario da falha.",
        "Auditar timeout de fetch/proxy.",
        "Verificar retries com backoff.",
      ],
      recommendedActions: [
        "Aplicar AbortController + retry idempotente.",
        "Exibir estado de reconexao para o usuario.",
      ],
      commandHints: [
        "rg -n \"AbortController|signal|timeout|retry|backoff\" src",
      ],
    };
  }

  if (
    lower.includes("err_connection_refused") ||
    lower.includes("econnrefused") ||
    lower.includes("connection refused")
  ) {
    return {
      ...base,
      subtype: "network_connection_refused",
      title: "Falha de rede: conexao recusada",
      probableCauses: [
        "Servico destino nao esta ativo na porta.",
        "Host/porta incorretos no endpoint.",
        "Firewall/rede bloqueando a conexao.",
      ],
      technicalChecks: [
        "Conferir host e porta configurados.",
        "Verificar se o servico esta no ar.",
        "Checar bloqueios de rede/firewall.",
      ],
      recommendedActions: [
        "Corrigir endpoint e health checks.",
        "Adicionar fallback de indisponibilidade na UI.",
      ],
      commandHints: [
        "rg -n \"127.0.0.1|localhost|API_URL|PORT\" src qa",
      ],
    };
  }

  if (lower.includes("err_blocked_by_client")) {
    return {
      ...base,
      subtype: "network_blocked_by_client",
      title: "Falha de rede: bloqueio no cliente",
      probableCauses: [
        "Extensao de navegador bloqueou o recurso.",
        "Filtro corporativo bloqueia o dominio.",
        "Recurso classificado como tracking/ad.",
      ],
      technicalChecks: [
        "Reproduzir em navegador limpo sem extensoes.",
        "Verificar se recurso bloqueado e essencial.",
        "Mapear dominio e tipo do recurso bloqueado.",
      ],
      recommendedActions: [
        "Remover dependencia critica de recurso bloqueavel.",
        "Criar fallback quando recurso opcional falhar.",
      ],
      commandHints: [
        "rg -n \"analytics|track|pixel|ads\" src",
      ],
    };
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("load failed") ||
    lower.includes("err_failed")
  ) {
    return {
      ...base,
      subtype: "network_fetch_failed",
      title: "Falha de rede: fetch falhou",
      probableCauses: [
        "Conectividade com endpoint falhou.",
        "Erro de CORS/DNS/TLS sem detalhe claro.",
        "Cancelamento/abort nao tratado.",
      ],
      technicalChecks: [
        "Inspecionar request no DevTools > Network.",
        "Correlacionar com logs do backend/proxy.",
        "Registrar codigo interno para classe de erro.",
      ],
      recommendedActions: [
        "Tratar falhas de fetch com mensagem + retry.",
        "Melhorar observabilidade do erro de rede.",
      ],
      commandHints: [
        "rg -n \"fetch\\(|try\\s*\\{|catch\\s*\\(\" src",
        "rg -n \"setError|toast|fallback|retry\" src/components src/app",
      ],
    };
  }

  return {
    ...base,
    probableCauses: [
      "Falha de rede sem assinatura especifica.",
      "Infraestrutura instavel ou endpoint indisponivel.",
      "Timeout/cancelamento sem tratamento explicito.",
    ],
    technicalChecks: [
      "Inspecionar request no Network e logs do servidor.",
      "Validar DNS, CORS, TLS e disponibilidade do endpoint.",
      "Garantir fallback de erro de comunicacao na UI.",
    ],
    recommendedActions: [
      "Adicionar retries idempotentes com backoff.",
      "Padronizar telemetria de erro de rede.",
    ],
    commandHints: [
      "rg -n \"fetch\\(|axios|AbortController|signal\" src",
    ],
  };
}

function diagnoseRuntimeSignal(code, detail) {
  const normalized = normalizeText(detail);
  const lower = normalized.toLowerCase();
  const base = {
    category: code === CODE.CONSOLE_ERROR ? "console" : "runtime",
    subtype: "runtime_unknown",
    confidence: "medium",
    title: code === CODE.CONSOLE_ERROR ? "Erro no console do navegador" : "Erro de runtime no navegador",
    httpStatus: null,
    method: "",
    requestUrl: "",
    requestPath: "",
    failureText: normalized,
    probableCauses: [],
    technicalChecks: [],
    recommendedActions: [],
    commandHints: [],
    likelyAreas: ["src/components/**", "src/app/**", "src/lib/**"],
    technicalExplanation:
      "Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.",
    laymanExplanation:
      "Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.",
    recommendedResolution:
      "Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.",
  };

  const resourceStatus = lower.match(/status of (\d{3})/);
  if (resourceStatus) {
    const status = Number(resourceStatus[1]);
    if (Number.isFinite(status) && status >= 400) {
      const httpView = diagnoseHttpStatus(status, "GET", "");
      return {
        ...httpView,
        category: "console_http",
        subtype: `console_http_${status}`,
        title: `Console reportou recurso com HTTP ${status}`,
        confidence: "high",
      };
    }
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror when attempting to fetch resource")
  ) {
    return {
      ...base,
      subtype: "runtime_fetch_unhandled",
      title: "Runtime sem tratamento para falha de fetch",
      probableCauses: [
        "fetch rejeitou e nao houve tratamento adequado.",
        "Promise rejection sem fallback da UI.",
        "Erro de resposta quebrou fluxo da tela.",
      ],
      technicalChecks: [
        "Envolver fetch com try/catch e validar response.ok.",
        "Garantir estado de erro/loading no fluxo da tela.",
        "Registrar endpoint/status no erro de frontend.",
      ],
      recommendedActions: [
        "Padronizar tratamento de fetch no frontend.",
        "Exibir mensagem de erro com opcao de tentar novamente.",
      ],
      commandHints: [
        "rg -n \"fetch\\(|response\\.ok|try\\s*\\{|catch\\s*\\(\" src",
        "rg -n \"useEffect\\(|setError|toast|fallback\" src/components src/app",
      ],
    };
  }

  if (lower.includes("cannot read properties of") || lower.includes("null is not an object")) {
    return {
      ...base,
      subtype: "runtime_null_undefined_access",
      title: "Acesso invalido a null/undefined",
      probableCauses: [
        "Dados assincronos nao carregados antes do uso.",
        "Objeto opcional sem guarda.",
        "Mudanca de contrato de dados sem ajuste na UI.",
      ],
      technicalChecks: [
        "Mapear variavel nula no stack trace.",
        "Adicionar guard clauses antes do acesso.",
        "Garantir valor default para estado assicrono.",
      ],
      recommendedActions: [
        "Aplicar optional chaining e fallback de render.",
        "Cobrir com teste de estado vazio/erro/loading.",
      ],
      commandHints: [
        "rg -n \"\\?\\.|null|undefined\" src/components src/app src/lib",
      ],
    };
  }

  if (lower.includes("is not a function")) {
    return {
      ...base,
      subtype: "runtime_type_mismatch_function",
      title: "Tipo invalido: valor nao e funcao",
      probableCauses: [
        "Import/prop errado sobrescrevendo callback.",
        "Valor esperado como funcao veio undefined/string.",
        "API/objeto alterado sem atualizar chamadas.",
      ],
      technicalChecks: [
        "Inspecionar origem do callback no stack trace.",
        "Validar tipo de props/retornos antes de invocar.",
        "Conferir imports default vs named.",
      ],
      recommendedActions: [
        "Corrigir assinatura/tipagem da funcao.",
        "Adicionar guarda quando callback for opcional.",
      ],
      commandHints: [
        "rg -n \"onClick|callback|props|is not a function\" src/components src/app",
        "rg -n \"export default|export const|import .* from\" src",
      ],
    };
  }

  if (lower.includes("is not defined")) {
    return {
      ...base,
      subtype: "runtime_reference_not_defined",
      title: "Referencia nao definida",
      probableCauses: [
        "Variavel usada sem declaracao/import.",
        "Dependencia carregada fora de ordem.",
        "Uso de API de browser fora de ambiente client.",
      ],
      technicalChecks: [
        "Mapear simbolo ausente no stack trace.",
        "Checar imports/escopo da variavel.",
        "Validar guard de ambiente para window/document.",
      ],
      recommendedActions: [
        "Declarar/importar simbolo corretamente.",
        "Proteger codigo browser-only para SSR.",
      ],
      commandHints: [
        "rg -n \"window\\.|document\\.|navigator\\.|localStorage\" src/components src/app",
        "rg -n \"typeof window|is not defined\" src",
      ],
    };
  }

  if (lower.includes("hydration")) {
    return {
      ...base,
      subtype: "runtime_hydration_mismatch",
      title: "Hydration mismatch",
      probableCauses: [
        "HTML server/client diferente no primeiro render.",
        "Uso de data nao deterministica no SSR.",
        "Leitura de estado browser no render server.",
      ],
      technicalChecks: [
        "Comparar markup de server e client no componente.",
        "Mover efeitos browser para useEffect.",
        "Remover fontes de variacao no primeiro render.",
      ],
      recommendedActions: [
        "Sincronizar estado inicial entre server e client.",
        "Isolar trechos client-only com guard apropriado.",
      ],
      commandHints: [
        "rg -n \"use client|useEffect|Date\\(|Math\\.random|window\\.\" src/app src/components",
      ],
    };
  }

  if (lower.includes("chunkloaderror") || lower.includes("loading chunk")) {
    return {
      ...base,
      subtype: "runtime_chunk_load_error",
      title: "Falha ao carregar chunk",
      probableCauses: [
        "Deploy novo com cache antigo no navegador.",
        "Chunk inexistente apos nova build.",
        "CDN servindo assets desatualizados.",
      ],
      technicalChecks: [
        "Validar politica de cache de _next/static.",
        "Reproduzir em janela anonima/sem cache.",
        "Conferir integridade dos assets de deploy.",
      ],
      recommendedActions: [
        "Ajustar invalidacao de cache no deploy.",
        "Adicionar fallback para reload controlado.",
      ],
      commandHints: [
        "rg -n \"next.config|cache-control|headers\" .",
      ],
    };
  }

  return {
    ...base,
    probableCauses: [
      "Erro de runtime/console sem assinatura especifica.",
      "Excecao nao tratada em render ou evento.",
      "Dados inesperados sem validacao defensiva.",
    ],
    technicalChecks: [
      "Usar stack trace para chegar no arquivo/linha.",
      "Adicionar guard clauses no trecho que falha.",
      "Reexecutar fluxo e confirmar ausencia do erro.",
    ],
    recommendedActions: [
      "Aprimorar tratamento de erro no frontend.",
      "Criar teste de regressao para o fluxo quebrado.",
    ],
    commandHints: [
      "rg -n \"console.error|throw new Error|try\\s*\\{|catch\\s*\\(\" src/components src/app src/lib",
    ],
  };
}

function inferIssueIntelligence(input, guide) {
  const detail = normalizeText(input.detail);
  const fallback = {
    category: "generic",
    subtype: "generic",
    confidence: "low",
    title: input.code,
    httpStatus: null,
    method: "",
    requestUrl: "",
    requestPath: "",
    failureText: "",
    probableCauses: [],
    technicalChecks: [],
    recommendedActions: [],
    commandHints: [],
    likelyAreas: [],
    technicalExplanation: guide.technical,
    laymanExplanation: guide.layman,
    recommendedResolution: guide.recommendation,
  };

  let rich = null;

  if (input.code === CODE.HTTP_4XX || input.code === CODE.HTTP_5XX) {
    const parsed = parseHttpDetail(detail);
    if (parsed) {
      rich = diagnoseHttpStatus(parsed.status, parsed.method, parsed.requestUrl);
    }
  } else if (input.code === CODE.NET_REQUEST_FAILED) {
    const parsed = parseRequestFailedDetail(detail);
    if (parsed) {
      rich = diagnoseNetworkFailure(parsed.method, parsed.requestUrl, parsed.failureText);
    } else {
      rich = diagnoseNetworkFailure("", "", detail);
    }
  } else if (input.code === CODE.JS_RUNTIME_ERROR || input.code === CODE.CONSOLE_ERROR) {
    rich = diagnoseRuntimeSignal(input.code, detail);
  } else if (input.code === CODE.CONTENT_LANGUAGE_CONFLICT) {
    rich = {
      category: "content_language",
      subtype: "content_language_conflict",
      confidence: "high",
      title: "Conflito de idiomas visiveis na interface",
      httpStatus: null,
      method: "",
      requestUrl: input.url ?? "",
      requestPath: tryParsePathname(input.url ?? ""),
      failureText: detail,
      probableCauses: [
        "Parte da copy ficou fora da camada de i18n.",
        "Header, footer, CTA ou mensagens de estado reutilizaram textos do locale errado.",
        "Atributo lang, dicionarios e componentes nao estao sincronizados.",
      ],
      technicalChecks: [
        "Mapear quais componentes renderizam os trechos no idioma errado.",
        "Conferir chaves de traducao, fallbacks e textos hardcoded.",
        "Validar se o atributo lang do documento acompanha a rota/locale ativo.",
      ],
      recommendedActions: [
        "Centralizar a copy em i18n e eliminar textos soltos em componentes.",
        "Reexecutar a auditoria para confirmar que nao restaram trechos residuais.",
      ],
      commandHints: [
        "rg -n \"contact|pricing|download|proof|report|start|with|from|your|demo\" src app companion",
        "rg -n \"i18n|locale|messages|translations|dictionary|lang\" src app companion",
      ],
      likelyAreas: ["src/i18n/**", "src/config/**", "src/components/**", "app/**"],
      technicalExplanation:
        "Foram encontrados textos visiveis fora do idioma principal da pagina, o que indica conflito de internacionalizacao e copy residual.",
      laymanExplanation:
        "A tela mistura idiomas diferentes e passa sensacao de produto inacabado.",
      recommendedResolution:
        "Remover os textos fora do idioma principal e garantir que toda a interface leia da mesma fonte de traducao.",
    };
  } else if (input.code === CODE.ROUTE_LOAD_FAIL) {
    const lower = detail.toLowerCase();
    if (lower.includes("err_insufficient_resources")) {
      rich = {
        category: "routing",
        subtype: "route_resource_limited",
        confidence: "high",
        title: "Falha de carga por limite de recursos",
        httpStatus: null,
        method: "",
        requestUrl: input.url ?? "",
        requestPath: tryParsePathname(input.url ?? ""),
        failureText: detail,
        probableCauses: [
          "Ambiente serverless sem recursos suficientes para render da rota.",
          "Bloqueio do dominio para ambiente headless de datacenter.",
          "Dependencias da pagina exigem runtime mais robusto.",
        ],
        technicalChecks: [
          "Rodar a mesma auditoria no CMD local com navegador real.",
          "Comparar resultado com fallback HTTP para validar disponibilidade da URL.",
          "Inspecionar se apenas a cloud falha e local passa.",
        ],
        recommendedActions: [
          "Considerar resultado serverless como triagem inicial.",
          "Usar CMD local para validacao final de interacoes e ordem visual.",
        ],
        commandHints: [
          "npm --prefix qa run audit:cmd -- --config \"audit.default.json\" --base-url \"https://SEU-SITE\" --no-server --fresh --live-log --human-log",
        ],
        likelyAreas: ["qa/src/index.mjs", "app/api/run-plan/route.ts"],
        technicalExplanation:
          "A rota nao abriu no ambiente remoto por limite de recursos do runtime, nao necessariamente por erro funcional da pagina.",
        laymanExplanation:
          "No servidor remoto faltou recurso para carregar a pagina completa.",
        recommendedResolution:
          "Validar no CMD local para confirmar o comportamento real e usar servidor como triagem.",
      };
    } else if (lower.includes("timeout")) {
      rich = {
        category: "routing",
        subtype: "route_timeout",
        confidence: "high",
        title: "Falha de carga por timeout",
        httpStatus: null,
        method: "",
        requestUrl: input.url ?? "",
        requestPath: tryParsePathname(input.url ?? ""),
        failureText: detail,
        probableCauses: [
          "Rota depende de backend lento ou indisponivel.",
          "Middleware com redirecionamento em loop.",
          "Render bloqueado por erro silencioso.",
        ],
        technicalChecks: [
          "Reproduzir rota com logs ativos.",
          "Medir tempo de resposta do carregamento inicial.",
          "Inspecionar middleware e chamadas fetch da pagina.",
        ],
        recommendedActions: [
          "Otimizar carregamento e incluir fallback de loading/erro.",
          "Corrigir loop de redirect/middleware quando existir.",
        ],
        commandHints: [
          "rg -n \"middleware|redirect\\(|notFound\\(|fetch\\(\" src/app src",
        ],
        likelyAreas: ["src/app/**", "src/middleware.ts", "src/app/api/**/route.ts"],
        technicalExplanation:
          "A rota excedeu o tempo limite de carga, indicando gargalo de backend/render ou loop de navegacao.",
        laymanExplanation:
          "A pagina demorou demais para abrir e aparentou travar.",
        recommendedResolution:
          "Identificar a etapa lenta no fluxo e corrigir para que a rota abra no tempo esperado.",
      };
    }
  }

  const merged = {
    ...fallback,
    ...(rich ?? {}),
  };

  merged.probableCauses = uniqueNormalizedLines(merged.probableCauses, 8);
  merged.technicalChecks = uniqueNormalizedLines(merged.technicalChecks, 8);
  merged.recommendedActions = uniqueNormalizedLines(merged.recommendedActions, 8);
  merged.commandHints = uniqueNormalizedLines(merged.commandHints, 8);
  merged.likelyAreas = uniqueNormalizedLines(merged.likelyAreas, 8);

  if (!merged.recommendedResolution) {
    merged.recommendedResolution = merged.recommendedActions.join(" ");
  }

  return merged;
}

function emitLiveEvent(args, type, payload = {}) {
  if (!args?.liveLog) return;
  const event = { ts: nowIso(), type, ...payload };
  // Prefixo estavel para parsing no Studio.
  // eslint-disable-next-line no-console
  console.log(`SPLIVE ${JSON.stringify(event)}`);

  if (args?.humanLog) {
    const route = payload.route ? ` rota=${payload.route}` : "";
    const action = payload.action ? ` acao=${payload.action}` : "";
    const detail = payload.detail ? ` detalhe=${payload.detail}` : "";
    // eslint-disable-next-line no-console
    console.log(`[LIVE] ${type}${route}${action}${detail}`);
  }
}

function parseArgs(argv) {
  const args = {
    configPath: "audit.config.json",
    headed: false,
    fresh: false,
    noResume: false,
    noServer: false,
    maxRunMs: null,
    liveLog: false,
    humanLog: false,
    baseUrlOverride: "",
    auditScope: "full",
    viewportWidthOverride: null,
    viewportHeightOverride: null,
    viewportLabel: "",
    pauseRequestFile: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--headed") {
      args.headed = true;
      continue;
    }
    if (token === "--fresh") {
      args.fresh = true;
      continue;
    }
    if (token === "--no-resume") {
      args.noResume = true;
      continue;
    }
    if (token === "--no-server") {
      args.noServer = true;
      continue;
    }
    if (token === "--live-log") {
      args.liveLog = true;
      continue;
    }
    if (token === "--human-log") {
      args.humanLog = true;
      continue;
    }
    if (token === "--config" && argv[i + 1]) {
      args.configPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--base-url" && argv[i + 1]) {
      args.baseUrlOverride = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--scope" && argv[i + 1]) {
      args.auditScope = normalizeAuditScope(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--viewport-width" && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      args.viewportWidthOverride = Number.isFinite(parsed) && parsed >= 320 ? parsed : null;
      i += 1;
      continue;
    }
    if (token === "--viewport-height" && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      args.viewportHeightOverride = Number.isFinite(parsed) && parsed >= 320 ? parsed : null;
      i += 1;
      continue;
    }
    if (token === "--viewport-label" && argv[i + 1]) {
      args.viewportLabel = String(argv[i + 1]).trim();
      i += 1;
      continue;
    }
    if (token === "--pause-request-file" && argv[i + 1]) {
      args.pauseRequestFile = String(argv[i + 1]).trim();
      i += 1;
      continue;
    }
    if (token === "--max-run-ms" && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      args.maxRunMs = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      i += 1;
      continue;
    }
  }

  return args;
}

function normalizeAuditScope(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "seo") return "seo";
  if (["experience", "ux", "actions", "action", "buttons", "site"].includes(raw)) {
    return "experience";
  }
  return "full";
}

function shouldRunSeoForScope(scope) {
  return normalizeAuditScope(scope) !== "experience";
}

function shouldRunExperienceForScope(scope) {
  return normalizeAuditScope(scope) !== "seo";
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const sanitized = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(sanitized);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function ensureArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Config invalida: ${fieldName} precisa ser array.`);
  }
}

function toAbsoluteMaybe(value, baseDir) {
  if (!value || typeof value !== "string") return "";
  return path.isAbsolute(value) ? value : path.resolve(baseDir, value);
}

function normalizeRoutePath(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  const withoutHash = raw.split("#")[0].trim();
  if (!withoutHash) return "";

  try {
    const parsed = new URL(withoutHash, "https://sitepulse.local");
    const pathname = parsed.pathname.replace(/\/{2,}/g, "/");
    if (!pathname.startsWith("/")) return "";
    if (pathname === "/") return "/";
    return pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function canonicalRouteKey(input) {
  const normalized = normalizeRoutePath(input);
  if (!normalized) return "";
  let key = normalized.toLowerCase();
  if (key !== "/" && key.endsWith(".html")) {
    key = key.slice(0, -5);
    if (!key.startsWith("/")) key = `/${key}`;
    if (!key) key = "/";
  }
  return key;
}

function buildRouteUrl(baseUrl, route) {
  const base = String(baseUrl ?? "").trim();
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedRoute = String(route ?? "").trim().replace(/^\/+/, "");
  return new URL(normalizedRoute, normalizedBase).toString();
}

function toInternalRoute(candidateUrl, baseOrigin) {
  const raw = String(candidateUrl ?? "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("data:")
  ) {
    return "";
  }

  try {
    const parsed = new URL(raw, `${baseOrigin}/`);
    if (parsed.origin !== baseOrigin) return "";
    const normalizedPath = normalizeRoutePath(parsed.pathname);
    if (!normalizedPath) return "";
    const pathLower = normalizedPath.toLowerCase();
    if (STATIC_ASSET_EXTENSIONS.some((ext) => pathLower.endsWith(ext))) {
      return "";
    }
    return normalizedPath;
  } catch {
    return "";
  }
}

function normalizeSectionOrderRules(rules) {
  if (!Array.isArray(rules)) return [];

  return rules.map((rule, index) => {
    if (!rule || typeof rule !== "object") {
      throw new Error(`Config invalida: sectionOrderRules[${index}] precisa ser objeto.`);
    }

    const beforeSelector = String(rule.beforeSelector ?? "").trim();
    const afterSelector = String(rule.afterSelector ?? "").trim();
    if (!beforeSelector || !afterSelector) {
      throw new Error(
        `Config invalida: sectionOrderRules[${index}] exige beforeSelector e afterSelector.`,
      );
    }

    const routes = Array.isArray(rule.routes)
      ? rule.routes.map((item) => String(item).trim()).filter(Boolean)
      : rule.route
      ? [String(rule.route).trim()]
      : [];

    return {
      id: String(rule.id ?? `section-order-${index + 1}`),
      description: String(rule.description ?? ""),
      beforeSelector,
      afterSelector,
      routes,
      required: rule.required !== false,
    };
  });
}

function normalizeVisualAnalyzer(input) {
  const config = input && typeof input === "object" ? input : {};
  return {
    enabled: config.enabled !== false,
    waitMs: Number.isFinite(Number(config.waitMs)) ? Math.max(0, Number(config.waitMs)) : 900,
    suppressConsentOverlays: config.suppressConsentOverlays !== false,
    overflowTolerancePx: Number.isFinite(Number(config.overflowTolerancePx))
      ? Math.max(0, Number(config.overflowTolerancePx))
      : 12,
    overlapMinAreaPx: Number.isFinite(Number(config.overlapMinAreaPx))
      ? Math.max(200, Number(config.overlapMinAreaPx))
      : 1800,
    overlapRatioThreshold: Number.isFinite(Number(config.overlapRatioThreshold))
      ? Math.max(0.02, Math.min(0.8, Number(config.overlapRatioThreshold)))
      : 0.12,
    alignmentTolerancePx: Number.isFinite(Number(config.alignmentTolerancePx))
      ? Math.max(4, Number(config.alignmentTolerancePx))
      : 28,
    tightSpacingPx: Number.isFinite(Number(config.tightSpacingPx))
      ? Math.max(4, Number(config.tightSpacingPx))
      : 18,
    gapDriftTolerancePx: Number.isFinite(Number(config.gapDriftTolerancePx))
      ? Math.max(8, Number(config.gapDriftTolerancePx))
      : 40,
    edgeGutterMinPx: Number.isFinite(Number(config.edgeGutterMinPx))
      ? Math.max(8, Number(config.edgeGutterMinPx))
      : 20,
    boundaryCollisionPx: Number.isFinite(Number(config.boundaryCollisionPx))
      ? Math.max(0, Number(config.boundaryCollisionPx))
      : 6,
    widthDriftTolerancePx: Number.isFinite(Number(config.widthDriftTolerancePx))
      ? Math.max(24, Number(config.widthDriftTolerancePx))
      : 96,
    hierarchyGapMinPx: Number.isFinite(Number(config.hierarchyGapMinPx))
      ? Math.max(4, Number(config.hierarchyGapMinPx))
      : 8,
    hierarchyRatioMin: Number.isFinite(Number(config.hierarchyRatioMin))
      ? Math.max(1.05, Number(config.hierarchyRatioMin))
      : 1.22,
    clusterCollisionPx: Number.isFinite(Number(config.clusterCollisionPx))
      ? Math.max(0, Number(config.clusterCollisionPx))
      : 18,
    clusterRowOverlapRatio: Number.isFinite(Number(config.clusterRowOverlapRatio))
      ? Math.max(0.15, Math.min(1, Number(config.clusterRowOverlapRatio)))
      : 0.42,
    foldPressureMinBlocks: Number.isFinite(Number(config.foldPressureMinBlocks))
      ? Math.max(3, Number(config.foldPressureMinBlocks))
      : 5,
    foldPressureAvgGapPx: Number.isFinite(Number(config.foldPressureAvgGapPx))
      ? Math.max(8, Number(config.foldPressureAvgGapPx))
      : 24,
    foldPressureSpanRatio: Number.isFinite(Number(config.foldPressureSpanRatio))
      ? Math.max(1, Number(config.foldPressureSpanRatio))
      : 1.6,
    foldViewportMultiplier: Number.isFinite(Number(config.foldViewportMultiplier))
      ? Math.max(1, Number(config.foldViewportMultiplier))
      : 1.1,
    minComparableGapPx: Number.isFinite(Number(config.minComparableGapPx))
      ? Math.max(12, Number(config.minComparableGapPx))
      : 24,
    minBlockWidthPx: Number.isFinite(Number(config.minBlockWidthPx))
      ? Math.max(120, Number(config.minBlockWidthPx))
      : 240,
    minBlockHeightPx: Number.isFinite(Number(config.minBlockHeightPx))
      ? Math.max(40, Number(config.minBlockHeightPx))
      : 72,
    evidencePaddingPx: Number.isFinite(Number(config.evidencePaddingPx))
      ? Math.max(24, Number(config.evidencePaddingPx))
      : 180,
    evidenceFocusPaddingPx: Number.isFinite(Number(config.evidenceFocusPaddingPx))
      ? Math.max(12, Number(config.evidenceFocusPaddingPx))
      : 80,
    evidenceMinWidthPx: Number.isFinite(Number(config.evidenceMinWidthPx))
      ? Math.max(240, Number(config.evidenceMinWidthPx))
      : 760,
    evidenceMinHeightPx: Number.isFinite(Number(config.evidenceMinHeightPx))
      ? Math.max(160, Number(config.evidenceMinHeightPx))
      : 420,
    evidenceFocusMinWidthPx: Number.isFinite(Number(config.evidenceFocusMinWidthPx))
      ? Math.max(180, Number(config.evidenceFocusMinWidthPx))
      : 420,
    evidenceFocusMinHeightPx: Number.isFinite(Number(config.evidenceFocusMinHeightPx))
      ? Math.max(120, Number(config.evidenceFocusMinHeightPx))
      : 240,
    evidenceFullPage: config.evidenceFullPage !== false,
    maxSamples: Number.isFinite(Number(config.maxSamples))
      ? Math.max(3, Number(config.maxSamples))
      : 6,
  };
}

function normalizeConfig(config, configDir) {
  if (!config || typeof config !== "object") {
    throw new Error("Config invalida: JSON vazio ou incorreto.");
  }

  ensureArray(config.routes, "routes");
  ensureArray(config.allowedNoEffectButtonContains ?? [], "allowedNoEffectButtonContains");
  ensureArray(config.ignoredRequestFailedErrors ?? [], "ignoredRequestFailedErrors");
  ensureArray(config.sectionOrderRules ?? [], "sectionOrderRules");

  const serverCwd = path.isAbsolute(config.serverCwd)
    ? config.serverCwd
    : path.resolve(configDir, config.serverCwd ?? process.cwd());

  const reportDir = toAbsoluteMaybe(config.reportDir, configDir) || path.resolve(configDir, "reports");
  const checkpointFile =
    toAbsoluteMaybe(config.checkpointFile, configDir) ||
    path.resolve(reportDir, "sitepulse-checkpoint.json");
  const writablePaths = resolveWritableReportPaths(reportDir, checkpointFile);

  return {
    name: String(config.name ?? "site-audit"),
    baseUrl: String(config.baseUrl ?? "http://127.0.0.1:3000"),
    serverCommand: String(config.serverCommand ?? "npm run start"),
    serverCwd,
    routes: config.routes.map((item) => String(item)),
    routeLoadTimeoutMs: Number(config.routeLoadTimeoutMs ?? 30000),
    buttonClickTimeoutMs: Number(config.buttonClickTimeoutMs ?? 3000),
    clickWaitMs: Number(config.clickWaitMs ?? 900),
    viewportWidth: Number.isFinite(Number(config.viewportWidth)) ? Math.max(320, Number(config.viewportWidth)) : 1536,
    viewportHeight: Number.isFinite(Number(config.viewportHeight)) ? Math.max(320, Number(config.viewportHeight)) : 864,
    requireButtonEffect: config.requireButtonEffect !== false,
    allowedNoEffectButtonContains: (config.allowedNoEffectButtonContains ?? []).map((item) => String(item).toLowerCase()),
    reportDir: writablePaths.reportDir,
    checkpointFile: writablePaths.checkpointFile,
    checkpointEveryClicks: Number(config.checkpointEveryClicks ?? 20),
    maxRunMs: Number(config.maxRunMs ?? 0),
    scrollEffectMinPx: Number.isFinite(Number(config.scrollEffectMinPx))
      ? Math.max(0, Number(config.scrollEffectMinPx))
      : 8,
    sectionOrderWaitMs: Number.isFinite(Number(config.sectionOrderWaitMs))
      ? Math.max(0, Number(config.sectionOrderWaitMs))
      : 1400,
    sectionOrderRules: normalizeSectionOrderRules(config.sectionOrderRules ?? []),
    visualAnalyzer: normalizeVisualAnalyzer(config.visualAnalyzer),
    autoDiscoverRoutes: config.autoDiscoverRoutes !== false,
    discoverFromSitemap: config.discoverFromSitemap !== false,
    discoverMenuLinks: config.discoverMenuLinks !== false,
    maxDiscoveredRoutes: Number.isFinite(Number(config.maxDiscoveredRoutes))
      ? Math.max(1, Number(config.maxDiscoveredRoutes))
      : 40,
    maxActionsPerRoute: Number.isFinite(Number(config.maxActionsPerRoute))
      ? Math.max(0, Number(config.maxActionsPerRoute))
      : 200,
    maxActionRoutes: Number.isFinite(Number(config.maxActionRoutes))
      ? Math.max(0, Number(config.maxActionRoutes))
      : 0,
    ignoredRequestFailedErrors: (config.ignoredRequestFailedErrors ?? ["ERR_ABORTED"]).map((item) =>
      String(item).toLowerCase(),
    ),
  };
}

function buildIssueFixPrompt(issue) {
  const lines = [
    "Atue como engenheiro de software senior focado em causa raiz.",
    "Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.",
    "",
    `Issue: [${issue.code}] (${issue.severity})`,
    `Rota: ${issue.route}`,
    `Acao: ${issue.action || "(sem acao especifica)"}`,
    `URL: ${issue.url || "(nao informada)"}`,
    `Detalhe observado: ${issue.detail}`,
    `Explicacao tecnica: ${issue.technicalExplanation}`,
    `Resolucao recomendada: ${issue.recommendedResolution}`,
    issue.possibleResolution ? `Solucao possivel conhecida: ${issue.possibleResolution}` : "",
    issue.finalResolution ? `Solucao final conhecida: ${issue.finalResolution}` : "",
    issue.resolutionConfidence ? `Confianca da resolucao: ${issue.resolutionConfidence}` : "",
    "",
    "Requisitos obrigatorios:",
    "1. Reproduzir o problema localmente antes da mudanca.",
    "2. Identificar causa raiz real no codigo (nao apenas sintoma).",
    "3. Implementar correcao robusta e minima.",
    "4. Preservar UX, acessibilidade e comportamento mobile/desktop.",
    "5. Revalidar com auditoria automatizada apos o fix.",
    "",
    "Entregue:",
    "- mudancas de codigo",
    "- resumo da causa raiz",
    "- como validar que foi resolvido",
  ];

  if (issue.diagnosis?.title) {
    lines.splice(10, 0, `Classificacao inteligente: ${issue.diagnosis.title} (${issue.diagnosis.subtype})`);
  }
  const compactLines = lines.filter(Boolean);
  if (Array.isArray(issue.learningCases) && issue.learningCases.length) {
    compactLines.push("");
    compactLines.push("Memoria operacional:");
    for (const caseItem of issue.learningCases.slice(0, 3)) {
      compactLines.push(`- [${caseItem.outcome || "known"}] ${caseItem.title} | tentativa: ${caseItem.attempt || "n/a"} | resultado: ${caseItem.result || "n/a"}`);
    }
  }
  if (issue.diagnosis?.probableCauses?.length) {
    compactLines.push("");
    compactLines.push("Causas provaveis detectadas:");
    for (const cause of issue.diagnosis.probableCauses.slice(0, 5)) {
      compactLines.push(`- ${cause}`);
    }
  }
  if (issue.diagnosis?.technicalChecks?.length) {
    compactLines.push("");
    compactLines.push("Checks tecnicos sugeridos:");
    for (const check of issue.diagnosis.technicalChecks.slice(0, 5)) {
      compactLines.push(`- ${check}`);
    }
  }
  if (Array.isArray(issue.evidence) && issue.evidence.length) {
    compactLines.push("");
    compactLines.push("Evidencias capturadas:");
    for (const evidence of issue.evidence.slice(0, 4)) {
      compactLines.push(`- ${evidence.label || "evidence"} | ${evidence.path}`);
    }
  }

  return compactLines.join("\n");
}

function guideForIssueCode(code) {
  return ISSUE_GUIDE[code] ?? {
    technical: "Sem descricao tecnica definida para este codigo.",
    layman: "Foi detectada uma inconsistenca que precisa de revisao.",
    recommendation: "Revisar logs e fluxo afetado para aplicar correcao orientada a causa raiz.",
  };
}

function createIssueLogEntry(issue) {
  return {
    timestamp: issue.timestamp,
    code: issue.code,
    severity: issue.severity,
    route: issue.route,
    action: issue.action,
    viewportLabel: issue.viewportLabel,
    viewport: issue.viewport,
    detail: issue.detail,
    laymanExplanation: issue.laymanExplanation,
    recommendedResolution: issue.recommendedResolution,
    possibleResolution: issue.possibleResolution,
    finalResolution: issue.finalResolution,
    learningSource: issue.learningSource,
    learningStatus: issue.learningStatus,
    learningCounts: issue.learningCounts,
    learningCases: issue.learningCases,
    resolutionConfidence: issue.resolutionConfidence,
    promotionSource: issue.promotionSource,
    promotionCount: issue.promotionCount,
    lastValidatedAt: issue.lastValidatedAt,
    recommendedPrompt: issue.recommendedPrompt,
    assistantHint: issue.assistantHint,
    diagnosis: issue.diagnosis,
    evidence: issue.evidence,
  };
}

function hydrateIssue(rawIssue) {
  const guide = guideForIssueCode(rawIssue.code);
  const diagnosis = rawIssue.diagnosis ?? inferIssueIntelligence(rawIssue, guide);
  const learning = resolveLearningForIssue(activeLearningRuntime.store, rawIssue);
  const learningCases = Array.isArray(rawIssue.learningCases)
    ? rawIssue.learningCases.map((item, index) => normalizeLearningCase(item, index)).filter((item) => item.outcome || item.title)
    : Array.isArray(learning?.cases)
      ? learning.cases.map((item, index) => normalizeLearningCase(item, index)).filter((item) => item.outcome || item.title)
      : [];
  const learningCounts =
    rawIssue.learningCounts && typeof rawIssue.learningCounts === "object"
      ? {
          validated: Number(rawIssue.learningCounts.validated || 0),
          failed: Number(rawIssue.learningCounts.failed || 0),
          partial: Number(rawIssue.learningCounts.partial || 0),
        }
      : learning?.learningCounts && typeof learning.learningCounts === "object"
        ? {
            validated: Number(learning.learningCounts.validated || 0),
            failed: Number(learning.learningCounts.failed || 0),
            partial: Number(learning.learningCounts.partial || 0),
          }
        : summarizeLearningCases(learningCases);

  const issue = {
    id:
      rawIssue.id ??
      shortHash(`${rawIssue.code}|${rawIssue.route}|${rawIssue.action ?? ""}|${rawIssue.detail}`),
    code: rawIssue.code,
    severity: rawIssue.severity ?? severityFromCode(rawIssue.code),
    route: rawIssue.route ?? "/",
    action: rawIssue.action ?? "",
    viewportLabel: rawIssue.viewportLabel ?? "",
    viewport: rawIssue.viewport ?? "",
    detail: rawIssue.detail ?? "",
    url: rawIssue.url ?? "",
    timestamp: rawIssue.timestamp ?? nowIso(),
    diagnosis,
    technicalExplanation:
      rawIssue.technicalExplanation ?? diagnosis.technicalExplanation ?? guide.technical,
    laymanExplanation:
      rawIssue.laymanExplanation ?? diagnosis.laymanExplanation ?? guide.layman,
    recommendedResolution:
      rawIssue.recommendedResolution ?? diagnosis.recommendedResolution ?? guide.recommendation,
    possibleResolution:
      rawIssue.possibleResolution ?? learning?.possibleSolution ?? diagnosis.recommendedResolution ?? guide.recommendation,
    finalResolution: rawIssue.finalResolution ?? learning?.finalSolution ?? "",
    learningSource: rawIssue.learningSource ?? learning?.source ?? "",
    learningStatus:
      String(rawIssue.learningStatus || "") ||
      (learningCounts.validated > 0 ? "validated" : learningCounts.partial > 0 ? "partial" : learningCounts.failed > 0 ? "failed" : ""),
    learningCounts,
    learningCases,
    resolutionConfidence: String(rawIssue.resolutionConfidence || learning?.resolutionConfidence || ""),
    finalResolutionOrigin: String(rawIssue.finalResolutionOrigin || learning?.finalResolutionOrigin || ""),
    promotionSource: String(rawIssue.promotionSource || learning?.promotionSource || ""),
    promotionCount: Number(rawIssue.promotionCount ?? learning?.promotionCount ?? 0),
    lastValidatedAt: String(rawIssue.lastValidatedAt || learning?.lastValidatedAt || ""),
    manualOverrideCount: Number(rawIssue.manualOverrideCount ?? learning?.manualOverrideCount ?? 0),
    lastManualOverrideAt: String(rawIssue.lastManualOverrideAt || learning?.lastManualOverrideAt || ""),
    lastManualOverrideBy: String(rawIssue.lastManualOverrideBy || learning?.lastManualOverrideBy || ""),
    lastManualOverrideNote: String(rawIssue.lastManualOverrideNote || learning?.lastManualOverrideNote || ""),
    evidence: Array.isArray(rawIssue.evidence)
      ? rawIssue.evidence
          .map((item) => ({
            type: String(item?.type || "evidence"),
            path: String(item?.path || ""),
            label: String(item?.label || ""),
            route: String(item?.route || rawIssue.route || "/"),
            code: String(item?.code || rawIssue.code || ""),
            viewportLabel: String(item?.viewportLabel || rawIssue.viewportLabel || ""),
            viewport: String(item?.viewport || rawIssue.viewport || ""),
          }))
          .filter((item) => item.path)
      : [],
  };

  issue.assistantHint =
    rawIssue.assistantHint ??
    buildIssueActionHint(
      {
        code: issue.code,
        severity: issue.severity,
        route: issue.route,
        action: issue.action,
        detail: issue.detail,
        recommendedResolution: issue.recommendedResolution,
      },
      diagnosis,
    );
  issue.recommendedPrompt = rawIssue.recommendedPrompt ?? buildIssueFixPrompt(issue);

  return issue;
}

function mkIssue(input) {
  return hydrateIssue({
    code: input.code,
    severity: input.severity,
    route: input.route,
    action: input.action ?? "",
    viewportLabel: input.viewportLabel ?? "",
    viewport: input.viewport ?? "",
    detail: input.detail,
    url: input.url ?? "",
    evidence: input.evidence ?? [],
  });
}

function pushIssue(report, input) {
  const issue = mkIssue({
    ...input,
    viewportLabel: input.viewportLabel ?? report?.meta?.viewportLabel ?? "",
    viewport: input.viewport ?? report?.meta?.viewport ?? "",
  });
  report.issues.push(issue);
  report.issueLog.push(createIssueLogEntry(issue));
}

function severityFromCode(code) {
  if (
    code === CODE.ROUTE_LOAD_FAIL ||
    code === CODE.HTTP_5XX ||
    code === CODE.JS_RUNTIME_ERROR ||
    code === CODE.VISUAL_SECTION_ORDER_INVALID
  ) {
    return "high";
  }
  if (
    code === CODE.BTN_CLICK_ERROR ||
    code === CODE.NET_REQUEST_FAILED ||
    code === CODE.CONTENT_LANGUAGE_CONFLICT ||
    code === CODE.VISUAL_SECTION_MISSING ||
    code === CODE.VISUAL_LAYOUT_OVERFLOW ||
    code === CODE.VISUAL_LAYER_OVERLAP ||
    code === CODE.VISUAL_TIGHT_SPACING ||
    code === CODE.VISUAL_EDGE_HUGGING ||
    code === CODE.VISUAL_BOUNDARY_COLLISION ||
    code === CODE.VISUAL_CLUSTER_COLLISION
  ) {
    return "medium";
  }
  return "low";
}

function severityWeight(severity) {
  if (severity === "high") return 0;
  if (severity === "medium") return 1;
  return 2;
}

function playbookForCode(code) {
  return ISSUE_PLAYBOOK[code] ?? {
    priority: "P2",
    firstChecks: [
      "Reproduzir o problema com logs ativos.",
      "Identificar causa raiz no arquivo/fluxo principal.",
      "Aplicar fix minimo e validar com nova auditoria.",
    ],
    commandHints: [
      "rg -n \"TODO|FIXME|throw new Error|console.error\" src",
    ],
    likelyAreas: ["src/**"],
  };
}

function buildIssueActionHint(issue, diagnosis = null) {
  const playbook = playbookForCode(issue.code);
  const mergedChecks = uniqueNormalizedLines(
    [...(diagnosis?.technicalChecks ?? []), ...(playbook.firstChecks ?? [])],
    8,
  );
  const mergedCommands = uniqueNormalizedLines(
    [...(diagnosis?.commandHints ?? []), ...(playbook.commandHints ?? [])],
    8,
  );
  const mergedAreas = uniqueNormalizedLines(
    [...(diagnosis?.likelyAreas ?? []), ...(playbook.likelyAreas ?? [])],
    8,
  );

  return {
    priority: playbook.priority,
    firstChecks: mergedChecks,
    commandHints: mergedCommands,
    likelyAreas: mergedAreas,
  };
}

function buildAssistantGuide(report) {
  const sorted = [...report.issues].sort((a, b) => {
    const bySeverity = severityWeight(a.severity) - severityWeight(b.severity);
    if (bySeverity !== 0) return bySeverity;
    return a.code.localeCompare(b.code);
  });

  const byRoute = new Map();
  for (const issue of sorted) {
    const row = byRoute.get(issue.route) ?? { route: issue.route, totalIssues: 0, high: 0, medium: 0, low: 0 };
    row.totalIssues += 1;
    if (issue.severity === "high") row.high += 1;
    else if (issue.severity === "medium") row.medium += 1;
    else row.low += 1;
    byRoute.set(issue.route, row);
  }

  const routesByPriority = Array.from(byRoute.values()).sort((a, b) => {
    if (a.high !== b.high) return b.high - a.high;
    if (a.medium !== b.medium) return b.medium - a.medium;
    return b.totalIssues - a.totalIssues;
  });

  const immediateSteps =
    sorted.length === 0
      ? [
          "Sem issues: manter baseline e monitorar regressao.",
          `Rodar novamente com: ${report.meta.replayCommand}`,
          "Se houver mudanca grande de layout, atualizar sectionOrderRules.",
        ]
      : [
          "Corrigir primeiro erros high (runtime/5xx/ordem visual).",
          "Depois tratar medium (clicks falhos/rede/secoes ausentes).",
          "Finalizar com low e ruido de console.",
          "Atacar checklist SEO pendente antes da revalidacao final.",
          "Reexecutar auditoria completa e confirmar totalIssues=0.",
        ];

  const quickStartPrompt =
    sorted.length === 0
      ? [
          "Atue como engenheiro de software senior.",
          "Nao ha issues abertas nesta auditoria.",
          "Objetivo: prevenir regressao.",
          `Comando de revalidacao: ${report.meta.replayCommand}`,
          "Verifique mudancas recentes e rode a auditoria novamente apos qualquer ajuste estrutural.",
        ].join("\n")
      : [
          "Atue como engenheiro de software senior com foco em execucao rapida e causa raiz.",
          `Total de issues: ${sorted.length}.`,
          "Ordem de ataque: high -> medium -> low.",
          "Nao aceitar fix cosmetico: cada problema precisa de evidencia de resolucao.",
          "",
          "Top issues para iniciar:",
          ...sorted.slice(0, 8).map((issue, idx) => {
            const action = issue.action ? ` -> ${issue.action}` : "";
            return `${idx + 1}. [${issue.code}] (${issue.severity}) ${issue.route}${action} | ${issue.detail}`;
          }),
          "",
          "SEO (obrigatorio):",
          report?.seo?.fixPrompt
            ? report.seo.fixPrompt
            : "Revisar title/meta/H1/canonical/alt/schema/links internos e validar nova pontuacao SEO.",
          "",
          `Comando de revalidacao: ${report.meta.replayCommand}`,
        ].join("\n");

  return {
    status: sorted.length === 0 ? "clean" : "issues_found",
    issueCount: sorted.length,
    routePriority: routesByPriority.slice(0, 8),
    immediateSteps,
    replayCommand: report.meta.replayCommand,
    quickStartPrompt,
    topIssues: sorted.slice(0, 12).map((issue) => ({
      id: issue.id,
      code: issue.code,
      severity: issue.severity,
      route: issue.route,
      action: issue.action,
      detail: issue.detail,
      diagnosis: issue.diagnosis,
      recommendedResolution: issue.recommendedResolution,
      possibleResolution: issue.possibleResolution,
      finalResolution: issue.finalResolution,
      learningSource: issue.learningSource,
      learningStatus: issue.learningStatus,
      learningCounts: issue.learningCounts,
      learningCases: issue.learningCases,
      resolutionConfidence: issue.resolutionConfidence,
      promotionSource: issue.promotionSource,
      promotionCount: issue.promotionCount,
      lastValidatedAt: issue.lastValidatedAt,
      assistantHint: issue.assistantHint ?? buildIssueActionHint(issue, issue.diagnosis),
    })),
  };
}

function toAssistantBrief(report) {
  const guide = report.assistantGuide ?? buildAssistantGuide(report);
  const lines = [];
  lines.push("SITEPULSE ASSISTANT BRIEF");
  lines.push("========================");
  lines.push(`Projeto: ${report.meta.project}`);
  lines.push(`Base URL: ${report.meta.baseUrl}`);
  lines.push(`Status: ${guide.status}`);
  lines.push(`Total issues: ${guide.issueCount}`);
  lines.push("");
  lines.push("PASSOS IMEDIATOS");
  for (const step of guide.immediateSteps) {
    lines.push(`- ${step}`);
  }
  lines.push("");
  lines.push("ROTAS PRIORITARIAS");
  if (!guide.routePriority.length) {
    lines.push("- Nenhuma rota com issues.");
  } else {
    for (const row of guide.routePriority) {
      lines.push(`- ${row.route}: total=${row.totalIssues} high=${row.high} medium=${row.medium} low=${row.low}`);
    }
  }
  lines.push("");
  lines.push("TOP ISSUES");
  if (!guide.topIssues.length) {
    lines.push("- Nenhuma issue.");
  } else {
    for (const issue of guide.topIssues) {
      lines.push(`- [${issue.code}] (${issue.severity}) ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}`);
      lines.push(`  detalhe: ${issue.detail}`);
      if (issue.evidence?.length) {
        lines.push(`  evidencias: ${issue.evidence.map((item) => item.path).join(" | ")}`);
      }
      if (issue.diagnosis?.title) {
        lines.push(`  diagnostico: ${issue.diagnosis.title} [${issue.diagnosis.subtype}]`);
      }
      lines.push(`  resolucao: ${issue.recommendedResolution}`);
      if (issue.possibleResolution) {
        lines.push(`  solucao_possivel: ${issue.possibleResolution}`);
      }
      if (issue.finalResolution) {
        lines.push(`  solucao_final: ${issue.finalResolution}`);
      }
      if (issue.learningSource) {
        lines.push(`  fonte_aprendizado: ${issue.learningSource}`);
      }
      if (issue.learningStatus) {
        lines.push(
          `  memoria: ${issue.learningStatus} | ok=${issue.learningCounts?.validated ?? 0} falhou=${issue.learningCounts?.failed ?? 0} parcial=${issue.learningCounts?.partial ?? 0}`,
        );
      }
      if (issue.resolutionConfidence) {
        lines.push(`  confianca_resolucao: ${issue.resolutionConfidence}`);
      }
      if (issue.promotionSource) {
        lines.push(`  origem_promocao: ${issue.promotionSource} (${issue.promotionCount ?? 0}x)`);
      }
      if (issue.lastValidatedAt) {
        lines.push(`  ultima_validacao: ${issue.lastValidatedAt}`);
      }
      if (Array.isArray(issue.learningCases) && issue.learningCases.length) {
        for (const caseItem of issue.learningCases.slice(0, 2)) {
          lines.push(
            `  caso_${caseItem.outcome || "known"}: ${caseItem.title} | tentativa: ${caseItem.attempt || "n/a"} | resultado: ${caseItem.result || "n/a"}`,
          );
        }
      }
      lines.push(`  prioridade: ${issue.assistantHint.priority}`);
      lines.push(`  checks: ${issue.assistantHint.firstChecks.join(" | ")}`);
      lines.push(`  comandos: ${issue.assistantHint.commandHints.join(" || ")}`);
    }
  }
  lines.push("");
  lines.push("PROMPT RAPIDO");
  lines.push("-------------");
  lines.push(guide.quickStartPrompt);
  lines.push("");
  lines.push("REVALIDACAO");
  lines.push(`- ${guide.replayCommand}`);
  return lines.join("\n");
}

function buildPromptPack(issues) {
  const byCode = new Map();
  for (const issue of issues) {
    const list = byCode.get(issue.code) ?? [];
    list.push(issue);
    byCode.set(issue.code, list);
  }

  const prompts = [];

  if (byCode.has(CODE.BTN_NO_EFFECT)) {
    const rows = byCode
      .get(CODE.BTN_NO_EFFECT)
      .slice(0, 20)
      .map((i) => `- ${i.route} -> "${i.action}"`)
      .join("\n");
    prompts.push(
      [
        "Corrija todos os botoes sem efeito observavel.",
        "Cada clique deve gerar mudanca de estado visual, navegacao, request ou mensagem de status.",
        "Itens detectados:",
        rows,
      ].join("\n"),
    );
  }

  if (byCode.has(CODE.HTTP_5XX) || byCode.has(CODE.HTTP_4XX)) {
    const rows = [...(byCode.get(CODE.HTTP_5XX) ?? []), ...(byCode.get(CODE.HTTP_4XX) ?? [])]
      .slice(0, 20)
      .map((i) => `- ${i.route} -> ${i.detail}`)
      .join("\n");
    prompts.push(
      [
        "Corrija as rotas/API com erro HTTP durante interacoes de UI.",
        "Mantenha fluxo idempotente, mensagens de erro claras e status consistente na tela.",
        "Ocorrencias:",
        rows,
      ].join("\n"),
    );
  }

  if (byCode.has(CODE.JS_RUNTIME_ERROR) || byCode.has(CODE.CONSOLE_ERROR) || byCode.has(CODE.NET_REQUEST_FAILED)) {
    const rows = [...(byCode.get(CODE.JS_RUNTIME_ERROR) ?? []), ...(byCode.get(CODE.CONSOLE_ERROR) ?? []), ...(byCode.get(CODE.NET_REQUEST_FAILED) ?? [])]
      .slice(0, 20)
      .map((i) => `- ${i.route} -> ${i.code}: ${i.detail}`)
      .join("\n");
    prompts.push(
      [
        "Resolva erros de runtime/rede do frontend.",
        "Garanta try/catch, fallback de estado e tratamento de respostas invalidas.",
        "Ocorrencias:",
        rows,
      ].join("\n"),
    );
  }

  if (byCode.has(CODE.VISUAL_SECTION_ORDER_INVALID) || byCode.has(CODE.VISUAL_SECTION_MISSING)) {
    const rows = [...(byCode.get(CODE.VISUAL_SECTION_ORDER_INVALID) ?? []), ...(byCode.get(CODE.VISUAL_SECTION_MISSING) ?? [])]
      .slice(0, 20)
      .map((i) => `- ${i.route} -> ${i.detail}`)
      .join("\n");
    prompts.push(
      [
        "Corrija inconsistencias visuais/funcionais na ordem das secoes.",
        "Regra critica: conteudo informativo/FAQ nao pode aparecer abaixo do footer.",
        "Ocorrencias:",
        rows,
      ].join("\n"),
    );
  }

  if (
    byCode.has(CODE.VISUAL_LAYOUT_OVERFLOW) ||
    byCode.has(CODE.VISUAL_LAYER_OVERLAP) ||
    byCode.has(CODE.VISUAL_ALIGNMENT_DRIFT) ||
    byCode.has(CODE.VISUAL_TIGHT_SPACING) ||
    byCode.has(CODE.VISUAL_GAP_INCONSISTENCY) ||
    byCode.has(CODE.VISUAL_EDGE_HUGGING) ||
    byCode.has(CODE.VISUAL_WIDTH_INCONSISTENCY) ||
    byCode.has(CODE.VISUAL_BOUNDARY_COLLISION) ||
    byCode.has(CODE.VISUAL_FOLD_PRESSURE) ||
    byCode.has(CODE.VISUAL_HIERARCHY_COLLAPSE) ||
    byCode.has(CODE.VISUAL_CLUSTER_COLLISION)
  ) {
    const rows = [
      ...(byCode.get(CODE.VISUAL_LAYOUT_OVERFLOW) ?? []),
      ...(byCode.get(CODE.VISUAL_LAYER_OVERLAP) ?? []),
      ...(byCode.get(CODE.VISUAL_ALIGNMENT_DRIFT) ?? []),
      ...(byCode.get(CODE.VISUAL_TIGHT_SPACING) ?? []),
      ...(byCode.get(CODE.VISUAL_GAP_INCONSISTENCY) ?? []),
      ...(byCode.get(CODE.VISUAL_EDGE_HUGGING) ?? []),
      ...(byCode.get(CODE.VISUAL_WIDTH_INCONSISTENCY) ?? []),
      ...(byCode.get(CODE.VISUAL_BOUNDARY_COLLISION) ?? []),
      ...(byCode.get(CODE.VISUAL_FOLD_PRESSURE) ?? []),
      ...(byCode.get(CODE.VISUAL_HIERARCHY_COLLAPSE) ?? []),
      ...(byCode.get(CODE.VISUAL_CLUSTER_COLLISION) ?? []),
    ]
      .slice(0, 20)
      .map((i) => `- ${i.route} -> ${i.code}: ${i.detail}`)
      .join("\n");
    prompts.push(
      [
        "Corrija as inconsistencias de composicao visual da interface.",
        "O objetivo e padronizar respiro, alinhamento, camadas e ritmo visual entre blocos importantes.",
        "Ocorrencias:",
        rows,
      ].join("\n"),
    );
  }

  const intelligenceRows = issues
    .filter((issue) => issue.diagnosis?.title)
    .slice(0, 30)
    .map((issue) => {
      const action = issue.action ? ` -> ${issue.action}` : "";
      const subtype = issue.diagnosis?.subtype ?? "generic";
      return `- ${issue.route}${action} | ${issue.diagnosis.title} [${subtype}] | ${issue.detail}`;
    });
  if (intelligenceRows.length) {
    prompts.push(
      [
        "Use a classificacao inteligente para atacar causa raiz de fetch/network/http/runtime.",
        "Para cada item: confirmar causa, aplicar fix robusto e validar com replay da auditoria.",
        "Diagnosticos capturados:",
        intelligenceRows.join("\n"),
      ].join("\n"),
    );
  }

  const masterPrompt = [
    "Atue como engenheiro de software senior e corrija todas as issues listadas abaixo com foco em causa raiz.",
    "Nao aplique correcoes cosmeticas. Garanta comportamento funcional correto em desktop e mobile.",
    "Exigencias minimas: sem botao sem efeito, sem callback solto, sem erro fetch sem feedback, sem 4xx/5xx inesperado no fluxo principal e sem ordem de secoes quebrada.",
    "Workflow obrigatorio: reproduzir, identificar causa raiz, corrigir com menor impacto, validar novamente via auditor.",
    "Entregue ao final: codigo corrigido, resumo da causa raiz por categoria e evidencias de revalidacao.",
    ...prompts,
  ].join("\n\n");

  const issuePrompts = issues.map((issue) => ({
    id: issue.id,
    code: issue.code,
    severity: issue.severity,
    route: issue.route,
    action: issue.action,
    prompt: issue.recommendedPrompt ?? buildIssueFixPrompt(issue),
  }));

  return { masterPrompt, prompts, issuePrompts };
}

function laymanSummaryByCode(issues) {
  const grouped = new Map();
  for (const issue of issues) {
    if (!grouped.has(issue.code)) {
      grouped.set(issue.code, { count: 0, layman: issue.laymanExplanation, resolution: issue.recommendedResolution });
    }
    grouped.get(issue.code).count += 1;
  }
  return Array.from(grouped.entries()).map(([code, info]) => ({ code, ...info }));
}

function intelligenceSummaryBySubtype(issues) {
  const grouped = new Map();
  for (const issue of issues) {
    const title = issue.diagnosis?.title ?? issue.code;
    const subtype = issue.diagnosis?.subtype ?? "generic";
    const key = `${subtype}|${title}`;
    const prev = grouped.get(key) ?? { subtype, title, count: 0 };
    prev.count += 1;
    grouped.set(key, prev);
  }
  return Array.from(grouped.values()).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}

function toMarkdown(report) {
  const lines = [];
  lines.push("# SitePulse QA Report");
  lines.push("");
  lines.push(`- Projeto: ${report.meta.project}`);
  lines.push(`- Inicio: ${report.meta.startedAt}`);
  lines.push(`- Fim: ${report.meta.finishedAt}`);
  lines.push(`- Base URL: ${report.meta.baseUrl}`);
  lines.push(`- Viewport: ${report.meta.viewport ?? "n/a"}`);
  lines.push(`- Execucao pausada: ${report.meta.paused ? "sim" : "nao"}`);
  lines.push(`- Retomado de checkpoint: ${report.meta.resumedFromCheckpoint ? "sim" : "nao"}`);
  lines.push("");
  lines.push("## Resumo");
  lines.push("");
  lines.push(`- Rotas verificadas: ${report.summary.routesChecked}`);
  lines.push(`- Falhas de carga de rota: ${report.summary.routeLoadFailures}`);
  lines.push(`- Botoes verificados: ${report.summary.buttonsChecked}`);
  lines.push(`- Acoes mapeadas (detalhadas): ${report.summary.actionsMapped ?? 0}`);
  lines.push(`- Acoes com efeito: ${report.summary.actionsWithEffect ?? 0}`);
  lines.push(`- Acoes sem efeito detectado: ${report.summary.actionsNoEffectDetected ?? 0}`);
  lines.push(`- Acoes com erro de clique: ${report.summary.actionsFailed ?? 0}`);
  lines.push(`- Acoes em modo analise (sem clique): ${report.summary.actionsAnalysisOnly ?? 0}`);
  lines.push(`- Botoes sem efeito: ${report.summary.buttonsNoEffect}`);
  lines.push(`- Erros HTTP 4xx: ${report.summary.http4xx}`);
  lines.push(`- Erros HTTP 5xx: ${report.summary.http5xx}`);
  lines.push(`- Erros de rede: ${report.summary.netRequestFailed}`);
  lines.push(`- Erros JS runtime: ${report.summary.jsRuntimeErrors}`);
  lines.push(`- Console errors: ${report.summary.consoleErrors}`);
  lines.push(`- Ordem visual invalida: ${report.summary.visualSectionOrderInvalid}`);
  lines.push(`- Secao obrigatoria ausente/invisivel: ${report.summary.visualSectionMissing}`);
  lines.push(`- SEO score: ${report.summary.seoScore ?? 0}/100`);
  lines.push(`- SEO paginas analisadas: ${report.summary.seoPagesAnalyzed ?? 0}`);
  lines.push(`- SEO issues criticas: ${report.summary.seoCriticalIssues ?? 0}`);
  lines.push(`- SEO issues totais: ${report.summary.seoTotalIssues ?? 0}`);
  lines.push(`- Total issues: ${report.summary.totalIssues}`);

  lines.push("");
  lines.push("## Guia Rapido Para Assistente");
  lines.push("");
  lines.push(`- Status: ${report.assistantGuide?.status ?? "n/a"}`);
  lines.push(`- Replay command: ${report.assistantGuide?.replayCommand ?? report.meta.replayCommand ?? "n/a"}`);
  if (report.assistantGuide?.immediateSteps?.length) {
    for (const step of report.assistantGuide.immediateSteps) {
      lines.push(`- Passo: ${step}`);
    }
  }
  if (report.assistantGuide?.routePriority?.length) {
    lines.push("- Rotas prioritarias:");
    for (const row of report.assistantGuide.routePriority) {
      lines.push(`  - ${row.route}: total=${row.totalIssues} high=${row.high} medium=${row.medium} low=${row.low}`);
    }
  }

  lines.push("");
  lines.push("## Explicacao Para Leigos");
  lines.push("");
  const laymanSummary = laymanSummaryByCode(report.issues);
  if (!laymanSummary.length) {
    lines.push("- Nenhum problema detectado nesta rodada.");
  } else {
    for (const row of laymanSummary) {
      lines.push(`- [${row.code}] ${row.count} ocorrencia(s)`);
      lines.push(`  - O que isso significa: ${row.layman}`);
      lines.push(`  - O que fazer: ${row.resolution}`);
    }
  }
  lines.push("");
  lines.push("## Inteligencia De Erros");
  lines.push("");
  const intelligenceSummary = intelligenceSummaryBySubtype(report.issues);
  if (!intelligenceSummary.length) {
    lines.push("- Sem classificacoes adicionais nesta rodada.");
  } else {
    for (const row of intelligenceSummary.slice(0, 20)) {
      lines.push(`- [${row.subtype}] ${row.title} -> ${row.count} ocorrencia(s)`);
    }
  }
  lines.push("");
  lines.push("## Progresso");
  lines.push("");
  lines.push(`- Proxima rota indice: ${report.progress.nextRouteIndex}`);
  lines.push(`- Proximo botao indice: ${report.progress.nextLabelIndex}`);
  lines.push(`- Segmentos executados: ${report.progress.segments}`);

  lines.push("");
  lines.push("## Mapa De Acoes (Botoes/Menu/Links)");
  lines.push("");
  if (!Array.isArray(report.actionSweep) || report.actionSweep.length === 0) {
    lines.push("- Nenhuma acao mapeada nesta rodada.");
  } else {
    const maxActionsToPrint = 300;
    const actionsToPrint = report.actionSweep.slice(0, maxActionsToPrint);
    for (const action of actionsToPrint) {
      lines.push(
        `- [${action.status}] ${action.route} -> ${action.label} (${action.kind})`,
      );
      lines.push(`  - Funcao esperada: ${action.expectedFunction}`);
      lines.push(`  - Explicacao para leigo: ${action.expectedForUser}`);
      lines.push(`  - Funcao executada: ${action.actualFunction}`);
      if (action.detail) {
        lines.push(`  - Detalhe: ${action.detail}`);
      }
      if (action.href) {
        lines.push(`  - Destino/href: ${action.href}`);
      }
    }
    if (report.actionSweep.length > maxActionsToPrint) {
      lines.push(
        `- ... ${report.actionSweep.length - maxActionsToPrint} acoes adicionais omitidas no markdown (presentes no JSON).`,
      );
    }
  }

  lines.push("");
  lines.push("## Analise SEO");
  lines.push("");
  lines.push(`- SEO score geral: ${report.seo?.overallScore ?? 0}/100`);
  lines.push(`- Paginas analisadas: ${report.seo?.pagesAnalyzed ?? 0}`);
  lines.push(
    `- Score por categoria: tecnico=${report.seo?.categoryScore?.technical ?? 0}, conteudo=${report.seo?.categoryScore?.content ?? 0}, acessibilidade=${report.seo?.categoryScore?.accessibility ?? 0}`,
  );
  if (Array.isArray(report?.seo?.issues) && report.seo.issues.length > 0) {
    lines.push("- Principais pontos SEO:");
    for (const issue of report.seo.issues.slice(0, 20)) {
      lines.push(
        `  - [${issue.severity}] ${issue.code} (${issue.count}x): ${issue.detail} | recomendacao: ${issue.recommendation}`,
      );
    }
  } else {
    lines.push("- Sem issues SEO relevantes nesta rodada.");
  }
  if (Array.isArray(report?.seo?.checklist) && report.seo.checklist.length > 0) {
    lines.push("- Checklist SEO base:");
    for (const row of report.seo.checklist) {
      lines.push(`  - [${row.status}] ${row.label} | ${row.why}`);
    }
  }
  if (normalizeText(report?.seo?.fixPrompt)) {
    lines.push("- Prompt recomendado para corrigir SEO:");
    lines.push("```");
    lines.push(report.seo.fixPrompt);
    lines.push("```");
  }

  lines.push("");
  lines.push("## Issues");
  lines.push("");

  if (report.issues.length === 0) {
    lines.push("Sem issues detectadas.");
  } else {
    for (const issue of report.issues) {
      const issuePrompt = issue.recommendedPrompt ?? buildIssueFixPrompt(issue);
      lines.push(`- [${issue.code}] (${issue.severity}) ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}: ${issue.detail}`);
      if (issue.evidence?.length) {
        lines.push(`  - Evidencias: ${issue.evidence.map((item) => item.path).join(" | ")}`);
      }
      if (issue.diagnosis?.title) {
        lines.push(`  - Classificacao: ${issue.diagnosis.title} [${issue.diagnosis.subtype}]`);
      }
      lines.push(`  - Tecnico: ${issue.technicalExplanation}`);
      lines.push(`  - Leigo: ${issue.laymanExplanation}`);
      lines.push(`  - Resolucao recomendada: ${issue.recommendedResolution}`);
      if (issue.diagnosis?.probableCauses?.length) {
        lines.push(`  - Causas provaveis: ${issue.diagnosis.probableCauses.join(" | ")}`);
      }
      if (issue.diagnosis?.recommendedActions?.length) {
        lines.push(`  - Acoes recomendadas: ${issue.diagnosis.recommendedActions.join(" | ")}`);
      }
      lines.push(`  - Prioridade de ataque: ${issue.assistantHint?.priority ?? "P2"}`);
      if (issue.assistantHint?.firstChecks?.length) {
        lines.push(`  - Checks iniciais: ${issue.assistantHint.firstChecks.join(" | ")}`);
      }
      if (issue.assistantHint?.commandHints?.length) {
        lines.push(`  - Comandos sugeridos: ${issue.assistantHint.commandHints.join(" || ")}`);
      }
      lines.push(`  - Prompt de correcao: ${issuePrompt}`);
    }
  }

  lines.push("");
  lines.push("## Prompts De Correcao Por Issue");
  lines.push("");
  if (report.issues.length === 0) {
    lines.push("Sem prompts especificos porque nao houve issue.");
  } else {
    for (const issue of report.issues) {
      const issuePrompt = issue.recommendedPrompt ?? buildIssueFixPrompt(issue);
      lines.push(`### ${issue.id} | ${issue.code}`);
      lines.push("");
      lines.push("```text");
      lines.push(issuePrompt);
      lines.push("```");
      lines.push("");
    }
  }

  lines.push("");
  lines.push("## Prompt Master");
  lines.push("");
  lines.push("```text");
  lines.push(report.promptPack.masterPrompt);
  lines.push("```");

  lines.push("");
  lines.push("## Prompt Rapido Do Assistente");
  lines.push("");
  lines.push("```text");
  lines.push(report.assistantGuide?.quickStartPrompt ?? "(indisponivel)");
  lines.push("```");

  return lines.join("\n");
}

function toIssueLog(report) {
  if (!report.issueLog.length) {
    return "[SitePulse-QA] Sem issues detectadas nesta execucao.";
  }

  return report.issueLog
    .map((entry) =>
      [
        `[${entry.timestamp}] [${entry.severity}] [${entry.code}] ${entry.route}${entry.action ? ` -> ${entry.action}` : ""}`,
        `detalhe: ${entry.detail}`,
        `diagnostico_titulo: ${entry.diagnosis?.title ?? "n/a"}`,
        `diagnostico_subtipo: ${entry.diagnosis?.subtype ?? "generic"}`,
        `diagnostico_confianca: ${entry.diagnosis?.confidence ?? "low"}`,
        `diagnostico_http_status: ${entry.diagnosis?.httpStatus ?? "n/a"}`,
        `diagnostico_request: ${entry.diagnosis?.method ?? ""} ${entry.diagnosis?.requestPath ?? entry.diagnosis?.requestUrl ?? ""}`.trim(),
        `diagnostico_causas: ${(entry.diagnosis?.probableCauses ?? []).join(" | ")}`,
        `diagnostico_acoes: ${(entry.diagnosis?.recommendedActions ?? []).join(" | ")}`,
        `leigo: ${entry.laymanExplanation}`,
        `resolucao_recomendada: ${entry.recommendedResolution}`,
        `solucao_possivel: ${entry.possibleResolution ?? ""}`,
        `solucao_final: ${entry.finalResolution ?? ""}`,
        `fonte_aprendizado: ${entry.learningSource ?? ""}`,
        `memoria_status: ${entry.learningStatus ?? ""}`,
        `memoria_contagens: ok=${entry.learningCounts?.validated ?? 0} falhou=${entry.learningCounts?.failed ?? 0} parcial=${entry.learningCounts?.partial ?? 0}`,
        `confianca_resolucao: ${entry.resolutionConfidence ?? ""}`,
        `origem_promocao: ${entry.promotionSource ?? ""}`,
        `contador_promocao: ${entry.promotionCount ?? 0}`,
        `ultima_validacao: ${entry.lastValidatedAt ?? ""}`,
        `memoria_casos: ${(entry.learningCases ?? [])
          .slice(0, 2)
          .map((item) => `[${item.outcome || "known"}] ${item.title}: ${item.result || item.attempt || "n/a"}`)
          .join(" | ")}`,
        `prioridade_assistente: ${entry.assistantHint?.priority ?? "P2"}`,
        `checks_assistente: ${(entry.assistantHint?.firstChecks ?? []).join(" | ")}`,
        `comandos_assistente: ${(entry.assistantHint?.commandHints ?? []).join(" || ")}`,
        "prompt_correcao:",
        entry.recommendedPrompt ?? "(prompt indisponivel)",
      ].join("\n"),
    )
    .join("\n\n");
}

function routeMatchesRule(route, rule) {
  if (!rule.routes.length) return true;
  return rule.routes.some((pattern) => {
    if (pattern === "*") return true;
    if (pattern.endsWith("*")) return route.startsWith(pattern.slice(0, -1));
    return route === pattern;
  });
}

function formatSectionMissingDetail(finding) {
  const before = finding.before;
  const after = finding.after;
  return [
    `Regra ${finding.id} (${finding.description || "sem descricao"}) incompleta.`,
    `beforeSelector=${finding.beforeSelector} exists=${before.exists} visible=${before.visible}`,
    `afterSelector=${finding.afterSelector} exists=${after.exists} visible=${after.visible}`,
  ].join(" | ");
}

function formatSectionOrderDetail(finding) {
  return [
    `Regra ${finding.id} (${finding.description || "sem descricao"}) violada.`,
    `${finding.beforeSelector} top=${finding.before.top} precisa vir antes de ${finding.afterSelector} top=${finding.after.top}.`,
  ].join(" | ");
}

async function captureSectionRuleEvidence(page, finding, reportDir, route, code) {
  if (!reportDir || !finding) return [];
  const clipPayload = await page.evaluate((payload) => {
    const getRect = (selector) => {
      if (!selector) return null;
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return {
        x: Math.max(0, rect.left + window.scrollX),
        y: Math.max(0, rect.top + window.scrollY),
        right: rect.right + window.scrollX,
        bottom: rect.bottom + window.scrollY,
      };
    };

    const before = getRect(payload.beforeSelector);
    const after = getRect(payload.afterSelector);
    const boxes = [before, after].filter(Boolean);
    if (!boxes.length) return null;
    const left = Math.min(...boxes.map((item) => item.x));
    const top = Math.min(...boxes.map((item) => item.y));
    const right = Math.max(...boxes.map((item) => item.right));
    const bottom = Math.max(...boxes.map((item) => item.bottom));
    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
      highlights: boxes.map((item, index) => ({
        x: item.x,
        y: item.y,
        width: Math.max(1, item.right - item.x),
        height: Math.max(1, item.bottom - item.y),
        label: index === 0 ? "before" : "after",
      })),
    };
  }, {
    beforeSelector: finding.beforeSelector,
    afterSelector: finding.afterSelector,
  }).catch(() => null);

  const metrics = await page.evaluate(() => ({
    width: Math.max(document.documentElement?.scrollWidth || 0, document.body?.scrollWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement?.scrollHeight || 0, document.body?.scrollHeight || 0, window.innerHeight || 0),
  })).catch(() => ({ width: 0, height: 0 }));
  const contextClip = expandClipBox(clipPayload, metrics, {
    padding: 180,
    minWidth: 820,
    minHeight: 460,
  });
  if (!contextClip) return [];

  const evidenceDir = path.join(reportDir, "visual-evidence");
  await fs.mkdir(evidenceDir, { recursive: true });
  const routeToken = sanitizeFileToken(route === "/" ? "home" : route.replaceAll("/", "-"), "route");
  const baseToken = `${nowStamp()}-${routeToken}-${sanitizeFileToken(code, "visual")}-${sanitizeFileToken(finding.id || "rule", "rule")}`;
  const outputPath = path.join(evidenceDir, `${baseToken}-context.png`);
  try {
    const highlights = Array.isArray(clipPayload?.highlights)
      ? buildEvidenceHighlightsFromSamples(clipPayload.highlights.map((item) => ({ clip: item, selector: item.label })), metrics)
      : [];
    await withEvidenceOverlay(page, highlights, async () => {
      await page.screenshot({
        path: outputPath,
        clip: contextClip,
        animations: "disabled",
      });
    });
    const captured = [{
      type: "screenshot",
      path: outputPath,
      label: `${finding.id || finding.description || "section rule"} context`,
      route,
      code,
      variant: "context",
      note: "Expanded capture with highlighted order/missing-section context.",
    }];
    if (cfg?.visualAnalyzer?.evidenceFullPage !== false) {
      const fullPagePath = path.join(evidenceDir, `${baseToken}-fullpage.png`);
      try {
        await withEvidenceOverlay(page, highlights, async () => {
          await page.screenshot({
            path: fullPagePath,
            fullPage: true,
            animations: "disabled",
          });
        });
        captured.push({
          type: "screenshot",
          path: fullPagePath,
          label: `${finding.id || finding.description || "section rule"} full page`,
          route,
          code,
          variant: "fullpage",
          note: "Full-page capture with the affected rule area highlighted.",
        });
      } catch {
        // keep the issue even if the screenshot failed
      }
    }
    return captured;
  } catch {
    return [];
  }
}

const GENERIC_SELECTOR_TOKENS = new Set([
  "app",
  "area",
  "block",
  "body",
  "card",
  "col",
  "column",
  "container",
  "content",
  "grid",
  "inner",
  "item",
  "layout",
  "main",
  "module",
  "outer",
  "panel",
  "row",
  "section",
  "shell",
  "stack",
  "wrapper",
]);

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSelectorToken(token) {
  return String(token || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSelectorMeta(selector) {
  const raw = String(selector || "").trim();
  const tagMatch = raw.match(/^[a-z0-9-]+/i);
  const idMatch = raw.match(/#([a-z0-9_-]+)/i);
  const dataMatch = raw.match(/\[data=([^\]]+)\]/i);
  const classMatches = [...raw.matchAll(/\.([a-z0-9_-]+)/gi)]
    .map((match) => String(match[1] || "").trim())
    .filter(Boolean);
  return {
    raw,
    tag: tagMatch ? String(tagMatch[0]).toLowerCase() : "div",
    id: idMatch ? String(idMatch[1]) : "",
    data: dataMatch ? String(dataMatch[1]) : "",
    classes: classMatches,
  };
}

function resolveSelectorTypeLabel(tag) {
  if (tag === "header") return "cabecalho";
  if (tag === "nav") return "navegacao";
  if (tag === "main") return "conteudo principal";
  if (tag === "footer") return "rodape";
  if (tag === "section") return "secao";
  if (tag === "article") return "bloco";
  if (tag === "aside") return "sidebar";
  if (tag === "form") return "formulario";
  if (tag === "button") return "botao";
  if (tag === "ul" || tag === "ol") return "lista";
  return "bloco";
}

function resolveSelectorReadableToken(meta) {
  if (meta.id) return normalizeSelectorToken(meta.id);
  if (meta.data) return normalizeSelectorToken(meta.data);

  const meaningfulClass = meta.classes.find((token) => {
    const normalized = normalizeSelectorToken(token).toLowerCase();
    if (!normalized) return false;
    if (GENERIC_SELECTOR_TOKENS.has(normalized)) return false;
    return normalized.length >= 3;
  });
  if (meaningfulClass) return normalizeSelectorToken(meaningfulClass);
  return "";
}

function formatSelectorHumanLabel(selector) {
  const meta = parseSelectorMeta(selector);
  const typeLabel = resolveSelectorTypeLabel(meta.tag);
  const readableToken = resolveSelectorReadableToken(meta);
  if (!readableToken) {
    return `${typeLabel} (${meta.raw || "sem identificador"})`;
  }
  return `${typeLabel} "${readableToken}"`;
}

function describeVisualRegion(clip, viewportHeight) {
  const y = toFiniteNumber(clip?.y, -1);
  const viewport = Math.max(1, toFiniteNumber(viewportHeight, 0));
  if (y < 0 || viewport <= 0) return "posicao nao mapeada";
  if (y < viewport * 0.8) return "topo da pagina";
  if (y < viewport * 1.8) return "miolo da pagina";
  return "parte baixa da pagina";
}

function ratioToPercent(value) {
  const numeric = toFiniteNumber(value, NaN);
  if (!Number.isFinite(numeric)) return null;
  const ratio = numeric <= 1.5 ? numeric * 100 : numeric;
  return Math.max(0, Math.round(ratio));
}

function formatVerticalTransitionSample(sample, finding, options = {}) {
  const source = formatSelectorHumanLabel(sample?.a);
  const target = formatSelectorHumanLabel(sample?.b);
  const gap = Math.max(0, Math.round(toFiniteNumber(sample?.gap, 0)));
  const region = describeVisualRegion(sample?.clip, finding?.viewportHeight);
  const shared = ratioToPercent(sample?.sharedRatio);
  const sharedText = shared === null ? "n/a" : `${shared}%`;
  const indexLabel = Number.isFinite(options.index) ? `${options.index}. ` : "";

  if (options.collision === true) {
    return `${indexLabel}A borda inferior de ${source} encostou na borda superior de ${target} (distancia=${gap}px, largura compartilhada=${sharedText}, regiao=${region}).`;
  }

  return `${indexLabel}${source} ficou muito perto de ${target} (distancia=${gap}px, largura compartilhada=${sharedText}, regiao=${region}).`;
}

function formatVisualAnalyzerDetail(finding) {
  if (finding.code === CODE.VISUAL_LAYOUT_OVERFLOW) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item) => `${item.selector} (${item.side}, delta=${item.delta}px, rect=${item.left}-${item.right})`)
      .join(" ; ");
    return [
      `Detectado overflow visual em ${finding.count || samples.length} bloco(s).`,
      sampleText || "Nenhum exemplo detalhado disponivel.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_LAYER_OVERLAP) {
    const pairs = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const pairText = pairs
      .map((item) => `${item.a} x ${item.b} (area=${item.area}px, ratio=${item.ratio})`)
      .join(" ; ");
    return [
      `Detectada sobreposicao visual relevante em ${finding.count || pairs.length} par(es) de blocos.`,
      pairText || "Nenhum par detalhado disponivel.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_ALIGNMENT_DRIFT) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item) => `${item.selector} (left=${item.left}px, drift=${item.drift}px)`)
      .join(" ; ");
    return [
      `Detectado drift de alinhamento em ${finding.count || samples.length} bloco(s) principais.`,
      `Baseline left=${finding.baselineLeft}px.`,
      sampleText || "Nenhum bloco detalhado disponivel.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_TIGHT_SPACING) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item, index) => formatVerticalTransitionSample(item, finding, { index: index + 1, collision: false }))
      .join(" ; ");
    const viewportWidth = Math.max(0, Math.round(toFiniteNumber(finding.viewportWidth, 0)));
    const viewportHeight = Math.max(0, Math.round(toFiniteNumber(finding.viewportHeight, 0)));
    return [
      `Espacamento apertado em ${finding.count || samples.length} transicao(oes) na rota ${finding.route || "n/a"} (viewport ${viewportWidth}x${viewportHeight}).`,
      sampleText || "Nenhum exemplo detalhado disponivel.",
      "Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_GAP_INCONSISTENCY) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item) => `${item.a} -> ${item.b} (gap=${item.gap}px, baseline=${item.baselineGap}px, drift=${item.drift}px, ${item.trend})`)
      .join(" ; ");
    return [
      `Detectada inconsistencia de espacamento em ${finding.count || samples.length} transicao(oes) visuais.`,
      sampleText || "Nenhum exemplo detalhado disponivel.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_EDGE_HUGGING) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item) => `${item.selector} (${item.side} gap=${item.gap}px, opposite=${item.oppositeGap}px, asymmetry=${item.asymmetry}px)`)
      .join(" ; ");
    return [
      `Detectado encostamento lateral em ${finding.count || samples.length} bloco(s) estruturais.`,
      sampleText || "Nenhum exemplo detalhado disponivel.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_WIDTH_INCONSISTENCY) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item) => `${item.selector} (width=${item.width}px, baseline=${item.baselineWidth}px, drift=${item.drift}px, ${item.trend})`)
      .join(" ; ");
    return [
      `Detectada largura inconsistente em ${finding.count || samples.length} bloco(s) principais.`,
      sampleText || "Nenhum exemplo detalhado disponivel.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_BOUNDARY_COLLISION) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item, index) => formatVerticalTransitionSample(item, finding, { index: index + 1, collision: true }))
      .join(" ; ");
    const viewportWidth = Math.max(0, Math.round(toFiniteNumber(finding.viewportWidth, 0)));
    const viewportHeight = Math.max(0, Math.round(toFiniteNumber(finding.viewportHeight, 0)));
    return [
      `Colisao de borda em ${finding.count || samples.length} transicao(oes) na rota ${finding.route || "n/a"} (viewport ${viewportWidth}x${viewportHeight}).`,
      sampleText || "Nenhum exemplo detalhado disponivel.",
      "Leitura humana: um bloco termina e o proximo comeca colado, parecendo quebra de layout no mobile.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_FOLD_PRESSURE) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 2) : [];
    const sampleText = samples
      .map((item) => `${item.blockCount} blocos na primeira dobra (avg gap=${item.averageGap}px, span=${item.stackSpan}px, density=${item.densityRatio}x viewport)`)
      .join(" ; ");
    return [
      `Detectada pressao visual na primeira dobra em ${finding.count || samples.length} agrupamento(s).`,
      sampleText || "Nenhum agrupamento detalhado disponivel.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_HIERARCHY_COLLAPSE) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item) => `${item.selector} (heading=${item.headingSize}px, body=${item.bodySize}px, ratio=${item.ratio}x, gap=${item.gap}px)`)
      .join(" ; ");
    return [
      `Detectado colapso de hierarquia visual em ${finding.count || samples.length} bloco(s).`,
      sampleText || "Nenhum bloco detalhado disponivel.",
    ].join(" | ");
  }

  if (finding.code === CODE.VISUAL_CLUSTER_COLLISION) {
    const samples = Array.isArray(finding.samples) ? finding.samples.slice(0, 3) : [];
    const sampleText = samples
      .map((item) => `${item.a} x ${item.b} (gap=${item.gap}px, overlap=${item.rowOverlapRatio})`)
      .join(" ; ");
    return [
      `Detectada colisao entre clusters laterais em ${finding.count || samples.length} par(es) de blocos.`,
      sampleText || "Nenhum par detalhado disponivel.",
    ].join(" | ");
  }

  return String(finding.detail || "Inconsistencia visual detectada.");
}

async function runVisualInterfaceChecks(page, route, cfg) {
  const visualCfg = cfg.visualAnalyzer;
  if (!visualCfg?.enabled) return [];

  if (visualCfg.waitMs > 0) {
    await page.waitForTimeout(visualCfg.waitMs);
  }

  const findings = await page.evaluate((settings) => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const round = (value) => Number(Number(value).toFixed(2));

    const isVisible = (el) => {
      if (!(el instanceof Element)) return false;
      const style = window.getComputedStyle(el);
      if (!style) return false;
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
      const rect = el.getBoundingClientRect();
      return rect.width >= 1 && rect.height >= 1;
    };

    const isSmallFixedWidget = (el, rect) => {
      const style = window.getComputedStyle(el);
      return style.position === "fixed" && rect.width <= 220 && rect.height <= 220;
    };

    const hasHorizontalScrollAncestor = (el) => {
      let current = el.parentElement;
      while (current) {
        const style = window.getComputedStyle(current);
        if (/(auto|scroll|overlay)/i.test(style.overflowX || "")) return true;
        current = current.parentElement;
      }
      return false;
    };

    const describe = (el) => {
      const parts = [el.tagName.toLowerCase()];
      if (el.id) parts.push(`#${String(el.id).slice(0, 40)}`);
      const testId = el.getAttribute("data-testid") || el.getAttribute("data-test") || el.getAttribute("data-qa");
      if (testId) parts.push(`[data=${String(testId).slice(0, 40)}]`);
      const classes = String(el.className || "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => `.${item.slice(0, 24)}`);
      parts.push(...classes);
      return parts.join("");
    };

    const candidates = Array.from(
      document.querySelectorAll(
        [
          "body > header",
          "body > main",
          "body > footer",
          "body > section",
          "body > article",
          "body > aside",
          "body > nav",
          "main > *",
          '[role="main"] > *',
          "[data-section]",
          "[data-testid]",
          ".panel",
          ".card",
          "section",
          "article",
          "aside",
        ].join(","),
      ),
    );

    const majorBlocks = candidates
      .filter((el) => isVisible(el))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          el,
          selector: describe(el),
          top: round(rect.top + window.scrollY),
          left: round(rect.left),
          right: round(rect.right),
          width: round(rect.width),
          height: round(rect.height),
          clip: {
            x: round(Math.max(0, rect.left + window.scrollX)),
            y: round(Math.max(0, rect.top + window.scrollY)),
            width: round(Math.max(1, rect.width)),
            height: round(Math.max(1, rect.height)),
          },
          fixed: window.getComputedStyle(el).position === "fixed",
        };
      })
      .filter((item) =>
        item.width >= settings.minBlockWidthPx &&
        item.height >= settings.minBlockHeightPx &&
        item.selector !== "body" &&
        item.selector !== "main"
      )
      .sort((a, b) => (a.top - b.top) || (b.width * b.height - a.width * a.height));

    const overflow = [];
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      if (!(el instanceof Element) || !isVisible(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 24 || rect.height < 24) continue;
      if (isSmallFixedWidget(el, rect) || hasHorizontalScrollAncestor(el)) continue;

      const leftOverflow = rect.left < 0 - settings.overflowTolerancePx;
      const rightOverflow = rect.right > viewportWidth + settings.overflowTolerancePx;
      if (!leftOverflow && !rightOverflow) continue;

      overflow.push({
        selector: describe(el),
        side: leftOverflow ? "left" : "right",
        delta: round(leftOverflow ? Math.abs(rect.left) : Math.abs(rect.right - viewportWidth)),
        left: round(rect.left),
        right: round(rect.right),
        clip: {
          x: round(Math.max(0, rect.left + window.scrollX)),
          y: round(Math.max(0, rect.top + window.scrollY)),
          width: round(Math.max(1, Math.min(rect.width, viewportWidth))),
          height: round(Math.max(1, rect.height)),
        },
      });
      if (overflow.length >= settings.maxSamples) break;
    }

    const overlap = [];
    const pairCap = Math.min(majorBlocks.length, 18);
    for (let index = 0; index < pairCap; index += 1) {
      const first = majorBlocks[index];
      if (first.fixed) continue;
      for (let secondIndex = index + 1; secondIndex < pairCap; secondIndex += 1) {
        const second = majorBlocks[secondIndex];
        if (second.fixed) continue;
        if (first.el.contains(second.el) || second.el.contains(first.el)) continue;
        if (Math.abs(first.top - second.top) > Math.max(first.height, second.height) + 80) continue;

        const overlapWidth = Math.min(first.right, second.right) - Math.max(first.left, second.left);
        const overlapHeight =
          Math.min(first.top + first.height, second.top + second.height) -
          Math.max(first.top, second.top);
        if (overlapWidth <= 0 || overlapHeight <= 0) continue;

        const area = overlapWidth * overlapHeight;
        const smallerArea = Math.min(first.width * first.height, second.width * second.height);
        const ratio = smallerArea > 0 ? area / smallerArea : 0;
        if (area < settings.overlapMinAreaPx || ratio < settings.overlapRatioThreshold) continue;

        overlap.push({
          a: first.selector,
          b: second.selector,
          area: round(area),
          ratio: round(ratio),
          clip: {
            x: round(Math.max(0, Math.min(first.left, second.left) + window.scrollX)),
            y: round(Math.max(0, Math.min(first.top, second.top))),
            width: round(Math.max(1, Math.max(first.right, second.right) - Math.min(first.left, second.left))),
            height: round(
              Math.max(
                1,
                Math.max(first.top + first.height, second.top + second.height) - Math.min(first.top, second.top),
              ),
            ),
          },
        });
        if (overlap.length >= settings.maxSamples) break;
      }
      if (overlap.length >= settings.maxSamples) break;
    }

    const stackedBlocks = majorBlocks
      .filter((item) =>
        !item.fixed &&
        item.width >= viewportWidth * 0.45 &&
        item.height >= settings.minBlockHeightPx
      )
      .sort((a, b) => a.top - b.top);

    let baselineLeft = null;
    const alignment = [];
    if (stackedBlocks.length >= 3) {
      const lefts = [...stackedBlocks].map((item) => item.left).sort((a, b) => a - b);
      baselineLeft = round(lefts[Math.floor(lefts.length / 2)]);
      for (const block of stackedBlocks) {
        const drift = round(Math.abs(block.left - baselineLeft));
        if (drift <= settings.alignmentTolerancePx) continue;
        alignment.push({
          selector: block.selector,
          left: block.left,
          drift,
          clip: block.clip,
        });
        if (alignment.length >= settings.maxSamples) break;
      }
    }

    const verticalPairs = [];
    for (let index = 0; index < stackedBlocks.length - 1; index += 1) {
      const first = stackedBlocks[index];
      const second = stackedBlocks[index + 1];
      if (first.el.contains(second.el) || second.el.contains(first.el)) continue;

      const sharedWidth = Math.min(first.right, second.right) - Math.max(first.left, second.left);
      const sharedRatio = Math.min(first.width, second.width) > 0 ? sharedWidth / Math.min(first.width, second.width) : 0;
      if (sharedRatio < 0.45) continue;

      const gap = round(second.top - (first.top + first.height));
      if (gap < 0) continue;

      verticalPairs.push({
        a: first.selector,
        b: second.selector,
        gap,
        sharedRatio: round(sharedRatio),
        clip: {
          x: round(Math.max(0, Math.min(first.left, second.left) + window.scrollX)),
          y: round(Math.max(0, Math.min(first.top, second.top))),
          width: round(Math.max(1, Math.max(first.right, second.right) - Math.min(first.left, second.left))),
          height: round(
            Math.max(
              1,
              Math.max(first.top + first.height, second.top + second.height) - Math.min(first.top, second.top),
            ),
          ),
        },
      });
    }

    const tightSpacing = verticalPairs
      .filter((item) => item.gap <= settings.tightSpacingPx)
      .slice(0, settings.maxSamples);

    const boundaryCollision = verticalPairs
      .filter((item) => item.gap <= settings.boundaryCollisionPx)
      .slice(0, settings.maxSamples);

    const comparableGaps = verticalPairs
      .map((item) => item.gap)
      .filter((item) => item >= settings.minComparableGapPx);
    const gapBaseline = comparableGaps.length
      ? round(comparableGaps.sort((a, b) => a - b)[Math.floor(comparableGaps.length / 2)])
      : null;
    const gapInconsistency = gapBaseline === null
      ? []
      : verticalPairs
          .map((item) => {
            const drift = round(Math.abs(item.gap - gapBaseline));
            return {
              ...item,
              baselineGap: gapBaseline,
              drift,
              trend: item.gap > gapBaseline ? "too_loose" : "too_tight",
            };
          })
          .filter((item) => item.drift >= settings.gapDriftTolerancePx)
          .slice(0, settings.maxSamples);

    const edgeHugging = stackedBlocks
      .map((item) => {
        const leftGap = round(Math.max(0, item.left));
        const rightGap = round(Math.max(0, viewportWidth - item.right));
        const side = leftGap <= rightGap ? "left" : "right";
        const gap = side === "left" ? leftGap : rightGap;
        const oppositeGap = side === "left" ? rightGap : leftGap;
        const asymmetry = round(Math.abs(leftGap - rightGap));
        const almostFullBleed = item.width >= viewportWidth - settings.edgeGutterMinPx;
        return {
          selector: item.selector,
          side,
          gap,
          oppositeGap,
          asymmetry,
          almostFullBleed,
          clip: item.clip,
        };
      })
      .filter((item) => {
        if (item.almostFullBleed) return false;
        if (item.gap >= settings.edgeGutterMinPx) return false;
        return item.oppositeGap >= settings.edgeGutterMinPx || item.asymmetry >= settings.alignmentTolerancePx;
      })
      .slice(0, settings.maxSamples);

    const comparableWidths = stackedBlocks
      .filter((item) => item.width <= viewportWidth - Math.max(settings.edgeGutterMinPx, 12))
      .map((item) => item.width)
      .sort((a, b) => a - b);
    const widthBaseline = comparableWidths.length
      ? round(comparableWidths[Math.floor(comparableWidths.length / 2)])
      : null;
    const widthInconsistency = widthBaseline === null
      ? []
      : stackedBlocks
          .map((item) => {
            const drift = round(Math.abs(item.width - widthBaseline));
            return {
              selector: item.selector,
              width: item.width,
              baselineWidth: widthBaseline,
              drift,
              trend: item.width > widthBaseline ? "too_wide" : "too_narrow",
              clip: item.clip,
            };
          })
          .filter((item) => item.drift >= settings.widthDriftTolerancePx)
          .slice(0, settings.maxSamples);

    const hierarchyCollapse = stackedBlocks
      .map((item) => {
        const headingNodes = Array.from(item.el.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading']"))
          .filter((el) => isVisible(el))
          .map((el) => {
            const style = window.getComputedStyle(el);
            const size = parseFloat(style.fontSize || "0");
            const text = (el.textContent || "").replace(/\s+/g, " ").trim();
            return { size, text };
          })
          .filter((entry) => entry.size >= 12 && entry.text.length >= 2);

        if (!headingNodes.length) return null;

        const bodyNodes = Array.from(item.el.querySelectorAll("p, li, span, a, button, label, small, strong"))
          .filter((el) => isVisible(el) && !el.closest("h1, h2, h3, h4, h5, h6, [role='heading']"))
          .map((el) => {
            const style = window.getComputedStyle(el);
            const size = parseFloat(style.fontSize || "0");
            const text = (el.textContent || "").replace(/\s+/g, " ").trim();
            return { size, text };
          })
          .filter((entry) => entry.size >= 10 && entry.text.length >= 8);

        if (!bodyNodes.length) return null;

        const headingSize = round(Math.max(...headingNodes.map((entry) => entry.size)));
        const bodySizes = bodyNodes.map((entry) => entry.size).sort((a, b) => a - b);
        const bodySize = round(bodySizes[Math.floor(bodySizes.length / 2)]);
        const ratio = round(headingSize / Math.max(1, bodySize));
        const gap = round(headingSize - bodySize);

        if (gap >= settings.hierarchyGapMinPx && ratio >= settings.hierarchyRatioMin) return null;

        return {
          selector: item.selector,
          headingSize,
          bodySize,
          ratio,
          gap,
          headingText: headingNodes[0]?.text || "",
          clip: item.clip,
        };
      })
      .filter(Boolean)
      .slice(0, settings.maxSamples);

    const clusterCollision = [];
    const clusterCap = Math.min(majorBlocks.length, 24);
    for (let index = 0; index < clusterCap; index += 1) {
      const first = majorBlocks[index];
      if (first.fixed) continue;
      for (let secondIndex = index + 1; secondIndex < clusterCap; secondIndex += 1) {
        const second = majorBlocks[secondIndex];
        if (second.fixed) continue;
        if (first.el.contains(second.el) || second.el.contains(first.el)) continue;

        const rowOverlap =
          Math.min(first.top + first.height, second.top + second.height) - Math.max(first.top, second.top);
        if (rowOverlap <= 0) continue;
        const rowOverlapRatio = Math.min(first.height, second.height) > 0 ? rowOverlap / Math.min(first.height, second.height) : 0;
        if (rowOverlapRatio < settings.clusterRowOverlapRatio) continue;

        const firstBeforeSecond = first.left <= second.left;
        const gap = round(firstBeforeSecond ? second.left - first.right : first.left - second.right);
        if (gap < 0 || gap > settings.clusterCollisionPx) continue;

        clusterCollision.push({
          a: first.selector,
          b: second.selector,
          gap,
          rowOverlapRatio: round(rowOverlapRatio),
          clip: {
            x: round(Math.max(0, Math.min(first.left, second.left) + window.scrollX)),
            y: round(Math.max(0, Math.min(first.top, second.top))),
            width: round(Math.max(1, Math.max(first.right, second.right) - Math.min(first.left, second.left))),
            height: round(
              Math.max(
                1,
                Math.max(first.top + first.height, second.top + second.height) - Math.min(first.top, second.top),
              ),
            ),
          },
        });
        if (clusterCollision.length >= settings.maxSamples) break;
      }
      if (clusterCollision.length >= settings.maxSamples) break;
    }

    const foldPressure = [];
    const foldBlocks = stackedBlocks.filter(
      (item) => item.top < viewportHeight * settings.foldViewportMultiplier && item.top + item.height > 0,
    );
    if (foldBlocks.length >= settings.foldPressureMinBlocks) {
      const first = foldBlocks[0];
      const last = foldBlocks[foldBlocks.length - 1];
      const foldPairGaps = [];
      for (let index = 0; index < foldBlocks.length - 1; index += 1) {
        const current = foldBlocks[index];
        const next = foldBlocks[index + 1];
        const gap = round(next.top - (current.top + current.height));
        if (gap >= 0) foldPairGaps.push(gap);
      }
      const averageGap = foldPairGaps.length
        ? round(foldPairGaps.reduce((acc, item) => acc + item, 0) / foldPairGaps.length)
        : 0;
      const stackSpan = round(last.top + last.height - first.top);
      const densityRatio = round(stackSpan / Math.max(1, viewportHeight));
      if (averageGap <= settings.foldPressureAvgGapPx && densityRatio >= settings.foldPressureSpanRatio) {
        foldPressure.push({
          blockCount: foldBlocks.length,
          averageGap,
          stackSpan,
          densityRatio,
          selectors: foldBlocks.slice(0, 5).map((item) => item.selector),
          clip: {
            x: round(Math.max(0, Math.min(...foldBlocks.map((item) => item.left)) + window.scrollX)),
            y: round(Math.max(0, first.top)),
            width: round(
              Math.max(1, Math.max(...foldBlocks.map((item) => item.right)) - Math.min(...foldBlocks.map((item) => item.left))),
            ),
            height: round(Math.max(1, last.top + last.height - first.top)),
          },
        });
      }
    }

    return {
      viewportWidth,
      viewportHeight,
      overflow,
      overlap,
      alignment,
      baselineLeft,
      tightSpacing,
      gapInconsistency,
      edgeHugging,
      widthInconsistency,
      boundaryCollision,
      foldPressure,
      hierarchyCollapse,
      clusterCollision,
    };
  }, visualCfg);

  const issues = [];
  if (findings.overflow?.length) {
    issues.push({
      code: CODE.VISUAL_LAYOUT_OVERFLOW,
      route,
      action: "visual_quality:overflow",
      count: findings.overflow.length,
      samples: findings.overflow,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.overlap?.length) {
    issues.push({
      code: CODE.VISUAL_LAYER_OVERLAP,
      route,
      action: "visual_quality:overlap",
      count: findings.overlap.length,
      samples: findings.overlap,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.alignment?.length) {
    issues.push({
      code: CODE.VISUAL_ALIGNMENT_DRIFT,
      route,
      action: "visual_quality:alignment",
      count: findings.alignment.length,
      samples: findings.alignment,
      baselineLeft: findings.baselineLeft,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.tightSpacing?.length) {
    issues.push({
      code: CODE.VISUAL_TIGHT_SPACING,
      route,
      action: "visual_quality:tight_spacing",
      count: findings.tightSpacing.length,
      samples: findings.tightSpacing,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.gapInconsistency?.length) {
    issues.push({
      code: CODE.VISUAL_GAP_INCONSISTENCY,
      route,
      action: "visual_quality:gap_inconsistency",
      count: findings.gapInconsistency.length,
      samples: findings.gapInconsistency,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.edgeHugging?.length) {
    issues.push({
      code: CODE.VISUAL_EDGE_HUGGING,
      route,
      action: "visual_quality:edge_hugging",
      count: findings.edgeHugging.length,
      samples: findings.edgeHugging,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.widthInconsistency?.length) {
    issues.push({
      code: CODE.VISUAL_WIDTH_INCONSISTENCY,
      route,
      action: "visual_quality:width_inconsistency",
      count: findings.widthInconsistency.length,
      samples: findings.widthInconsistency,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.boundaryCollision?.length) {
    issues.push({
      code: CODE.VISUAL_BOUNDARY_COLLISION,
      route,
      action: "visual_quality:boundary_collision",
      count: findings.boundaryCollision.length,
      samples: findings.boundaryCollision,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.foldPressure?.length) {
    issues.push({
      code: CODE.VISUAL_FOLD_PRESSURE,
      route,
      action: "visual_quality:fold_pressure",
      count: findings.foldPressure.length,
      samples: findings.foldPressure,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.hierarchyCollapse?.length) {
    issues.push({
      code: CODE.VISUAL_HIERARCHY_COLLAPSE,
      route,
      action: "visual_quality:hierarchy_collapse",
      count: findings.hierarchyCollapse.length,
      samples: findings.hierarchyCollapse,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }
  if (findings.clusterCollision?.length) {
    issues.push({
      code: CODE.VISUAL_CLUSTER_COLLISION,
      route,
      action: "visual_quality:cluster_collision",
      count: findings.clusterCollision.length,
      samples: findings.clusterCollision,
      viewportWidth: findings.viewportWidth,
      viewportHeight: findings.viewportHeight,
    });
  }

  return issues;
}

function normalizeClipBox(clip, pageMetrics = {}) {
  if (!clip || typeof clip !== "object") return null;
  const pageWidth = Math.max(1, Number(pageMetrics.width || 0) || 1);
  const pageHeight = Math.max(1, Number(pageMetrics.height || 0) || 1);
  const x = Math.max(0, Number(clip.x || 0));
  const y = Math.max(0, Number(clip.y || 0));
  const width = Math.max(1, Number(clip.width || 0));
  const height = Math.max(1, Number(clip.height || 0));
  if (!Number.isFinite(x + y + width + height)) return null;
  const clippedX = Math.min(x, pageWidth - 1);
  const clippedY = Math.min(y, pageHeight - 1);
  const clippedWidth = Math.max(1, Math.min(width, pageWidth - clippedX));
  const clippedHeight = Math.max(1, Math.min(height, pageHeight - clippedY));
  return {
    x: Number(clippedX.toFixed(2)),
    y: Number(clippedY.toFixed(2)),
    width: Number(clippedWidth.toFixed(2)),
    height: Number(clippedHeight.toFixed(2)),
  };
}

function mergeClipBoxes(clips = []) {
  const valid = clips.filter((clip) => clip && typeof clip === "object");
  if (!valid.length) return null;
  const left = Math.min(...valid.map((clip) => Number(clip.x || 0)));
  const top = Math.min(...valid.map((clip) => Number(clip.y || 0)));
  const right = Math.max(...valid.map((clip) => Number(clip.x || 0) + Number(clip.width || 0)));
  const bottom = Math.max(...valid.map((clip) => Number(clip.y || 0) + Number(clip.height || 0)));
  return {
    x: left,
    y: top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

function expandClipBox(clip, pageMetrics = {}, options = {}) {
  const normalized = normalizeClipBox(clip, pageMetrics);
  if (!normalized) return null;

  const pageWidth = Math.max(1, Number(pageMetrics.width || 0) || 1);
  const pageHeight = Math.max(1, Number(pageMetrics.height || 0) || 1);
  const padding = Math.max(0, Number(options.padding || 0) || 0);
  const minWidth = Math.max(1, Number(options.minWidth || 0) || normalized.width);
  const minHeight = Math.max(1, Number(options.minHeight || 0) || normalized.height);

  let x = normalized.x - padding;
  let y = normalized.y - padding;
  let width = normalized.width + padding * 2;
  let height = normalized.height + padding * 2;

  if (width < minWidth) {
    const delta = minWidth - width;
    x -= delta / 2;
    width = minWidth;
  }
  if (height < minHeight) {
    const delta = minHeight - height;
    y -= delta / 2;
    height = minHeight;
  }

  return normalizeClipBox({ x, y, width, height }, { width: pageWidth, height: pageHeight });
}

function buildEvidenceHighlightsFromSamples(samples = [], pageMetrics = {}) {
  return samples
    .slice(0, 3)
    .map((sample, index) => {
      const clip = normalizeClipBox(sample?.clip, pageMetrics);
      if (!clip) return null;
      const label =
        sample?.selector ||
        (sample?.a && sample?.b ? `${sample.a} x ${sample.b}` : "") ||
        `sample ${index + 1}`;
      return {
        ...clip,
        label: String(label).slice(0, 120),
      };
    })
    .filter(Boolean);
}

async function withEvidenceOverlay(page, highlights, work) {
  if (!Array.isArray(highlights) || !highlights.length) {
    return await work();
  }

  const overlayId = `sitepulse-evidence-overlay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await page.evaluate(({ overlayId: id, items }) => {
    const doc = document;
    doc.getElementById(id)?.remove();

    const pageWidth = Math.max(
      doc.documentElement?.scrollWidth || 0,
      doc.body?.scrollWidth || 0,
      window.innerWidth || 0,
    );
    const pageHeight = Math.max(
      doc.documentElement?.scrollHeight || 0,
      doc.body?.scrollHeight || 0,
      window.innerHeight || 0,
    );

    const root = doc.createElement("div");
    root.id = id;
    Object.assign(root.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: `${pageWidth}px`,
      height: `${pageHeight}px`,
      pointerEvents: "none",
      zIndex: "2147483647",
    });

    items.forEach((item, index) => {
      const box = doc.createElement("div");
      Object.assign(box.style, {
        position: "absolute",
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${Math.max(1, item.width)}px`,
        height: `${Math.max(1, item.height)}px`,
        border: index === 0 ? "3px solid #7ae2b3" : "3px solid #5ac0ff",
        background: index === 0 ? "rgba(122, 226, 179, 0.12)" : "rgba(90, 192, 255, 0.1)",
        boxShadow: "0 0 0 1px rgba(5, 9, 14, 0.86), 0 0 32px rgba(90, 192, 255, 0.24)",
        borderRadius: "12px",
      });

      const tag = doc.createElement("div");
      tag.textContent = item.label || `sample ${index + 1}`;
      Object.assign(tag.style, {
        position: "absolute",
        left: "0",
        top: "-28px",
        maxWidth: "320px",
        padding: "4px 10px",
        borderRadius: "999px",
        background: "rgba(8, 13, 20, 0.9)",
        color: "#f3f5fa",
        border: "1px solid rgba(255,255,255,0.12)",
        font: '600 12px "Segoe UI", sans-serif',
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      });

      box.appendChild(tag);
      root.appendChild(box);
    });

    doc.body.appendChild(root);
  }, { overlayId, items: highlights }).catch(() => undefined);

  try {
    return await work();
  } finally {
    await page.evaluate((overlayIdValue) => {
      document.getElementById(overlayIdValue)?.remove();
    }, overlayId).catch(() => undefined);
  }
}

async function suppressConsentOverlays(page, cfg, args, route = "") {
  if (cfg?.visualAnalyzer?.suppressConsentOverlays === false) return { clicked: 0, hidden: 0 };

  const result = await page.evaluate(() => {
    const consentNeedles = [
      "cookie",
      "cookies",
      "consent",
      "privacy",
      "privacidade",
      "privacidad",
      "preferenc",
      "gdpr",
      "rgpd",
      "onetrust",
      "cookiebot",
      "cookielaw",
      "termly",
      "usercentrics",
    ];
    const preferPhrases = [
      "only necessary",
      "only essential",
      "necessary only",
      "solo necesarias",
      "sólo necesarias",
      "so necessarias",
      "só necessarias",
      "nomes necessaries",
      "only required",
      "continue without accepting",
      "reject",
      "decline",
      "close",
      "dismiss",
      "fechar",
      "cerrar",
      "tancar",
      "accept all",
      "accept",
      "aceptar",
      "aceito",
      "aceitar",
      "agree",
      "allow all",
      "ok",
    ];

    const describe = (el) => {
      const bits = [];
      if (el.id) bits.push(`#${String(el.id).slice(0, 42)}`);
      const classes = String(el.className || "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(".");
      if (classes) bits.push(`.${classes}`);
      return bits.join("") || el.tagName.toLowerCase();
    };

    const textFor = (el) => {
      const label = [
        el.textContent,
        el.getAttribute?.("aria-label"),
        el.getAttribute?.("title"),
        el.getAttribute?.("data-testid"),
        el.getAttribute?.("id"),
        el.getAttribute?.("class"),
      ]
        .filter(Boolean)
        .join(" ");
      return label.replace(/\s+/g, " ").trim().toLowerCase();
    };

    const visible = (el) => {
      if (!(el instanceof Element)) return false;
      const style = window.getComputedStyle(el);
      if (!style) return false;
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
      const rect = el.getBoundingClientRect();
      return rect.width >= 1 && rect.height >= 1;
    };

    const overlayRoots = Array.from(document.querySelectorAll("body *"))
      .filter((el) => visible(el))
      .filter((el) => {
        const style = window.getComputedStyle(el);
        const text = textFor(el);
        const rect = el.getBoundingClientRect();
        const role = (el.getAttribute("role") || "").toLowerCase();
        const attrHay = `${el.id || ""} ${el.className || ""} ${role} ${el.getAttribute("aria-label") || ""}`.toLowerCase();
        const hasConsentSignal = consentNeedles.some((needle) => text.includes(needle) || attrHay.includes(needle));
        const looksOverlay =
          style.position === "fixed" ||
          style.position === "sticky" ||
          role === "dialog" ||
          el.getAttribute("aria-modal") === "true";
        const largeEnough = rect.width >= 220 && rect.height >= 48;
        return hasConsentSignal && looksOverlay && largeEnough;
      })
      .slice(0, 16);

    const clicks = [];
    for (const root of overlayRoots) {
      const controls = Array.from(root.querySelectorAll('button, [role="button"], a, input[type="button"], input[type="submit"]'))
        .filter((el) => visible(el))
        .map((el) => {
          const text = textFor(el);
          let score = 0;
          preferPhrases.forEach((phrase, index) => {
            if (text.includes(phrase)) {
              score = Math.max(score, 160 - index);
            }
          });
          return { el, text, score };
        })
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score);

      if (!controls.length) continue;
      const winner = controls[0];
      try {
        winner.el.click();
        clicks.push(winner.text || describe(winner.el));
      } catch {}
    }

    let hidden = 0;
    for (const root of overlayRoots) {
      if (!visible(root)) continue;
      root.setAttribute("data-sitepulse-hidden-overlay", "true");
      root.style.setProperty("display", "none", "important");
      root.style.setProperty("visibility", "hidden", "important");
      root.style.setProperty("pointer-events", "none", "important");
      hidden += 1;
    }

    const genericBackdrops = Array.from(document.querySelectorAll('body *'))
      .filter((el) => visible(el))
      .filter((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const attrHay = `${el.id || ""} ${el.className || ""}`.toLowerCase();
        return (
          (style.position === "fixed" || style.position === "sticky") &&
          rect.width >= window.innerWidth * 0.72 &&
          rect.height >= 42 &&
          consentNeedles.some((needle) => attrHay.includes(needle))
        );
      })
      .slice(0, 6);

    for (const backdrop of genericBackdrops) {
      if (!visible(backdrop)) continue;
      backdrop.setAttribute("data-sitepulse-hidden-overlay", "true");
      backdrop.style.setProperty("display", "none", "important");
      backdrop.style.setProperty("visibility", "hidden", "important");
      backdrop.style.setProperty("pointer-events", "none", "important");
      hidden += 1;
    }

    return {
      clicked: clicks.length,
      hidden,
      clickedLabels: clicks.slice(0, 3),
    };
  }).catch(() => ({ clicked: 0, hidden: 0, clickedLabels: [] }));

  if ((result.clicked || result.hidden) && args?.liveLog) {
    emitLiveEvent(args, "overlay_suppressed", {
      route,
      action: "overlay_suppression",
      detail: `clicked=${result.clicked} hidden=${result.hidden}${result.clickedLabels?.length ? ` labels=${result.clickedLabels.join(", ")}` : ""}`,
    });
  }

  if (result.clicked || result.hidden) {
    await page.waitForTimeout(180).catch(() => undefined);
  }
  return result;
}

async function captureVisualFindingEvidence(page, finding, reportDir, route, cfg) {
  if (!reportDir || !finding || !Array.isArray(finding.samples) || !finding.samples.length) {
    return [];
  }

  const metrics = await page.evaluate(() => ({
    width: Math.max(
      document.documentElement?.scrollWidth || 0,
      document.body?.scrollWidth || 0,
      window.innerWidth || 0,
    ),
    height: Math.max(
      document.documentElement?.scrollHeight || 0,
      document.body?.scrollHeight || 0,
      window.innerHeight || 0,
    ),
  })).catch(() => ({ width: 0, height: 0 }));

  const evidenceDir = path.join(reportDir, "visual-evidence");
  await fs.mkdir(evidenceDir, { recursive: true });

  const routeToken = sanitizeFileToken(route === "/" ? "home" : route.replaceAll("/", "-"), "route");
  const codeToken = sanitizeFileToken(finding.code, "visual");
  const captured = [];

  const highlights = buildEvidenceHighlightsFromSamples(finding.samples, metrics);
  const unionClip = mergeClipBoxes(highlights);
  const contextClip = expandClipBox(unionClip, metrics, {
    padding: finding.viewportWidth && finding.viewportWidth < 900 ? 120 : 180,
    minWidth: finding.viewportWidth && finding.viewportWidth < 900 ? 560 : 760,
    minHeight: finding.viewportWidth && finding.viewportWidth < 900 ? 320 : 420,
  });
  const focusClip = expandClipBox(highlights[0], metrics, {
    padding: 80,
    minWidth: 420,
    minHeight: 240,
  });
  const evidenceStamp = nowStamp();
  const leadSample = finding.samples[0];
  const leadLabel = leadSample?.selector || leadSample?.a || leadSample?.b || finding.code;
  const safeLeadLabel = sanitizeFileToken(leadLabel, "sample-1");

  if (contextClip) {
    const contextPath = path.join(evidenceDir, `${evidenceStamp}-${routeToken}-${codeToken}-${safeLeadLabel}-context.png`);
    try {
      await withEvidenceOverlay(page, highlights, async () => {
        await page.screenshot({
          path: contextPath,
          clip: contextClip,
          animations: "disabled",
        });
      });
      captured.push({
        type: "screenshot",
        path: contextPath,
        label: `${leadLabel} context`,
        route,
        code: finding.code,
        variant: "context",
        viewportLabel: finding.viewportLabel || "",
        viewport: finding.viewportWidth && finding.viewportHeight ? `${finding.viewportWidth}x${finding.viewportHeight}` : "",
        note: "Expanded capture with highlighted problem area.",
      });
    } catch {
      // keep the issue even if the screenshot failed
    }
  }

  if (focusClip) {
    const focusPath = path.join(evidenceDir, `${evidenceStamp}-${routeToken}-${codeToken}-${safeLeadLabel}-focus.png`);
    try {
      await withEvidenceOverlay(page, highlights.slice(0, 1), async () => {
        await page.screenshot({
          path: focusPath,
          clip: focusClip,
          animations: "disabled",
        });
      });
      captured.push({
        type: "screenshot",
        path: focusPath,
        label: `${leadLabel} focus`,
        route,
        code: finding.code,
        variant: "focus",
        viewportLabel: finding.viewportLabel || "",
        viewport: finding.viewportWidth && finding.viewportHeight ? `${finding.viewportWidth}x${finding.viewportHeight}` : "",
        note: "Tighter crop of the primary visual defect.",
      });
    } catch {
      // keep the issue even if the screenshot failed
    }
  }

  if (cfg?.visualAnalyzer?.evidenceFullPage !== false) {
    const fullPagePath = path.join(evidenceDir, `${evidenceStamp}-${routeToken}-${codeToken}-${safeLeadLabel}-fullpage.png`);
    try {
      await withEvidenceOverlay(page, highlights, async () => {
        await page.screenshot({
          path: fullPagePath,
          fullPage: true,
          animations: "disabled",
        });
      });
      captured.push({
        type: "screenshot",
        path: fullPagePath,
        label: `${leadLabel} full page`,
        route,
        code: finding.code,
        variant: "fullpage",
        viewportLabel: finding.viewportLabel || "",
        viewport: finding.viewportWidth && finding.viewportHeight ? `${finding.viewportWidth}x${finding.viewportHeight}` : "",
        note: "Full-page route capture with all highlighted visual problem areas.",
      });
    } catch {
      // keep the issue even if the screenshot failed
    }
  }

  return captured;
}

async function runSectionOrderChecks(page, route, cfg) {
  const rules = cfg.sectionOrderRules.filter((rule) => routeMatchesRule(route, rule));
  if (!rules.length) return [];

  if (cfg.sectionOrderWaitMs > 0) {
    await page.waitForTimeout(cfg.sectionOrderWaitMs);
  }

  const findings = await page.evaluate((activeRules) => {
    const inspectSelector = (selector) => {
      try {
        const element = document.querySelector(selector);
        if (!element) {
          return { exists: false, visible: false, top: null, bottom: null };
        }
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const visible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0;
        return {
          exists: true,
          visible,
          top: Number((rect.top + window.scrollY).toFixed(2)),
          bottom: Number((rect.bottom + window.scrollY).toFixed(2)),
        };
      } catch {
        return { exists: false, visible: false, top: null, bottom: null };
      }
    };

    return activeRules.map((rule) => {
      const before = inspectSelector(rule.beforeSelector);
      const after = inspectSelector(rule.afterSelector);
      const missing = rule.required && (!before.exists || !after.exists || !before.visible || !after.visible);
      if (missing) {
        return {
          status: "missing",
          id: rule.id,
          description: rule.description,
          beforeSelector: rule.beforeSelector,
          afterSelector: rule.afterSelector,
          before,
          after,
        };
      }

      const invalidOrder =
        before.exists &&
        after.exists &&
        before.visible &&
        after.visible &&
        before.top !== null &&
        after.top !== null &&
        before.top >= after.top;

      if (invalidOrder) {
        return {
          status: "order_invalid",
          id: rule.id,
          description: rule.description,
          beforeSelector: rule.beforeSelector,
          afterSelector: rule.afterSelector,
          before,
          after,
        };
      }

      return {
        status: "ok",
        id: rule.id,
        description: rule.description,
        beforeSelector: rule.beforeSelector,
        afterSelector: rule.afterSelector,
        before,
        after,
      };
    });
  }, rules);

  return findings.filter((item) => item.status !== "ok");
}

function extractButtonLabels(page, baseOrigin) {
  return page.evaluate((origin) => {
    const isVisible = (el) => {
      const style = window.getComputedStyle(el);
      if (!style || style.visibility === "hidden" || style.display === "none") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const hasInternalHref = (value) => {
      const href = clean(value);
      if (!href) return false;
      if (href.startsWith("#")) return true;
      if (href.startsWith("/")) return true;
      if (href.startsWith("?")) return true;
      if (/^mailto:|^tel:|^javascript:/i.test(href)) return false;
      try {
        const url = new URL(href, window.location.href);
        return url.origin === origin;
      } catch {
        return false;
      }
    };
    const all = Array.from(
      document.querySelectorAll(
        [
          "button",
          "a[href]",
          '[role="button"]',
          '[role="link"]',
          '[role="menuitem"]',
          '[role="tab"]',
          "summary",
          'input[type="button"]',
          'input[type="submit"]',
          "[onclick]",
          "[data-action]",
        ].join(","),
      ),
    );
    const actions = all
      .filter((el) => isVisible(el))
      .filter((el) => !el.closest('[data-audit-ignore="true"]'))
      .filter((el) => {
        const tag = (el.tagName || "").toLowerCase();
        if (tag === "a") return hasInternalHref(el.getAttribute("href"));
        return true;
      })
      .map((el) => {
        const tag = (el.tagName || "").toLowerCase();
        const text = clean(el.textContent);
        const aria = clean(el.getAttribute("aria-label"));
        const title = clean(el.getAttribute("title"));
        const value = clean(el.getAttribute("value"));
        const label = text || aria || title || value || "";
        const href = clean(el.getAttribute("href"));
        const role = clean(el.getAttribute("role"));
        const id = clean(el.getAttribute("id"));
        const dataAction = clean(el.getAttribute("data-action"));
        const kind =
          role === "tab"
            ? "tab"
            : role === "menuitem"
            ? "menuitem"
            : tag === "a" || role === "link"
            ? "link"
            : tag === "summary"
            ? "summary"
            : "button";
        return {
          label,
          kind,
          href,
          role,
          id,
          title,
          ariaLabel: aria,
          dataAction,
        };
      })
      .filter((item) => item.label.length >= 2 && item.label.length <= 140);

    const deduped = [];
    const seen = new Set();
    for (const item of actions) {
      const key = `${item.kind}|${item.label.toLowerCase()}|${item.href.toLowerCase()}|${item.id.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
      if (deduped.length >= 180) break;
    }

    return deduped;
  }, baseOrigin);
}

async function extractInternalRoutesFromPage(page, baseOrigin) {
  const hrefs = await page.evaluate(() => {
    const found = [];
    const pushValue = (value) => {
      const normalized = String(value ?? "").trim();
      if (normalized) found.push(normalized);
    };

    for (const node of document.querySelectorAll("a[href]")) {
      pushValue(node.getAttribute("href"));
    }
    for (const node of document.querySelectorAll("[data-href]")) {
      pushValue(node.getAttribute("data-href"));
    }
    return Array.from(new Set(found));
  });

  const routes = [];
  const seen = new Set();
  for (const href of hrefs) {
    const route = toInternalRoute(href, baseOrigin);
    if (!route || seen.has(route)) continue;
    seen.add(route);
    routes.push(route);
  }
  return routes;
}

async function tryExpandNavigationMenus(page) {
  const selectors = [
    'button[aria-label*="menu" i]',
    '[aria-controls*="menu" i]',
    '[aria-haspopup="menu"]',
    'button:has-text("Menu")',
    'button:has-text("Menú")',
    'button:has-text("Menú principal")',
    'button:has-text("Abrir menu")',
  ];

  let clicks = 0;
  for (const selector of selectors) {
    const locator = page.locator(selector);
    const count = await locator.count().catch(() => 0);
    const max = Math.min(count, 3);

    for (let idx = 0; idx < max; idx += 1) {
      const target = locator.nth(idx);
      const visible = await target.isVisible().catch(() => false);
      if (!visible) continue;
      const enabled = await target.isEnabled().catch(() => false);
      if (!enabled) continue;

      await target.click({ timeout: 1500 }).catch(() => undefined);
      await page.waitForTimeout(120);
      clicks += 1;
      if (clicks >= 8) {
        return clicks;
      }
    }
  }
  return clicks;
}

async function fetchRoutesFromSitemap(baseUrl, limit = 40) {
  const candidates = [
    buildRouteUrl(baseUrl, "/sitemap.xml"),
    buildRouteUrl(baseUrl, "/sitemap_index.xml"),
  ];
  const baseOrigin = new URL(baseUrl).origin;
  const routes = [];
  const seen = new Set();

  for (const sitemapUrl of candidates) {
    try {
      const response = await fetch(sitemapUrl, {
        cache: "no-store",
        headers: { "user-agent": "SitePulse-QA-RouteDiscovery/1.0" },
      });
      if (!response.ok) continue;
      const xml = await response.text();
      const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/gims)];

      for (const match of matches) {
        if (routes.length >= limit) break;
        const raw = String(match?.[1] ?? "").trim();
        if (!raw) continue;
        const decoded = raw
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, "\"")
          .replace(/&#39;/g, "'");
        const route = toInternalRoute(decoded, baseOrigin);
        if (!route || seen.has(route)) continue;
        seen.add(route);
        routes.push(route);
      }
    } catch {
      // ignore sitemap errors and continue discovery by crawling
    }
    if (routes.length >= limit) break;
  }

  return routes;
}

async function discoverRoutes(page, cfg, args) {
  const seedRoutes = Array.isArray(cfg.routes) ? cfg.routes : [];
  const maxRoutes = Math.max(1, Number(cfg.maxDiscoveredRoutes ?? 40));
  const baseOrigin = new URL(cfg.baseUrl).origin;

  const discovered = [];
  const seenCanonical = new Set();
  const enqueue = (route, source = "seed") => {
    const normalized = normalizeRoutePath(route);
    if (!normalized) return false;
    const canonical = canonicalRouteKey(normalized);
    if (!canonical) return false;
    if (seenCanonical.has(canonical)) return false;
    if (discovered.length >= maxRoutes) return false;
    seenCanonical.add(canonical);
    discovered.push(normalized);
    emitLiveEvent(args, "route_discovered", {
      action: "route_discovery",
      detail: `${source}:${normalized}`,
    });
    return true;
  };

  for (const route of seedRoutes) {
    enqueue(route, "seed");
  }

  if (cfg.discoverFromSitemap) {
    const sitemapRoutes = await fetchRoutesFromSitemap(cfg.baseUrl, maxRoutes);
    for (const route of sitemapRoutes) {
      enqueue(route, "sitemap");
      if (discovered.length >= maxRoutes) break;
    }
  }

  for (let index = 0; index < discovered.length; index += 1) {
    if (discovered.length >= maxRoutes) break;
    const route = discovered[index];
    const routeUrl = buildRouteUrl(cfg.baseUrl, route);

    try {
      await page.goto(routeUrl, {
        waitUntil: "domcontentloaded",
        timeout: cfg.routeLoadTimeoutMs,
      });
      await page.waitForTimeout(250);
      await suppressConsentOverlays(page, cfg, args, routePath);
    } catch {
      continue;
    }

    if (cfg.discoverMenuLinks) {
      await tryExpandNavigationMenus(page);
    }

    const links = await extractInternalRoutesFromPage(page, baseOrigin);
    for (const linkRoute of links) {
      if (enqueue(linkRoute, "link") && discovered.length >= maxRoutes) {
        break;
      }
    }
  }

  return discovered.length > 0 ? discovered : ["/"];
}

async function fingerprint(page) {
  const snap = await page.evaluate(() => {
    const bodyText = (document.body?.innerText ?? "").replace(/\s+/g, " ").trim();
    const dialogs = document.querySelectorAll('[role="dialog"], .modal, [data-state="open"]').length;
    return {
      href: window.location.href,
      title: document.title,
      bodyText,
      rootClass: document.documentElement.className,
      dialogs,
      scrollY: Math.round(window.scrollY),
    };
  });

  return {
    href: snap.href,
    title: snap.title,
    bodyHash: shortHash(snap.bodyText.slice(0, 20000)),
    rootClass: snap.rootClass,
    dialogs: snap.dialogs,
    scrollY: snap.scrollY,
  };
}

async function clickButtonByLabel(page, actionTarget, cfg, counters) {
  const label = normalizeText(actionTarget?.label);
  const href = normalizeText(actionTarget?.href);
  const id = normalizeText(actionTarget?.id);
  const role = normalizeText(actionTarget?.role);
  const kind = normalizeText(actionTarget?.kind || "");

  const resolveTarget = async () => {
    let sawDisabled = false;
    const candidates = [];

    if (id) {
      candidates.push(page.locator(`[id="${escapeLocatorAttr(id)}"]`).first());
    }
    if (href) {
      candidates.push(page.locator(`a[href="${escapeLocatorAttr(href)}"]`).first());
    }

    if (kind === "link" || role === "link") {
      candidates.push(page.getByRole("link", { name: label, exact: true }).first());
      candidates.push(page.getByRole("link", { name: label }).first());
    }
    if (kind === "menuitem" || role === "menuitem") {
      candidates.push(page.getByRole("menuitem", { name: label, exact: true }).first());
      candidates.push(page.getByRole("menuitem", { name: label }).first());
    }
    if (kind === "tab" || role === "tab") {
      candidates.push(page.getByRole("tab", { name: label, exact: true }).first());
      candidates.push(page.getByRole("tab", { name: label }).first());
    }

    candidates.push(page.getByRole("button", { name: label, exact: true }).first());
    candidates.push(page.getByRole("button", { name: label }).first());
    candidates.push(page.getByRole("link", { name: label, exact: true }).first());
    candidates.push(page.getByRole("link", { name: label }).first());
    candidates.push(page.getByRole("menuitem", { name: label, exact: true }).first());
    candidates.push(page.getByRole("menuitem", { name: label }).first());
    candidates.push(page.getByRole("tab", { name: label, exact: true }).first());
    candidates.push(page.getByRole("tab", { name: label }).first());

    for (const candidate of candidates) {
      const visible = await candidate.isVisible().catch(() => false);
      if (!visible) continue;
      const enabled = await candidate.isEnabled().catch(() => true);
      if (!enabled) {
        sawDisabled = true;
        continue;
      }
      return { target: candidate, sawDisabled };
    }
    return { target: null, sawDisabled };
  };

  let resolved = await resolveTarget();
  let target = resolved.target;
  if (!target) {
    await tryExpandNavigationMenus(page).catch(() => undefined);
    resolved = await resolveTarget();
    target = resolved.target;
  }
  if (!target) {
    return {
      ok: false,
      reason: resolved.sawDisabled ? "button_disabled" : "button_not_visible",
    };
  }

  const activeState = await target
    .evaluate((el) => ({
      ariaCurrent: el.getAttribute("aria-current") ?? "",
      ariaSelected: el.getAttribute("aria-selected") ?? "",
      ariaPressed: el.getAttribute("aria-pressed") ?? "",
      dataState: el.getAttribute("data-state") ?? "",
    }))
    .catch(() => null);

  const alreadyActive = !!activeState && (
    activeState.ariaCurrent.toLowerCase() === "true" ||
    activeState.ariaCurrent.toLowerCase() === "page" ||
    activeState.ariaCurrent.toLowerCase() === "step" ||
    activeState.ariaSelected.toLowerCase() === "true" ||
    activeState.ariaPressed.toLowerCase() === "true" ||
    activeState.dataState.toLowerCase() === "active"
  );
  if (alreadyActive) {
    return { ok: false, reason: "button_already_active" };
  }

  const before = await fingerprint(page);
  const beforeReq = counters.requestsFinished;
  const beforeDialogs = counters.dialogs;

  try {
    await target.click({ timeout: cfg.buttonClickTimeoutMs });
  } catch (error) {
    const detail = normalizeText(String(error)).toLowerCase();
    const canForce =
      detail.includes("intercepts pointer events") ||
      detail.includes("not receiving pointer events") ||
      detail.includes("element is outside of the viewport");
    if (!canForce) throw error;
    await target.click({ timeout: cfg.buttonClickTimeoutMs, force: true });
  }
  await page.waitForTimeout(cfg.clickWaitMs);

  const after = await fingerprint(page);
  const effectSignals = [];
  if (before.href !== after.href) effectSignals.push("url_changed");
  if (before.title !== after.title) effectSignals.push("title_changed");
  if (before.bodyHash !== after.bodyHash) effectSignals.push("dom_changed");
  if (before.rootClass !== after.rootClass) effectSignals.push("root_class_changed");
  if (before.dialogs !== after.dialogs) effectSignals.push("dialog_changed");
  if (Math.abs(before.scrollY - after.scrollY) >= cfg.scrollEffectMinPx) effectSignals.push("scroll_changed");
  if (counters.requestsFinished > beforeReq) effectSignals.push("network_request");
  if (counters.dialogs > beforeDialogs) effectSignals.push("dialog_event");

  const effectDetected =
    effectSignals.length > 0;

  return {
    ok: true,
    effectDetected,
    beforeHref: before.href,
    afterHref: after.href,
    navigationChanged: before.href !== after.href,
    effectSignals,
  };
}

function canIgnoreNoEffect(label, cfg) {
  const normalized = label.toLowerCase();
  return cfg.allowedNoEffectButtonContains.some((token) => normalized.includes(token));
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(baseUrl, timeoutMs = 120000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl);
      if (response.status < 500) {
        return;
      }
    } catch {
      // keep waiting
    }
    await wait(1000);
  }
  throw new Error(`Servidor nao respondeu em ${baseUrl} em ${timeoutMs}ms.`);
}

async function killProcessTreeWindows(pid) {
  if (!pid || Number.isNaN(pid)) return;
  await new Promise((resolve) => {
    const killer = spawn("cmd.exe", ["/d", "/s", "/c", `taskkill /PID ${pid} /T /F`], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.on("close", () => resolve());
    killer.on("error", () => resolve());
  });
}

function dedupeIssues(issues) {
  const seen = new Set();
  const deduped = [];
  for (const issue of issues) {
    const key = `${issue.code}|${issue.route}|${issue.action}|${issue.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(issue);
  }
  return deduped;
}

function summarize(report) {
  const count = (code) => report.issues.filter((item) => item.code === code).length;
  const actionSweep = Array.isArray(report.actionSweep) ? report.actionSweep : [];
  const actionCount = (status) => actionSweep.filter((item) => item.status === status).length;
  const seoIssues = Array.isArray(report?.seo?.issues) ? report.seo.issues : [];

  return {
    auditScope: normalizeAuditScope(report?.meta?.auditScope),
    routesChecked: report.routeSweep.length,
    routeLoadFailures: count(CODE.ROUTE_LOAD_FAIL),
    buttonsChecked: report.routeSweep.reduce((acc, item) => acc + item.buttonsDiscovered, 0),
    actionsMapped: actionSweep.length,
    actionsWithEffect: actionCount(ACTION_STATUS.CLICKED_EFFECT),
    actionsNoEffectDetected: actionCount(ACTION_STATUS.CLICKED_NO_EFFECT),
    actionsFailed: actionCount(ACTION_STATUS.CLICK_ERROR),
    actionsAnalysisOnly: actionCount(ACTION_STATUS.ANALYSIS_ONLY) + actionCount(ACTION_STATUS.ROUTE_LIMIT),
    buttonsNoEffect: count(CODE.BTN_NO_EFFECT),
    http4xx: count(CODE.HTTP_4XX),
    http5xx: count(CODE.HTTP_5XX),
    netRequestFailed: count(CODE.NET_REQUEST_FAILED),
    jsRuntimeErrors: count(CODE.JS_RUNTIME_ERROR),
    consoleErrors: count(CODE.CONSOLE_ERROR),
    visualSectionOrderInvalid: count(CODE.VISUAL_SECTION_ORDER_INVALID),
    visualSectionMissing: count(CODE.VISUAL_SECTION_MISSING),
    visualLayoutOverflow: count(CODE.VISUAL_LAYOUT_OVERFLOW),
    visualLayerOverlap: count(CODE.VISUAL_LAYER_OVERLAP),
    visualAlignmentDrift: count(CODE.VISUAL_ALIGNMENT_DRIFT),
    visualTightSpacing: count(CODE.VISUAL_TIGHT_SPACING),
    visualGapInconsistency: count(CODE.VISUAL_GAP_INCONSISTENCY),
    visualEdgeHugging: count(CODE.VISUAL_EDGE_HUGGING),
    visualWidthInconsistency: count(CODE.VISUAL_WIDTH_INCONSISTENCY),
    visualBoundaryCollision: count(CODE.VISUAL_BOUNDARY_COLLISION),
    visualFoldPressure: count(CODE.VISUAL_FOLD_PRESSURE),
    visualHierarchyCollapse: count(CODE.VISUAL_HIERARCHY_COLLAPSE),
    visualClusterCollision: count(CODE.VISUAL_CLUSTER_COLLISION),
    visualQualityIssues:
      count(CODE.VISUAL_SECTION_ORDER_INVALID) +
      count(CODE.VISUAL_SECTION_MISSING) +
      count(CODE.VISUAL_LAYOUT_OVERFLOW) +
      count(CODE.VISUAL_LAYER_OVERLAP) +
      count(CODE.VISUAL_ALIGNMENT_DRIFT) +
      count(CODE.VISUAL_TIGHT_SPACING) +
      count(CODE.VISUAL_GAP_INCONSISTENCY) +
      count(CODE.VISUAL_EDGE_HUGGING) +
      count(CODE.VISUAL_WIDTH_INCONSISTENCY) +
      count(CODE.VISUAL_BOUNDARY_COLLISION) +
      count(CODE.VISUAL_FOLD_PRESSURE) +
      count(CODE.VISUAL_HIERARCHY_COLLAPSE) +
      count(CODE.VISUAL_CLUSTER_COLLISION),
    seoScore: Number(report?.seo?.overallScore ?? 0),
    seoPagesAnalyzed: Number(report?.seo?.pagesAnalyzed ?? 0),
    seoCriticalIssues: seoIssues.filter((item) => item.severity === "high").length,
    seoTotalIssues: seoIssues.length,
    totalIssues: report.issues.length,
  };
}

function buildReplayCommand(args, configPath) {
  const parts = [
    "node src/index.mjs",
    `--config "${configPath}"`,
    "--fresh",
    "--live-log",
    "--human-log",
    `--scope "${normalizeAuditScope(args.auditScope)}"`,
  ];

  if (args.baseUrlOverride) {
    parts.push(`--base-url "${args.baseUrlOverride}"`, "--no-server");
  } else if (args.noServer) {
    parts.push("--no-server");
  }

  if (args.headed) parts.push("--headed");
  if (Number.isFinite(args.viewportWidthOverride) && args.viewportWidthOverride > 0) {
    parts.push(`--viewport-width "${args.viewportWidthOverride}"`);
  }
  if (Number.isFinite(args.viewportHeightOverride) && args.viewportHeightOverride > 0) {
    parts.push(`--viewport-height "${args.viewportHeightOverride}"`);
  }
  if (args.viewportLabel) {
    parts.push(`--viewport-label "${String(args.viewportLabel).replace(/"/g, '\\"')}"`);
  }
  return parts.join(" ");
}

function createEmptyReport(cfg, args, maxRunMs) {
  const configPath = path.resolve(process.cwd(), args.configPath);
  const replayCommand = buildReplayCommand(args, configPath);
  const auditScope = normalizeAuditScope(args.auditScope);

  return {
    meta: {
      project: cfg.name,
      startedAt: nowIso(),
      finishedAt: "",
      baseUrl: cfg.baseUrl,
      serverCommand: cfg.serverCommand,
      serverCwd: cfg.serverCwd,
      headed: args.headed,
      viewport: `${cfg.viewportWidth}x${cfg.viewportHeight}`,
      viewportLabel: String(args.viewportLabel || `${cfg.viewportWidth}x${cfg.viewportHeight}`),
      resumedFromCheckpoint: false,
      paused: false,
      maxRunMs,
      checkpointFile: cfg.checkpointFile,
      configPath,
      replayCommand,
      auditScope,
    },
    progress: {
      nextRouteIndex: 0,
      nextLabelIndex: 0,
      totalRoutes: cfg.routes.length,
      segments: 0,
    },
    routeSweep: [],
    actionSweep: [],
    seo: {
      overallScore: 0,
      pagesAnalyzed: 0,
      categoryScore: { technical: 0, content: 0, accessibility: 0 },
      issues: [],
      topRecommendations: [],
      checklist: [],
      fixPrompt: "",
      pages: [],
    },
    issues: [],
    issueLog: [],
    promptPack: {
      masterPrompt: "",
      prompts: [],
      issuePrompts: [],
    },
    assistantGuide: {
      status: "pending",
      issueCount: 0,
      routePriority: [],
      immediateSteps: [],
      replayCommand,
      quickStartPrompt: "",
      topIssues: [],
    },
    learningMemory: {
      updatedAt: "",
      contextKey: "",
      storePath: "",
      summary: {
        entries: 0,
        validatedEntries: 0,
        failedEntries: 0,
        partialEntries: 0,
        promotedEntries: 0,
      },
      entries: [],
    },
    summary: {},
  };
}

function normalizeCheckpointReport(report, cfg, args, maxRunMs) {
  if (!report || typeof report !== "object") {
    return createEmptyReport(cfg, args, maxRunMs);
  }

  if (!report.meta || typeof report.meta !== "object") {
    report.meta = {};
  }
  report.meta.auditScope = normalizeAuditScope(args.auditScope ?? report.meta.auditScope);
  if (!report.progress || typeof report.progress !== "object") {
    report.progress = {
      nextRouteIndex: 0,
      nextLabelIndex: 0,
      totalRoutes: cfg.routes.length,
      segments: 0,
    };
  }
  if (!Array.isArray(report.routeSweep)) report.routeSweep = [];
  if (!Array.isArray(report.actionSweep)) report.actionSweep = [];
  if (!report.seo || typeof report.seo !== "object") {
    report.seo = {
      overallScore: 0,
      pagesAnalyzed: 0,
      categoryScore: { technical: 0, content: 0, accessibility: 0 },
      issues: [],
      topRecommendations: [],
      checklist: [],
      fixPrompt: "",
      pages: [],
    };
  }
  if (!Array.isArray(report.seo.pages)) report.seo.pages = [];
  if (!Array.isArray(report.seo.issues)) report.seo.issues = [];
  if (!Array.isArray(report.seo.topRecommendations)) report.seo.topRecommendations = [];
  if (!Array.isArray(report.seo.checklist)) report.seo.checklist = [];
  if (typeof report.seo.fixPrompt !== "string") report.seo.fixPrompt = "";
  if (!Array.isArray(report.issues)) report.issues = [];
  if (!Array.isArray(report.issueLog)) report.issueLog = [];
  if (!report.promptPack || typeof report.promptPack !== "object") {
    report.promptPack = { masterPrompt: "", prompts: [], issuePrompts: [] };
  }
  if (!Array.isArray(report.promptPack.issuePrompts)) report.promptPack.issuePrompts = [];
  if (!report.assistantGuide || typeof report.assistantGuide !== "object") {
    report.assistantGuide = {
      status: "pending",
      issueCount: 0,
      routePriority: [],
      immediateSteps: [],
      replayCommand: "",
      quickStartPrompt: "",
      topIssues: [],
    };
  }
  if (!report.learningMemory || typeof report.learningMemory !== "object") {
    report.learningMemory = {
      updatedAt: "",
      contextKey: "",
      storePath: "",
      summary: {
        entries: 0,
        validatedEntries: 0,
        failedEntries: 0,
        partialEntries: 0,
        promotedEntries: 0,
      },
      entries: [],
    };
  }

  report.meta.project = cfg.name;
  report.meta.baseUrl = cfg.baseUrl;
  report.meta.serverCommand = cfg.serverCommand;
  report.meta.serverCwd = cfg.serverCwd;
  report.meta.headed = args.headed;
  report.meta.viewport = `${cfg.viewportWidth}x${cfg.viewportHeight}`;
  report.meta.viewportLabel = String(args.viewportLabel || `${cfg.viewportWidth}x${cfg.viewportHeight}`);
  report.meta.resumedFromCheckpoint = true;
  report.meta.paused = false;
  report.meta.maxRunMs = maxRunMs;
  report.meta.checkpointFile = cfg.checkpointFile;
  report.meta.configPath = path.resolve(process.cwd(), args.configPath);
  report.meta.replayCommand = buildReplayCommand(args, report.meta.configPath);
  report.meta.finishedAt = "";

  report.assistantGuide.replayCommand = report.meta.replayCommand;

  report.progress.totalRoutes = cfg.routes.length;
  report.progress.nextRouteIndex = Math.max(0, Math.min(Number(report.progress.nextRouteIndex ?? 0), cfg.routes.length));
  report.progress.nextLabelIndex = Math.max(0, Number(report.progress.nextLabelIndex ?? 0));
  report.progress.segments = Math.max(0, Number(report.progress.segments ?? 0));

  return report;
}

async function loadCheckpoint(checkpointFile) {
  if (!(await fileExists(checkpointFile))) {
    return null;
  }

  const payload = await readJson(checkpointFile);
  if (!payload || payload.version !== CHECKPOINT_VERSION || !payload.report) {
    return null;
  }
  return payload.report;
}

async function saveCheckpoint(checkpointFile, report) {
  const dir = path.dirname(checkpointFile);
  await fs.mkdir(dir, { recursive: true });
  const payload = {
    version: CHECKPOINT_VERSION,
    savedAt: nowIso(),
    report,
  };
  await fs.writeFile(checkpointFile, JSON.stringify(payload, null, 2), "utf8");
}

async function clearCheckpoint(checkpointFile) {
  if (await fileExists(checkpointFile)) {
    await fs.unlink(checkpointFile);
  }
}

async function clearPauseRequest(pauseRequestFile) {
  if (!pauseRequestFile) return;
  if (await fileExists(pauseRequestFile)) {
    await fs.unlink(pauseRequestFile);
  }
}

async function isPauseRequested(pauseRequestFile) {
  if (!pauseRequestFile) return false;
  return await fileExists(pauseRequestFile);
}

function ensureRouteResult(report, route) {
  let found = report.routeSweep.find((item) => item.route === route);
  if (found) return found;

  found = {
    route,
    loadOk: true,
    buttonsDiscovered: 0,
    buttonsClicked: 0,
  };
  report.routeSweep.push(found);
  return found;
}

function upsertSeoPage(report, pageResult) {
  if (!report?.seo || !Array.isArray(report.seo.pages)) return;
  const index = report.seo.pages.findIndex((item) => item.route === pageResult.route);
  if (index >= 0) {
    report.seo.pages[index] = pageResult;
    return;
  }
  report.seo.pages.push(pageResult);
}

function shouldPauseByTime(runStartedAt, maxRunMs) {
  return maxRunMs > 0 && Date.now() - runStartedAt >= maxRunMs;
}

function shouldPauseExecution(runStartedAt, maxRunMs, externalPauseRequested) {
  return externalPauseRequested === true || shouldPauseByTime(runStartedAt, maxRunMs);
}

function hasTruthyEnv(key) {
  const value = process.env[key];
  if (value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "0" && normalized !== "false" && normalized !== "off";
}

function isServerlessRuntime() {
  return SERVERLESS_ENV_KEYS.some((key) => hasTruthyEnv(key));
}

function resolveWritableReportPaths(reportDir, checkpointFile) {
  if (!isServerlessRuntime()) {
    return {
      reportDir,
      checkpointFile,
    };
  }

  const tmpBase = path.join(os.tmpdir(), "sitepulse-qa");
  const reportName = path.basename(reportDir || "reports");
  const checkpointName = path.basename(checkpointFile || "sitepulse-checkpoint.json");

  return {
    reportDir: path.join(tmpBase, reportName || "reports"),
    checkpointFile: path.join(tmpBase, checkpointName || "sitepulse-checkpoint.json"),
  };
}

function pathFromUrl(input) {
  if (!input) return "";
  try {
    return new URL(input).pathname.toLowerCase();
  } catch {
    return String(input).toLowerCase();
  }
}

function isTelemetryRequestUrl(requestUrl) {
  const lower = String(requestUrl ?? "").toLowerCase();
  return TELEMETRY_DOMAINS.some((domain) => lower.includes(domain));
}

function isLikelyStaticAssetRequest(requestUrl, resourceType) {
  const lowerType = String(resourceType ?? "").toLowerCase();
  if (["image", "media", "font", "stylesheet"].includes(lowerType)) {
    return true;
  }
  const pathname = pathFromUrl(requestUrl);
  if (pathname.includes("/_next/static/") || pathname.includes("/static/chunks/")) {
    return true;
  }
  if (lowerType === "script" && pathname.includes("/_next/") && pathname.endsWith(".js")) {
    return true;
  }
  if (pathname.includes("/assets/images/")) {
    return true;
  }
  return STATIC_ASSET_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

function shouldIgnoreRequestFailureNoise(input) {
  const failureLower = String(input.failureText ?? "").toLowerCase();
  if (!failureLower) return false;

  if (isTelemetryRequestUrl(input.requestUrl)) {
    return true;
  }

  if (input.serverlessMode && failureLower.includes("err_insufficient_resources")) {
    if (isLikelyStaticAssetRequest(input.requestUrl, input.resourceType)) {
      return true;
    }
  }

  return false;
}

function shouldIgnoreConsoleNoise(detail, serverlessMode) {
  const lower = String(detail ?? "").toLowerCase();
  if (!lower) return false;

  const analyticsCspBlocked =
    lower.includes("google-analytics.com") &&
    lower.includes("content security policy");

  if (analyticsCspBlocked) {
    return true;
  }

  if (serverlessMode && lower.includes("failed to load resource") && lower.includes("err_insufficient_resources")) {
    return true;
  }

  return false;
}

async function resolveChromiumLaunchPlan(args) {
  const defaultPlan = {
    engine: "playwright",
    options: {
      headless: !args.headed,
    },
  };

  if (!isServerlessRuntime()) {
    return defaultPlan;
  }

  let chromiumPack;
  try {
    const chromiumModule = await import("@sparticuz/chromium");
    chromiumPack = chromiumModule.default ?? chromiumModule;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`serverless_chromium_dependency_missing: ${message}`);
  }

  let executablePath = "";
  try {
    executablePath = await chromiumPack.executablePath();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`serverless_chromium_path_error: ${message}`);
  }

  if (!executablePath) {
    throw new Error("serverless_chromium_path_error: empty_executable_path");
  }

  return {
    engine: "sparticuz",
    options: {
      headless: true,
      executablePath,
      args: Array.isArray(chromiumPack.args) ? chromiumPack.args : [],
    },
  };
}

async function finalizeReport(report, reportDir, paused) {
  report.meta.finishedAt = nowIso();
  report.meta.paused = paused;
  report.issues = dedupeIssues(report.issues);
  report.issues = report.issues.map((issue) => hydrateIssue(issue));
  report.issueLog = report.issues.map((issue) => createIssueLogEntry(issue));
  finalizeSeoReport(report, shouldRunSeoForScope(report?.meta?.auditScope));
  if (!paused) {
    const runtimeResult = ingestCompletedRun(activeLearningRuntime.store, report);
    activeLearningRuntime.store = runtimeResult.store;
    await saveIssueLearningStore(reportDir, activeLearningRuntime.store);
    report.learningMemory = attachLearningSnapshot(activeLearningRuntime.store, report, activeLearningRuntime.storePath);
    report.issues = report.issues.map((issue) => hydrateIssue(issue));
    report.issueLog = report.issues.map((issue) => createIssueLogEntry(issue));
    finalizeSeoReport(report, shouldRunSeoForScope(report?.meta?.auditScope));
  } else {
    report.learningMemory = attachLearningSnapshot(activeLearningRuntime.store, report, activeLearningRuntime.storePath);
  }
  report.promptPack = buildPromptPack(report.issues);
  report.assistantGuide = buildAssistantGuide(report);
  report.summary = summarize(report);
}

async function writeReportArtifacts(report, reportDir, paused) {
  await fs.mkdir(reportDir, { recursive: true });
  const stamp = nowStamp();
  const suffix = paused ? "partial" : "final";
  const jsonPath = path.join(reportDir, `${stamp}-sitepulse-report-${suffix}.json`);
  const mdPath = path.join(reportDir, `${stamp}-sitepulse-report-${suffix}.md`);
  const issueLogPath = path.join(reportDir, `${stamp}-sitepulse-issues-${suffix}.log`);
  const assistantBriefPath = path.join(reportDir, `${stamp}-sitepulse-assistant-${suffix}.txt`);
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");
  await fs.writeFile(mdPath, toMarkdown(report), "utf8");
  await fs.writeFile(issueLogPath, toIssueLog(report), "utf8");
  await fs.writeFile(assistantBriefPath, toAssistantBrief(report), "utf8");
  return { jsonPath, mdPath, issueLogPath, assistantBriefPath };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  args.auditScope = normalizeAuditScope(args.auditScope);
  const configPath = path.resolve(process.cwd(), args.configPath);
  const configDir = path.dirname(configPath);
  const rawConfig = await readJson(configPath);
  const cfgBase = normalizeConfig(rawConfig, configDir);
  const cfg = {
    ...cfgBase,
    baseUrl: args.baseUrlOverride ? String(args.baseUrlOverride) : cfgBase.baseUrl,
    viewportWidth:
      Number.isFinite(args.viewportWidthOverride) && args.viewportWidthOverride > 0
        ? Math.max(320, Number(args.viewportWidthOverride))
        : cfgBase.viewportWidth,
    viewportHeight:
      Number.isFinite(args.viewportHeightOverride) && args.viewportHeightOverride > 0
        ? Math.max(320, Number(args.viewportHeightOverride))
        : cfgBase.viewportHeight,
  };
  activeLearningRuntime = await loadIssueLearningStore(cfg.reportDir);
  cfg.pauseRequestFile = args.pauseRequestFile
    ? path.resolve(process.cwd(), args.pauseRequestFile)
    : path.join(cfg.reportDir, "sitepulse-pause-request.flag");
  const baseOrigin = new URL(cfg.baseUrl).origin;

  let maxRunMs = args.maxRunMs ?? (cfg.maxRunMs > 0 ? cfg.maxRunMs : 0);
  const serverlessMode = isServerlessRuntime();
  if (serverlessMode) {
    if (maxRunMs <= 0 || maxRunMs > 55000) {
      maxRunMs = 55000;
    }
    cfg.maxActionsPerRoute = Math.min(Math.max(1, cfg.maxActionsPerRoute), 6);
    cfg.maxActionRoutes = cfg.maxActionRoutes > 0 ? Math.min(cfg.maxActionRoutes, 1) : 1;
    cfg.clickWaitMs = Math.min(cfg.clickWaitMs, 250);
    cfg.buttonClickTimeoutMs = Math.min(cfg.buttonClickTimeoutMs, 2200);
  }

  if (args.fresh) {
    await clearCheckpoint(cfg.checkpointFile);
  }
  await clearPauseRequest(cfg.pauseRequestFile);

  let report = createEmptyReport(cfg, args, maxRunMs);
  if (!args.noResume) {
    const restored = await loadCheckpoint(cfg.checkpointFile);
    if (restored) {
      report = normalizeCheckpointReport(restored, cfg, args, maxRunMs);
    }
  }

  report.progress.segments += 1;
  report.meta.auditScope = args.auditScope;

  const shouldAuditSeo = shouldRunSeoForScope(args.auditScope);
  const shouldAuditExperience = shouldRunExperienceForScope(args.auditScope);

  let currentRoute = "(none)";
  let currentAction = "";
  let paused = false;
  let clicksSinceLastCheckpoint = 0;
  let externalPauseRequested = false;
  let pauseSignalLogged = false;

  const runStartedAt = Date.now();

  const requestExternalPause = (signal) => {
    if (externalPauseRequested) return;
    externalPauseRequested = true;
    if (!pauseSignalLogged) {
      pauseSignalLogged = true;
      emitLiveEvent(args, "runner_pause_requested", {
        route: currentRoute,
        action: currentAction || "pause_request",
        detail: `External pause requested via ${signal}. Saving the checkpoint at the next safe boundary.`,
        totalRoutes: cfg.routes.length,
      });
    }
  };

  const onSigint = () => {
    requestExternalPause("SIGINT");
  };
  const onSigterm = () => {
    requestExternalPause("SIGTERM");
  };

  process.on("SIGINT", onSigint);
  process.on("SIGTERM", onSigterm);

  let server = null;
  if (!args.noServer) {
    server = spawn("cmd.exe", ["/d", "/s", "/c", cfg.serverCommand], {
      cwd: cfg.serverCwd,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    server.stdout.on("data", () => {
      // kept intentionally empty (drain stream)
    });
    server.stderr.on("data", () => {
      // kept intentionally empty (drain stream)
    });
  }

  const counters = {
    requestsFinished: 0,
    dialogs: 0,
  };

  let browser = null;

  try {
    if (!args.noServer) {
      await waitForServer(`${cfg.baseUrl}/`);
    }
    emitLiveEvent(args, "runner_ready", {
      action: "boot",
      detail: `baseUrl=${cfg.baseUrl} routes=${cfg.routes.length}`,
      totalRoutes: cfg.routes.length,
    });

    const launchPlan = await resolveChromiumLaunchPlan(args);
    emitLiveEvent(args, "runner_engine", {
      action: "engine_select",
      detail: `engine=${launchPlan.engine} headed=${args.headed ? "requested" : "no"}`,
      totalRoutes: cfg.routes.length,
    });
    browser = await chromium.launch(launchPlan.options);
    const context = await browser.newContext({ viewport: { width: cfg.viewportWidth, height: cfg.viewportHeight } });
    const page = await context.newPage();

    if (cfg.autoDiscoverRoutes) {
      emitLiveEvent(args, "route_discovery_start", {
        action: "route_discovery",
        detail: `seed=${cfg.routes.length} max=${cfg.maxDiscoveredRoutes}`,
        totalRoutes: cfg.routes.length,
      });
      const discoveredRoutes = await discoverRoutes(page, cfg, args);
      cfg.routes = discoveredRoutes;
      report.progress.totalRoutes = cfg.routes.length;
      report.progress.nextRouteIndex = Math.max(
        0,
        Math.min(Number(report.progress.nextRouteIndex ?? 0), cfg.routes.length),
      );
      emitLiveEvent(args, "route_discovery_done", {
        action: "route_discovery",
        detail: `total=${cfg.routes.length}`,
        totalRoutes: cfg.routes.length,
      });
    }

    page.on("dialog", async (dialog) => {
      counters.dialogs += 1;
      try {
        await dialog.dismiss();
      } catch {
        // ignore
      }
    });

    page.on("pageerror", (error) => {
      pushIssue(report, {
        code: CODE.JS_RUNTIME_ERROR,
        severity: severityFromCode(CODE.JS_RUNTIME_ERROR),
        route: currentRoute,
        action: currentAction,
        detail: normalizeText(error.message) || "Erro JS em runtime.",
        url: page.url(),
      });
    });

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const detail = normalizeText(msg.text()) || "Erro de console.";
      if (shouldIgnoreConsoleNoise(detail, serverlessMode)) {
        return;
      }
      pushIssue(report, {
        code: CODE.CONSOLE_ERROR,
        severity: severityFromCode(CODE.CONSOLE_ERROR),
        route: currentRoute,
        action: currentAction,
        detail,
        url: page.url(),
      });
    });

    page.on("requestfinished", () => {
      counters.requestsFinished += 1;
    });

    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText ?? "request_failed";
      const ignored = cfg.ignoredRequestFailedErrors.some((token) => failure.toLowerCase().includes(token));
      if (ignored) return;
      const requestUrl = request.url();
      const requestResourceType = typeof request.resourceType === "function" ? request.resourceType() : "";
      if (
        shouldIgnoreRequestFailureNoise({
          requestUrl,
          resourceType: requestResourceType,
          failureText: failure,
          serverlessMode,
        })
      ) {
        return;
      }
      pushIssue(report, {
        code: CODE.NET_REQUEST_FAILED,
        severity: severityFromCode(CODE.NET_REQUEST_FAILED),
        route: currentRoute,
        action: currentAction,
        detail: `${request.method()} ${requestUrl} :: ${failure}`,
        url: page.url(),
      });
    });

    page.on("response", (response) => {
      const status = response.status();
      if (status < 400) return;
      const code = status >= 500 ? CODE.HTTP_5XX : CODE.HTTP_4XX;
      pushIssue(report, {
        code,
        severity: severityFromCode(code),
        route: currentRoute,
        action: currentAction,
        detail: `${status} ${response.request().method()} ${response.url()}`,
        url: page.url(),
      });
    });

    routeLoop: for (let routeIndex = report.progress.nextRouteIndex; routeIndex < cfg.routes.length; routeIndex += 1) {
      if (shouldPauseExecution(runStartedAt, maxRunMs, externalPauseRequested) || (await isPauseRequested(cfg.pauseRequestFile))) {
        paused = true;
        report.progress.nextRouteIndex = routeIndex;
        report.progress.nextLabelIndex = 0;
        break;
      }

      const route = cfg.routes[routeIndex];
      currentRoute = route;
      currentAction = "route_load";
      const routeUrl = buildRouteUrl(cfg.baseUrl, route);
      emitLiveEvent(args, "route_start", {
        route,
        action: "route_load",
        detail: `route ${routeIndex + 1}/${cfg.routes.length}`,
        routeIndex: routeIndex + 1,
        totalRoutes: cfg.routes.length,
      });

      const routeResult = ensureRouteResult(report, route);
      routeResult.loadOk = true;

      try {
        await page.goto(routeUrl, {
          waitUntil: "domcontentloaded",
          timeout: cfg.routeLoadTimeoutMs,
        });
        await page.waitForTimeout(300);
        await suppressConsentOverlays(page, cfg, args, route);
      } catch (error) {
        routeResult.loadOk = false;
        emitLiveEvent(args, "route_error", {
          route,
          action: "route_load",
          detail: normalizeText(String(error)),
          routeIndex: routeIndex + 1,
          totalRoutes: cfg.routes.length,
        });
        pushIssue(report, {
          code: CODE.ROUTE_LOAD_FAIL,
          severity: severityFromCode(CODE.ROUTE_LOAD_FAIL),
          route,
          detail: normalizeText(String(error)),
          url: routeUrl,
        });
        report.progress.nextRouteIndex = routeIndex + 1;
        report.progress.nextLabelIndex = 0;
        await saveCheckpoint(cfg.checkpointFile, report);
        continue;
      }
      emitLiveEvent(args, "route_loaded", {
        route,
        action: "route_load",
        routeIndex: routeIndex + 1,
        totalRoutes: cfg.routes.length,
      });

      if (shouldAuditExperience && (cfg.sectionOrderRules.length || cfg.visualAnalyzer?.enabled)) {
        await suppressConsentOverlays(page, cfg, args, route);
        currentAction = "visual_layout_check";
        emitLiveEvent(args, "layout_check_start", {
          route,
          action: "visual_layout_check",
          routeIndex: routeIndex + 1,
          totalRoutes: cfg.routes.length,
        });
        const findings = [
          ...(cfg.sectionOrderRules.length ? await runSectionOrderChecks(page, route, cfg) : []),
          ...(cfg.visualAnalyzer?.enabled ? await runVisualInterfaceChecks(page, route, cfg) : []),
        ];
        for (const finding of findings) {
          if (finding.status === "missing") {
            const evidence = await captureSectionRuleEvidence(
              page,
              finding,
              cfg.reportDir,
              route,
              CODE.VISUAL_SECTION_MISSING,
            );
            emitLiveEvent(args, "layout_check_issue", {
              route,
              action: `layout_rule:${finding.id}`,
              rule: finding.id,
              status: "missing",
              routeIndex: routeIndex + 1,
              totalRoutes: cfg.routes.length,
            });
            pushIssue(report, {
              code: CODE.VISUAL_SECTION_MISSING,
              severity: severityFromCode(CODE.VISUAL_SECTION_MISSING),
              route,
              action: `layout_rule:${finding.id}`,
              detail: formatSectionMissingDetail(finding),
              url: page.url(),
              evidence,
            });
          } else if (finding.status === "order_invalid") {
            const evidence = await captureSectionRuleEvidence(
              page,
              finding,
              cfg.reportDir,
              route,
              CODE.VISUAL_SECTION_ORDER_INVALID,
            );
            emitLiveEvent(args, "layout_check_issue", {
              route,
              action: `layout_rule:${finding.id}`,
              rule: finding.id,
              status: "order_invalid",
              routeIndex: routeIndex + 1,
              totalRoutes: cfg.routes.length,
            });
            pushIssue(report, {
              code: CODE.VISUAL_SECTION_ORDER_INVALID,
              severity: severityFromCode(CODE.VISUAL_SECTION_ORDER_INVALID),
              route,
              action: `layout_rule:${finding.id}`,
              detail: formatSectionOrderDetail(finding),
              url: page.url(),
              evidence,
            });
          } else if (
            finding.code === CODE.VISUAL_LAYOUT_OVERFLOW ||
            finding.code === CODE.VISUAL_LAYER_OVERLAP ||
            finding.code === CODE.VISUAL_ALIGNMENT_DRIFT ||
            finding.code === CODE.VISUAL_TIGHT_SPACING ||
            finding.code === CODE.VISUAL_GAP_INCONSISTENCY ||
            finding.code === CODE.VISUAL_EDGE_HUGGING ||
            finding.code === CODE.VISUAL_WIDTH_INCONSISTENCY ||
            finding.code === CODE.VISUAL_BOUNDARY_COLLISION ||
            finding.code === CODE.VISUAL_FOLD_PRESSURE ||
            finding.code === CODE.VISUAL_HIERARCHY_COLLAPSE ||
            finding.code === CODE.VISUAL_CLUSTER_COLLISION
          ) {
            const evidence = await captureVisualFindingEvidence(page, finding, cfg.reportDir, route, cfg);
            emitLiveEvent(args, "layout_check_issue", {
              route,
              action: finding.action,
              rule: finding.code,
              status: "visual_quality_issue",
              routeIndex: routeIndex + 1,
              totalRoutes: cfg.routes.length,
            });
            pushIssue(report, {
              code: finding.code,
              severity: severityFromCode(finding.code),
              route,
              action: finding.action,
              detail: formatVisualAnalyzerDetail(finding),
              url: page.url(),
              evidence,
            });
          }
        }
      }

      if (shouldAuditExperience && cfg.discoverMenuLinks) {
        await tryExpandNavigationMenus(page).catch(() => undefined);
        await suppressConsentOverlays(page, cfg, args, route);
      }
      const discoveredActions = shouldAuditExperience ? await extractButtonLabels(page, baseOrigin) : [];
      const actionsToClick =
        cfg.maxActionsPerRoute > 0
          ? discoveredActions.slice(0, Math.min(discoveredActions.length, cfg.maxActionsPerRoute))
          : [];
      routeResult.buttonsDiscovered = Math.max(routeResult.buttonsDiscovered, discoveredActions.length);

      const seoPage = shouldAuditSeo ? await captureSeoSnapshot(page, route).catch(() => null) : null;
      if (seoPage) {
        upsertSeoPage(report, seoPage);
        const languageConflictIssue = buildLanguageConflictIssue(seoPage);
        if (languageConflictIssue) {
          pushIssue(report, languageConflictIssue);
        }
      }

      if (!shouldAuditExperience) {
        emitLiveEvent(args, "button_sweep_skipped", {
          route,
          action: "button_sweep",
          detail: "scope=seo",
          routeIndex: routeIndex + 1,
          totalRoutes: cfg.routes.length,
        });
        report.progress.nextRouteIndex = routeIndex + 1;
        report.progress.nextLabelIndex = 0;
        await saveCheckpoint(cfg.checkpointFile, report);
        clicksSinceLastCheckpoint = 0;
        continue;
      }

      const shouldAuditActions = cfg.maxActionRoutes <= 0 || routeIndex < cfg.maxActionRoutes;
      if (!shouldAuditActions) {
        const preview = discoveredActions.slice(0, 80);
        for (let idx = 0; idx < preview.length; idx += 1) {
          const actionItem = preview[idx];
          const intent = inferActionIntent(actionItem);
          report.actionSweep.push(
            makeActionRecord({
              index: idx,
              route,
              label: actionItem.label,
              kind: actionItem.kind,
              href: actionItem.href,
              role: actionItem.role,
              expectedFunction: intent.expectedFunction,
              expectedTechnical: intent.expectedTechnical,
              expectedForUser: intent.userExplanation,
              status: ACTION_STATUS.ROUTE_LIMIT,
              actualFunction: "Acao mapeada, mas nao executada nesta rota por limite configurado.",
              detail: "Modo de amostragem de rotas para performance.",
              beforeUrl: routeUrl,
              afterUrl: page.url(),
              area: intent.area,
            }),
          );
        }
        emitLiveEvent(args, "button_route_skipped", {
          route,
          action: "button_sweep",
          detail: "route_limit",
          routeIndex: routeIndex + 1,
          totalRoutes: cfg.routes.length,
        });
        report.progress.nextRouteIndex = routeIndex + 1;
        report.progress.nextLabelIndex = 0;
        await saveCheckpoint(cfg.checkpointFile, report);
        clicksSinceLastCheckpoint = 0;
        continue;
      }

      if (actionsToClick.length === 0 && discoveredActions.length > 0) {
        const preview = discoveredActions.slice(0, 80);
        for (let idx = 0; idx < preview.length; idx += 1) {
          const actionItem = preview[idx];
          const intent = inferActionIntent(actionItem);
          report.actionSweep.push(
            makeActionRecord({
              index: idx,
              route,
              label: actionItem.label,
              kind: actionItem.kind,
              href: actionItem.href,
              role: actionItem.role,
              expectedFunction: intent.expectedFunction,
              expectedTechnical: intent.expectedTechnical,
              expectedForUser: intent.userExplanation,
              status: ACTION_STATUS.ANALYSIS_ONLY,
              actualFunction: "Acao apenas mapeada (sem clique) para priorizar cobertura de paginas.",
              detail: "Modo serverless / analise rapida.",
              beforeUrl: routeUrl,
              afterUrl: page.url(),
              area: intent.area,
            }),
          );
        }
      }

      let labelStartIndex = routeIndex === report.progress.nextRouteIndex ? report.progress.nextLabelIndex : 0;
      if (labelStartIndex < 0) labelStartIndex = 0;
      if (labelStartIndex > actionsToClick.length) labelStartIndex = actionsToClick.length;

      for (let labelIndex = labelStartIndex; labelIndex < actionsToClick.length; labelIndex += 1) {
        if (shouldPauseExecution(runStartedAt, maxRunMs, externalPauseRequested) || (await isPauseRequested(cfg.pauseRequestFile))) {
          paused = true;
          report.progress.nextRouteIndex = routeIndex;
          report.progress.nextLabelIndex = labelIndex;
          break routeLoop;
        }

        const actionItem = actionsToClick[labelIndex];
        const label = actionItem.label;
        const intent = inferActionIntent(actionItem);
        currentAction = label;
        emitLiveEvent(args, "button_click_start", {
          route,
          action: label,
          label,
          labelIndex: labelIndex + 1,
          totalLabels: actionsToClick.length,
          routeIndex: routeIndex + 1,
          totalRoutes: cfg.routes.length,
        });

        try {
          const currentPath = normalizeRoutePath(tryParsePathname(page.url()));
          if (canonicalRouteKey(currentPath) !== canonicalRouteKey(route)) {
            await page.goto(routeUrl, {
              waitUntil: "domcontentloaded",
              timeout: cfg.routeLoadTimeoutMs,
            });
            await page.waitForTimeout(250);
            await suppressConsentOverlays(page, cfg, args, route);
          }

          const beforeUrl = page.url();
          const result = await clickButtonByLabel(page, actionItem, cfg, counters);
          const status = describeActionResult(result);
          const actualFunction = inferActualFunctionFromResult(result);

          report.actionSweep.push(
            makeActionRecord({
              index: labelIndex,
              route,
              label,
              kind: actionItem.kind,
              href: actionItem.href,
              role: actionItem.role,
              expectedFunction: intent.expectedFunction,
              expectedTechnical: intent.expectedTechnical,
              expectedForUser: intent.userExplanation,
              status,
              actualFunction,
              detail: result?.reason ? `Motivo: ${result.reason}` : "",
              effectDetected: Boolean(result?.effectDetected),
              beforeUrl: result?.beforeHref || beforeUrl,
              afterUrl: result?.afterHref || page.url(),
              area: intent.area,
              signals: result?.effectSignals || [],
            }),
          );

          if (!result.ok) {
            emitLiveEvent(args, "button_click_skip", {
              route,
              action: label,
              label,
              reason: result.reason,
              labelIndex: labelIndex + 1,
              totalLabels: actionsToClick.length,
              routeIndex: routeIndex + 1,
              totalRoutes: cfg.routes.length,
            });
            if (
              result.reason !== "button_disabled" &&
              result.reason !== "button_not_visible" &&
              result.reason !== "button_already_active"
            ) {
              pushIssue(report, {
                code: CODE.BTN_CLICK_ERROR,
                severity: severityFromCode(CODE.BTN_CLICK_ERROR),
                route,
                action: label,
                detail: `Falha no clique: ${result.reason}`,
                url: page.url(),
              });
            }
          } else {
            routeResult.buttonsClicked += 1;
            emitLiveEvent(args, "button_click_result", {
              route,
              action: label,
              label,
              effectDetected: result.effectDetected,
              labelIndex: labelIndex + 1,
              totalLabels: actionsToClick.length,
              routeIndex: routeIndex + 1,
              totalRoutes: cfg.routes.length,
            });

            if (cfg.requireButtonEffect && !result.effectDetected && !canIgnoreNoEffect(label, cfg)) {
              pushIssue(report, {
                code: CODE.BTN_NO_EFFECT,
                severity: severityFromCode(CODE.BTN_NO_EFFECT),
                route,
                action: label,
                detail: "Clique sem efeito observavel (URL, DOM, request, dialog, scroll).",
                url: page.url(),
              });
            }
          }
        } catch (error) {
          const beforeUrl = page.url();
          const detail = normalizeText(String(error));
          report.actionSweep.push(
            makeActionRecord({
              index: labelIndex,
              route,
              label,
              kind: actionItem.kind,
              href: actionItem.href,
              role: actionItem.role,
              expectedFunction: intent.expectedFunction,
              expectedTechnical: intent.expectedTechnical,
              expectedForUser: intent.userExplanation,
              status: ACTION_STATUS.CLICK_ERROR,
              actualFunction: "Falha tecnica ao executar clique.",
              detail,
              effectDetected: false,
              beforeUrl,
              afterUrl: page.url(),
              area: intent.area,
            }),
          );
          emitLiveEvent(args, "button_click_error", {
            route,
            action: label,
            label,
            detail,
            labelIndex: labelIndex + 1,
            totalLabels: actionsToClick.length,
            routeIndex: routeIndex + 1,
            totalRoutes: cfg.routes.length,
          });
          pushIssue(report, {
            code: CODE.BTN_CLICK_ERROR,
            severity: severityFromCode(CODE.BTN_CLICK_ERROR),
            route,
            action: label,
            detail,
            url: page.url(),
          });
        }

        report.progress.nextRouteIndex = routeIndex;
        report.progress.nextLabelIndex = labelIndex + 1;

        clicksSinceLastCheckpoint += 1;
        if (cfg.checkpointEveryClicks > 0 && clicksSinceLastCheckpoint >= cfg.checkpointEveryClicks) {
          await saveCheckpoint(cfg.checkpointFile, report);
          clicksSinceLastCheckpoint = 0;
        }
      }

      if (!paused) {
        report.progress.nextRouteIndex = routeIndex + 1;
        report.progress.nextLabelIndex = 0;
      }

      await saveCheckpoint(cfg.checkpointFile, report);
      clicksSinceLastCheckpoint = 0;

      if (paused) {
        break;
      }
    }
  } finally {
    process.off("SIGINT", onSigint);
    process.off("SIGTERM", onSigterm);
    if (browser) {
      await browser.close().catch(() => undefined);
    }
    if (server?.pid) {
      await killProcessTreeWindows(server.pid);
    }
  }

  const finished = !paused && report.progress.nextRouteIndex >= cfg.routes.length;
  if (finished) {
    report.progress.nextRouteIndex = cfg.routes.length;
    report.progress.nextLabelIndex = 0;
  }

  await finalizeReport(report, cfg.reportDir, paused);
  const artifacts = await writeReportArtifacts(report, cfg.reportDir, paused);

  if (paused) {
    await saveCheckpoint(cfg.checkpointFile, report);
  } else {
    await clearCheckpoint(cfg.checkpointFile);
  }
  await clearPauseRequest(cfg.pauseRequestFile);

  const output = {
    ok: !paused && report.summary.totalIssues === 0,
    paused,
    resumedFromCheckpoint: report.meta.resumedFromCheckpoint,
    progress: report.progress,
    summary: report.summary,
    checkpointFile: cfg.checkpointFile,
    jsonReport: artifacts.jsonPath,
    markdownReport: artifacts.mdPath,
    issueLog: artifacts.issueLogPath,
    assistantBrief: artifacts.assistantBriefPath,
  };

  const firstStep = report.assistantGuide?.immediateSteps?.[0] ?? "Sem passo pendente.";
  emitLiveEvent(args, "assistant_hint_ready", {
    action: "assistant_playbook",
    detail: firstStep,
    report: artifacts.assistantBriefPath,
    totalRoutes: cfg.routes.length,
  });

  emitLiveEvent(args, "runner_finished", {
    action: "finish",
    paused,
    ok: output.ok,
    totalIssues: report.summary.totalIssues,
    totalRoutes: cfg.routes.length,
  });

  console.log(JSON.stringify(output, null, 2));

  if (paused) {
    process.exitCode = EXIT_PARTIAL;
  } else {
    process.exitCode = report.summary.totalIssues === 0 ? EXIT_OK : EXIT_FAIL;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(EXIT_FAIL);
});


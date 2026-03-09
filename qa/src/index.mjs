#!/usr/bin/env node
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

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

const CODE = {
  ROUTE_LOAD_FAIL: "ROUTE_LOAD_FAIL",
  BTN_CLICK_ERROR: "BTN_CLICK_ERROR",
  BTN_NO_EFFECT: "BTN_NO_EFFECT",
  HTTP_4XX: "HTTP_4XX",
  HTTP_5XX: "HTTP_5XX",
  NET_REQUEST_FAILED: "NET_REQUEST_FAILED",
  JS_RUNTIME_ERROR: "JS_RUNTIME_ERROR",
  CONSOLE_ERROR: "CONSOLE_ERROR",
  VISUAL_SECTION_ORDER_INVALID: "VISUAL_SECTION_ORDER_INVALID",
  VISUAL_SECTION_MISSING: "VISUAL_SECTION_MISSING",
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
    if (token === "--max-run-ms" && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      args.maxRunMs = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      i += 1;
      continue;
    }
  }

  return args;
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
    autoDiscoverRoutes: config.autoDiscoverRoutes !== false,
    discoverFromSitemap: config.discoverFromSitemap !== false,
    discoverMenuLinks: config.discoverMenuLinks !== false,
    maxDiscoveredRoutes: Number.isFinite(Number(config.maxDiscoveredRoutes))
      ? Math.max(1, Number(config.maxDiscoveredRoutes))
      : 40,
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
  if (issue.diagnosis?.probableCauses?.length) {
    lines.push("");
    lines.push("Causas provaveis detectadas:");
    for (const cause of issue.diagnosis.probableCauses.slice(0, 5)) {
      lines.push(`- ${cause}`);
    }
  }
  if (issue.diagnosis?.technicalChecks?.length) {
    lines.push("");
    lines.push("Checks tecnicos sugeridos:");
    for (const check of issue.diagnosis.technicalChecks.slice(0, 5)) {
      lines.push(`- ${check}`);
    }
  }

  return lines.join("\n");
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
    detail: issue.detail,
    laymanExplanation: issue.laymanExplanation,
    recommendedResolution: issue.recommendedResolution,
    recommendedPrompt: issue.recommendedPrompt,
    assistantHint: issue.assistantHint,
    diagnosis: issue.diagnosis,
  };
}

function hydrateIssue(rawIssue) {
  const guide = guideForIssueCode(rawIssue.code);
  const diagnosis = rawIssue.diagnosis ?? inferIssueIntelligence(rawIssue, guide);

  const issue = {
    id:
      rawIssue.id ??
      shortHash(`${rawIssue.code}|${rawIssue.route}|${rawIssue.action ?? ""}|${rawIssue.detail}`),
    code: rawIssue.code,
    severity: rawIssue.severity ?? severityFromCode(rawIssue.code),
    route: rawIssue.route ?? "/",
    action: rawIssue.action ?? "",
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
    detail: input.detail,
    url: input.url ?? "",
  });
}

function pushIssue(report, input) {
  const issue = mkIssue(input);
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
    code === CODE.VISUAL_SECTION_MISSING
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
      if (issue.diagnosis?.title) {
        lines.push(`  diagnostico: ${issue.diagnosis.title} [${issue.diagnosis.subtype}]`);
      }
      lines.push(`  resolucao: ${issue.recommendedResolution}`);
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
  lines.push(`- Botoes sem efeito: ${report.summary.buttonsNoEffect}`);
  lines.push(`- Erros HTTP 4xx: ${report.summary.http4xx}`);
  lines.push(`- Erros HTTP 5xx: ${report.summary.http5xx}`);
  lines.push(`- Erros de rede: ${report.summary.netRequestFailed}`);
  lines.push(`- Erros JS runtime: ${report.summary.jsRuntimeErrors}`);
  lines.push(`- Console errors: ${report.summary.consoleErrors}`);
  lines.push(`- Ordem visual invalida: ${report.summary.visualSectionOrderInvalid}`);
  lines.push(`- Secao obrigatoria ausente/invisivel: ${report.summary.visualSectionMissing}`);
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
  lines.push("## Issues");
  lines.push("");

  if (report.issues.length === 0) {
    lines.push("Sem issues detectadas.");
  } else {
    for (const issue of report.issues) {
      const issuePrompt = issue.recommendedPrompt ?? buildIssueFixPrompt(issue);
      lines.push(`- [${issue.code}] (${issue.severity}) ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}: ${issue.detail}`);
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

function extractButtonLabels(page) {
  return page.evaluate(() => {
    const isVisible = (el) => {
      const style = window.getComputedStyle(el);
      if (!style || style.visibility === "hidden" || style.display === "none") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const all = Array.from(document.querySelectorAll("button"));
    const labels = all
      .filter((el) => isVisible(el))
      .map((el) => {
        const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
        const aria = (el.getAttribute("aria-label") ?? "").replace(/\s+/g, " ").trim();
        const title = (el.getAttribute("title") ?? "").replace(/\s+/g, " ").trim();
        return text || aria || title || "";
      })
      .filter((label) => label.length > 0);

    return Array.from(new Set(labels));
  });
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
  const seen = new Set();
  const enqueue = (route, source = "seed") => {
    const normalized = normalizeRoutePath(route);
    if (!normalized) return false;
    if (seen.has(normalized)) return false;
    if (discovered.length >= maxRoutes) return false;
    seen.add(normalized);
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

async function clickButtonByLabel(page, label, cfg, counters) {
  const strict = page.getByRole("button", { name: label, exact: true }).first();
  let target = strict;
  let visible = await strict.isVisible().catch(() => false);

  if (!visible) {
    const soft = page.getByRole("button", { name: label }).first();
    visible = await soft.isVisible().catch(() => false);
    target = soft;
  }

  if (!visible) {
    return { ok: false, reason: "button_not_visible" };
  }

  const enabled = await target.isEnabled().catch(() => false);
  if (!enabled) {
    return { ok: false, reason: "button_disabled" };
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

  await target.click({ timeout: cfg.buttonClickTimeoutMs });
  await page.waitForTimeout(cfg.clickWaitMs);

  const after = await fingerprint(page);
  const effectDetected =
    before.href !== after.href ||
    before.title !== after.title ||
    before.bodyHash !== after.bodyHash ||
    before.rootClass !== after.rootClass ||
    before.dialogs !== after.dialogs ||
    Math.abs(before.scrollY - after.scrollY) >= cfg.scrollEffectMinPx ||
    counters.requestsFinished > beforeReq ||
    counters.dialogs > beforeDialogs;

  return {
    ok: true,
    effectDetected,
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

  return {
    routesChecked: report.routeSweep.length,
    routeLoadFailures: count(CODE.ROUTE_LOAD_FAIL),
    buttonsChecked: report.routeSweep.reduce((acc, item) => acc + item.buttonsDiscovered, 0),
    buttonsNoEffect: count(CODE.BTN_NO_EFFECT),
    http4xx: count(CODE.HTTP_4XX),
    http5xx: count(CODE.HTTP_5XX),
    netRequestFailed: count(CODE.NET_REQUEST_FAILED),
    jsRuntimeErrors: count(CODE.JS_RUNTIME_ERROR),
    consoleErrors: count(CODE.CONSOLE_ERROR),
    visualSectionOrderInvalid: count(CODE.VISUAL_SECTION_ORDER_INVALID),
    visualSectionMissing: count(CODE.VISUAL_SECTION_MISSING),
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
  ];

  if (args.baseUrlOverride) {
    parts.push(`--base-url "${args.baseUrlOverride}"`, "--no-server");
  } else if (args.noServer) {
    parts.push("--no-server");
  }

  if (args.headed) parts.push("--headed");
  return parts.join(" ");
}

function createEmptyReport(cfg, args, maxRunMs) {
  const configPath = path.resolve(process.cwd(), args.configPath);
  const replayCommand = buildReplayCommand(args, configPath);

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
      resumedFromCheckpoint: false,
      paused: false,
      maxRunMs,
      checkpointFile: cfg.checkpointFile,
      configPath,
      replayCommand,
    },
    progress: {
      nextRouteIndex: 0,
      nextLabelIndex: 0,
      totalRoutes: cfg.routes.length,
      segments: 0,
    },
    routeSweep: [],
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
  if (!report.progress || typeof report.progress !== "object") {
    report.progress = {
      nextRouteIndex: 0,
      nextLabelIndex: 0,
      totalRoutes: cfg.routes.length,
      segments: 0,
    };
  }
  if (!Array.isArray(report.routeSweep)) report.routeSweep = [];
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

  report.meta.project = cfg.name;
  report.meta.baseUrl = cfg.baseUrl;
  report.meta.serverCommand = cfg.serverCommand;
  report.meta.serverCwd = cfg.serverCwd;
  report.meta.headed = args.headed;
  report.meta.viewport = `${cfg.viewportWidth}x${cfg.viewportHeight}`;
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

function shouldPauseByTime(runStartedAt, maxRunMs) {
  return maxRunMs > 0 && Date.now() - runStartedAt >= maxRunMs;
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

function finalizeReport(report, paused) {
  report.issues = dedupeIssues(report.issues);
  report.issues = report.issues.map((issue) => hydrateIssue(issue));
  report.issueLog = report.issues.map((issue) => createIssueLogEntry(issue));
  report.promptPack = buildPromptPack(report.issues);
  report.assistantGuide = buildAssistantGuide(report);
  report.summary = summarize(report);
  report.meta.finishedAt = nowIso();
  report.meta.paused = paused;
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
  const configPath = path.resolve(process.cwd(), args.configPath);
  const configDir = path.dirname(configPath);
  const rawConfig = await readJson(configPath);
  const cfgBase = normalizeConfig(rawConfig, configDir);
  const cfg = {
    ...cfgBase,
    baseUrl: args.baseUrlOverride ? String(args.baseUrlOverride) : cfgBase.baseUrl,
  };

  const maxRunMs = args.maxRunMs ?? (cfg.maxRunMs > 0 ? cfg.maxRunMs : 0);

  if (args.fresh) {
    await clearCheckpoint(cfg.checkpointFile);
  }

  let report = createEmptyReport(cfg, args, maxRunMs);
  if (!args.noResume) {
    const restored = await loadCheckpoint(cfg.checkpointFile);
    if (restored) {
      report = normalizeCheckpointReport(restored, cfg, args, maxRunMs);
    }
  }

  report.progress.segments += 1;

  let currentRoute = "(none)";
  let currentAction = "";
  let paused = false;
  let clicksSinceLastCheckpoint = 0;

  const runStartedAt = Date.now();

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
  const serverlessMode = isServerlessRuntime();

  let browser = null;

  try {
    if (!args.noServer) {
      await waitForServer(`${cfg.baseUrl}/`);
    }
    emitLiveEvent(args, "runner_ready", {
      action: "boot",
      detail: `baseUrl=${cfg.baseUrl} routes=${cfg.routes.length}`,
    });

    const launchPlan = await resolveChromiumLaunchPlan(args);
    emitLiveEvent(args, "runner_engine", {
      action: "engine_select",
      detail: `engine=${launchPlan.engine} headed=${args.headed ? "requested" : "no"}`,
    });
    browser = await chromium.launch(launchPlan.options);
    const context = await browser.newContext({ viewport: { width: cfg.viewportWidth, height: cfg.viewportHeight } });
    const page = await context.newPage();

    if (cfg.autoDiscoverRoutes) {
      emitLiveEvent(args, "route_discovery_start", {
        action: "route_discovery",
        detail: `seed=${cfg.routes.length} max=${cfg.maxDiscoveredRoutes}`,
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
      if (shouldPauseByTime(runStartedAt, maxRunMs)) {
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
      });

      const routeResult = ensureRouteResult(report, route);
      routeResult.loadOk = true;

      try {
        await page.goto(routeUrl, {
          waitUntil: "domcontentloaded",
          timeout: cfg.routeLoadTimeoutMs,
        });
        await page.waitForTimeout(300);
      } catch (error) {
        routeResult.loadOk = false;
        emitLiveEvent(args, "route_error", {
          route,
          action: "route_load",
          detail: normalizeText(String(error)),
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
      emitLiveEvent(args, "route_loaded", { route, action: "route_load" });

      if (cfg.sectionOrderRules.length) {
        currentAction = "visual_layout_check";
        emitLiveEvent(args, "layout_check_start", { route, action: "visual_layout_check" });
        const findings = await runSectionOrderChecks(page, route, cfg);
        for (const finding of findings) {
          if (finding.status === "missing") {
            emitLiveEvent(args, "layout_check_issue", {
              route,
              action: `layout_rule:${finding.id}`,
              rule: finding.id,
              status: "missing",
            });
            pushIssue(report, {
              code: CODE.VISUAL_SECTION_MISSING,
              severity: severityFromCode(CODE.VISUAL_SECTION_MISSING),
              route,
              action: `layout_rule:${finding.id}`,
              detail: formatSectionMissingDetail(finding),
              url: page.url(),
            });
          } else if (finding.status === "order_invalid") {
            emitLiveEvent(args, "layout_check_issue", {
              route,
              action: `layout_rule:${finding.id}`,
              rule: finding.id,
              status: "order_invalid",
            });
            pushIssue(report, {
              code: CODE.VISUAL_SECTION_ORDER_INVALID,
              severity: severityFromCode(CODE.VISUAL_SECTION_ORDER_INVALID),
              route,
              action: `layout_rule:${finding.id}`,
              detail: formatSectionOrderDetail(finding),
              url: page.url(),
            });
          }
        }
      }

      const labels = await extractButtonLabels(page);
      routeResult.buttonsDiscovered = Math.max(routeResult.buttonsDiscovered, labels.length);

      let labelStartIndex = routeIndex === report.progress.nextRouteIndex ? report.progress.nextLabelIndex : 0;
      if (labelStartIndex < 0) labelStartIndex = 0;
      if (labelStartIndex > labels.length) labelStartIndex = labels.length;

      for (let labelIndex = labelStartIndex; labelIndex < labels.length; labelIndex += 1) {
        if (shouldPauseByTime(runStartedAt, maxRunMs)) {
          paused = true;
          report.progress.nextRouteIndex = routeIndex;
          report.progress.nextLabelIndex = labelIndex;
          break routeLoop;
        }

        const label = labels[labelIndex];
        currentAction = label;
        emitLiveEvent(args, "button_click_start", {
          route,
          action: label,
          label,
          labelIndex: labelIndex + 1,
          totalLabels: labels.length,
        });

        try {
          const currentPath = normalizeRoutePath(tryParsePathname(page.url()));
          if (currentPath !== route) {
            await page.goto(routeUrl, {
              waitUntil: "domcontentloaded",
              timeout: cfg.routeLoadTimeoutMs,
            });
            await page.waitForTimeout(250);
          }

          const result = await clickButtonByLabel(page, label, cfg, counters);
          if (!result.ok) {
            emitLiveEvent(args, "button_click_skip", {
              route,
              action: label,
              label,
              reason: result.reason,
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
          emitLiveEvent(args, "button_click_error", {
            route,
            action: label,
            label,
            detail: normalizeText(String(error)),
          });
          pushIssue(report, {
            code: CODE.BTN_CLICK_ERROR,
            severity: severityFromCode(CODE.BTN_CLICK_ERROR),
            route,
            action: label,
            detail: normalizeText(String(error)),
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

  finalizeReport(report, paused);
  const artifacts = await writeReportArtifacts(report, cfg.reportDir, paused);

  if (paused) {
    await saveCheckpoint(cfg.checkpointFile, report);
  } else {
    await clearCheckpoint(cfg.checkpointFile);
  }

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
  });

  emitLiveEvent(args, "runner_finished", {
    action: "finish",
    paused,
    ok: output.ok,
    totalIssues: report.summary.totalIssues,
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


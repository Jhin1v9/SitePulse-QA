(function attachSitePulseAdaptiveLanguage(globalScope) {
  const STORAGE_KEYS = {
    assistantLanguageMode: "sitepulse-studio:assistant-language-mode-v1",
    assistantPreferredLanguage: "sitepulse-studio:assistant-preferred-language-v1",
    assistantDetectedLanguageHistory: "sitepulse-studio:assistant-language-history-v1",
    lastLanguageConfidence: "sitepulse-studio:assistant-language-confidence-v1",
    lastLanguageUpdatedAt: "sitepulse-studio:assistant-language-updated-at-v1",
  };
  const SUPPORTED_LANGUAGES = ["pt", "es", "en", "ca"];
  const HISTORY_LIMIT = 8;
  const SIGNAL_WINDOW = 4;
  const MIN_SIGNAL_TOKENS = 3;
  const MIN_SIGNAL_CHARS = 12;
  const MIN_DETECTION_CONFIDENCE = 0.62;
  const MIN_SWITCH_CONFIDENCE = 0.68;

  const LANGUAGE_PROFILES = {
    pt: { terms: { nao: 2.8, voce: 2.6, corrigir: 1.8, memoria: 2.2, ultima: 1.4, qualidade: 1.4 }, regexes: [/cao/g, /coes/g, /voce/g, /nao/g] },
    es: { terms: { sitio: 2, riesgo: 1.6, corregir: 1.8, ejecucion: 1.8, prioridad: 1.2, problemas: 1.2 }, regexes: [/cion/g, /ciones/g, /riesgo/g] },
    en: { terms: { what: 1.8, how: 1.6, latest: 1.6, risk: 1.4, issue: 1.2, fix: 1.6, memory: 1.2 }, regexes: [/\bthe\b/g, /\band\b/g, /\bwith\b/g] },
    ca: { terms: { aquest: 2.6, aquesta: 2.6, llengua: 2.6, catala: 2.8, ajuda: 1.4, millora: 1.4 }, regexes: [/aquest/g, /llengua/g, /catala/g] },
  };

  const UI_TEXT = {
    pt: { languageLabel: "Idioma da IA", modeAuto: "Automatico", languagePillAuto: "Idioma: auto", languagePillManual: "Idioma: {label}", title: "assistente operacional", contextDefault: "A IA usa o relatorio atual, memoria, logs e estado da interface.", modePillAuto: "Modo: auto", intentWaiting: "Intencao: aguardando", modeSummaryDefault: "O assistente roteia cada pedido para o modo operacional correto.", askLabel: "Pergunte ao assistente", askPlaceholder: "analise o ultimo SEO, compare runs, explique SEO_LANG_MISSING...", askButton: "Executar analise", quickPriorities: "O que corrigir primeiro?", quickSeo: "Priorizar SEO", quickPrompt: "Gerar prompt", quickGuide: "Explicar este painel", responseDefault: "Pergunte algo operacional. O assistente responde com base no relatorio, memoria, logs e estado da UI.", actionsDefault: "As acoes sugeridas aparecem aqui quando houver contexto suficiente.", noDirectAction: "Nenhuma acao direta foi sugerida para esta resposta." },
    es: { languageLabel: "Idioma de la IA", modeAuto: "Auto", languagePillAuto: "Idioma: auto", languagePillManual: "Idioma: {label}", title: "asistente operacional", contextDefault: "La IA usa el reporte actual, la memoria, los logs y el estado de la interfaz.", modePillAuto: "Modo: auto", intentWaiting: "Intencion: en espera", modeSummaryDefault: "El asistente enruta cada pedido al modo operativo correcto.", askLabel: "Pregunta al asistente", askPlaceholder: "analiza el ultimo SEO, compara runs, explica SEO_LANG_MISSING...", askButton: "Ejecutar analisis", quickPriorities: "Que corrijo primero?", quickSeo: "Priorizar SEO", quickPrompt: "Generar prompt", quickGuide: "Explicar este panel", responseDefault: "Pregunta algo operativo. El asistente responde usando el reporte cargado, la memoria, los logs y el estado de la UI.", actionsDefault: "Las acciones sugeridas apareceran aqui cuando haya contexto suficiente.", noDirectAction: "No se sugirio ninguna accion directa para esta respuesta." },
    en: { languageLabel: "Assistant language", modeAuto: "Auto", languagePillAuto: "Language: auto", languagePillManual: "Language: {label}", title: "operational assistant", contextDefault: "The assistant uses the current report, memory, logs and UI state.", modePillAuto: "Mode: auto", intentWaiting: "Intent: waiting", modeSummaryDefault: "The assistant auto-routes each request into the correct operational mode.", askLabel: "Ask the assistant", askPlaceholder: "analyse the latest SEO issues, compare runs, explain SEO_LANG_MISSING...", askButton: "Run analysis", quickPriorities: "What should I fix first?", quickSeo: "Prioritize SEO", quickPrompt: "Generate prompt", quickGuide: "Explain this workspace", responseDefault: "Ask something operational. The assistant will answer from the loaded report, memory, logs and UI state.", actionsDefault: "Action suggestions will appear here when the assistant has enough context.", noDirectAction: "No direct action was suggested for this answer." },
    ca: { languageLabel: "Idioma de la IA", modeAuto: "Auto", languagePillAuto: "Idioma: auto", languagePillManual: "Idioma: {label}", title: "assistent operacional", contextDefault: "La IA fa servir l'informe actual, la memoria, els logs i l'estat de la interficie.", modePillAuto: "Mode: auto", intentWaiting: "Intencio: en espera", modeSummaryDefault: "L'assistent enruta cada peticio cap al mode operatiu correcte.", askLabel: "Pregunta a l'assistent", askPlaceholder: "analitza l'ultim SEO, compara runs, explica SEO_LANG_MISSING...", askButton: "Executa l'analisi", quickPriorities: "Que corregeixo primer?", quickSeo: "Prioritzar SEO", quickPrompt: "Generar prompt", quickGuide: "Explicar aquest panell", responseDefault: "Pregunta alguna cosa operativa. L'assistent respon fent servir l'informe carregat, la memoria, els logs i l'estat de la UI.", actionsDefault: "Les accions suggerides apareixeran aqui quan hi hagi prou context.", noDirectAction: "No s'ha suggerit cap accio directa per a aquesta resposta." },
  };

  const QUICK_QUERIES = {
    pt: { priorities: "me diga o que devo fazer primeiro", seo: "analise o log da ultima execucao e me diga os problemas prioritarios de SEO", prompt: "gere um prompt para corrigir a top issue", guide: "me ensine a usar o painel atual" },
    es: { priorities: "dime que debo corregir primero", seo: "analiza el log de la ultima ejecucion y dime los problemas prioritarios de SEO", prompt: "genera un prompt para corregir la issue principal", guide: "ensename a usar el panel actual" },
    en: { priorities: "tell me what I should fix first", seo: "analyse the latest run log and tell me the top SEO issues", prompt: "generate a prompt to fix the top issue", guide: "teach me how to use the current workspace" },
    ca: { priorities: "digues-me que he de corregir primer", seo: "analitza el log de l'ultima execucio i digues-me els problemes prioritaris de SEO", prompt: "genera un prompt per corregir la issue principal", guide: "ensenya'm a fer servir el panell actual" },
  };

  const MODE_TEXT = {
    pt: { operator: { name: "Operador", description: "Executa acoes suportadas com confirmacao e mantem a operacao rastreavel." }, audit_analyst: { name: "Analista de Auditoria", description: "Interpreta a run atual, memoria, risco e logs para explicar problemas tecnicos." }, prompt_engineer: { name: "Engenheiro de Prompt", description: "Gera prompts estruturados com base na issue ativa, memoria validada e padroes failed." }, product_guide: { name: "Guia do Produto", description: "Explica a interface e os fluxos reais do app usando o estado atual da ferramenta." }, strategy_advisor: { name: "Estrategista Operacional", description: "Ordena o que fazer primeiro usando impacto, risco, tendencia, historico e confianca." } },
    es: { operator: { name: "Operador", description: "Ejecuta acciones soportadas con confirmacion y mantiene la operacion trazable." }, audit_analyst: { name: "Analista de Auditoria", description: "Interpreta la run actual, memoria, riesgo y logs para explicar problemas tecnicos." }, prompt_engineer: { name: "Ingeniero de Prompts", description: "Genera prompts estructurados con base en la issue activa, memoria validada y patrones failed." }, product_guide: { name: "Guia del Producto", description: "Explica la interfaz y los flujos reales de la app usando el estado actual de la herramienta." }, strategy_advisor: { name: "Estratega Operativo", description: "Ordena que hacer primero usando impacto, riesgo, tendencia, historial y confianza." } },
    en: { operator: { name: "Operator", description: "Executes supported actions with confirmation and keeps the operation traceable." }, audit_analyst: { name: "Audit Analyst", description: "Interprets the current run, memory, risk and logs to explain technical problems." }, prompt_engineer: { name: "Prompt Engineer", description: "Builds structured prompts from the active issue, validated memory and failed patterns." }, product_guide: { name: "Product Guide", description: "Explains the UI and real app flows from the current tool state." }, strategy_advisor: { name: "Strategy Advisor", description: "Ranks what to do first using impact, risk, trend, history and confidence." } },
    ca: { operator: { name: "Operador", description: "Executa accions suportades amb confirmacio i mante l'operacio tracable." }, audit_analyst: { name: "Analista d'Auditoria", description: "Interpreta la run actual, memoria, risc i logs per explicar problemes tecnics." }, prompt_engineer: { name: "Enginyer de Prompts", description: "Genera prompts estructurats a partir de la issue activa, memoria validada i patrons failed." }, product_guide: { name: "Guia del Producte", description: "Explica la interficie i els fluxos reals de l'app usant l'estat actual de l'eina." }, strategy_advisor: { name: "Estrateg Operatiu", description: "Ordena que fer primer usant impacte, risc, tendencia, historial i confianca." } },
  };

  const ACTION_LABELS = {
    pt: { "Open findings": "Abrir findings", "Open prompts": "Abrir prompts", "Open compare": "Abrir compare", "Open reports": "Abrir reports", "Open SEO workspace": "Abrir workspace SEO", "Open learning memory": "Abrir memoria operacional", "Open memory panel": "Abrir painel de memoria", "Open self-healing queue": "Abrir fila de self-healing", "Prepare healing": "Preparar healing", "Generate healing-aware prompt": "Gerar prompt com healing", "Revalidate now": "Revalidar agora", "Open operations": "Abrir operacoes", "Run audit now": "Executar auditoria agora", "Copy prompt": "Copiar prompt", "Promote solution": "Promover solucao", "Prepare audit": "Preparar auditoria", "Open overview": "Abrir overview" },
    es: { "Open findings": "Abrir findings", "Open prompts": "Abrir prompts", "Open compare": "Abrir compare", "Open reports": "Abrir reports", "Open SEO workspace": "Abrir workspace SEO", "Open learning memory": "Abrir memoria operacional", "Open memory panel": "Abrir panel de memoria", "Open self-healing queue": "Abrir cola de self-healing", "Prepare healing": "Preparar healing", "Generate healing-aware prompt": "Generar prompt con healing", "Revalidate now": "Revalidar ahora", "Open operations": "Abrir operaciones", "Run audit now": "Ejecutar auditoria ahora", "Copy prompt": "Copiar prompt", "Promote solution": "Promover solucion", "Prepare audit": "Preparar auditoria", "Open overview": "Abrir overview" },
    ca: { "Open findings": "Obrir findings", "Open prompts": "Obrir prompts", "Open compare": "Obrir compare", "Open reports": "Obrir reports", "Open SEO workspace": "Obrir workspace SEO", "Open learning memory": "Obrir memoria operacional", "Open memory panel": "Obrir panell de memoria", "Open self-healing queue": "Obrir cua de self-healing", "Prepare healing": "Preparar healing", "Generate healing-aware prompt": "Generar prompt amb healing", "Revalidate now": "Revalidar ara", "Open operations": "Obrir operacions", "Run audit now": "Executar auditoria ara", "Copy prompt": "Copiar prompt", "Promote solution": "Promoure solucio", "Prepare audit": "Preparar auditoria", "Open overview": "Obrir overview" },
  };

  const EXACT_TRANSLATIONS = {
    pt: { "No report loaded": "Nenhum relatorio carregado", "No audit loaded": "Nenhuma auditoria carregada", "No comparison baseline": "Sem baseline de comparacao", "Run comparison": "Comparacao de runs", "What worsened": "O que piorou", "Highest-impact issues": "Issues de maior impacto", "Biggest SEO risk": "Maior risco de SEO", "Optimization opportunities": "Oportunidades de otimizacao", "Structural improvements": "Melhorias estruturais", "Predictive regression risk": "Risco preditivo de regressao", "Problems getting worse": "Problemas piorando", "Trend overview": "Visao de tendencia", "Systemic patterns": "Padroes sistemicos", "Next ideal step": "Proximo passo ideal", "Quality trajectory": "Trajetoria de qualidade", "Biggest current risk": "Maior risco atual", "Issue explanation": "Explicacao da issue", "Learning memory": "Memoria operacional", "What to do first": "O que fazer primeiro", "SEO priorities": "Prioridades de SEO", "Memory panel guide": "Guia do painel de memoria", "App guide": "Guia do produto", "Recent engine log": "Log recente do engine" },
    es: { "No report loaded": "Ningun reporte cargado", "No audit loaded": "Ninguna auditoria cargada", "No comparison baseline": "Sin baseline de comparacion", "Run comparison": "Comparacion de runs", "What worsened": "Que empeoro", "Highest-impact issues": "Issues de mayor impacto", "Biggest SEO risk": "Mayor riesgo de SEO", "Optimization opportunities": "Oportunidades de optimizacion", "Structural improvements": "Mejoras estructurales", "Predictive regression risk": "Riesgo predictivo de regresion", "Problems getting worse": "Problemas empeorando", "Trend overview": "Vision de tendencia", "Systemic patterns": "Patrones sistemicos", "Next ideal step": "Siguiente paso ideal", "Quality trajectory": "Trayectoria de calidad", "Biggest current risk": "Mayor riesgo actual", "Issue explanation": "Explicacion de la issue", "Learning memory": "Memoria operacional", "What to do first": "Que hacer primero", "SEO priorities": "Prioridades de SEO", "Memory panel guide": "Guia del panel de memoria", "App guide": "Guia del producto", "Recent engine log": "Log reciente del engine" },
    ca: { "No report loaded": "Cap informe carregat", "No audit loaded": "Cap auditoria carregada", "No comparison baseline": "Sense baseline de comparacio", "Run comparison": "Comparacio de runs", "What worsened": "Que ha empitjorat", "Highest-impact issues": "Issues de mes impacte", "Biggest SEO risk": "Major risc de SEO", "Optimization opportunities": "Oportunitats d'optimitzacio", "Structural improvements": "Millores estructurals", "Predictive regression risk": "Risc predictiu de regressio", "Problems getting worse": "Problemes empitjorant", "Trend overview": "Visio de tendencia", "Systemic patterns": "Patrons sistemics", "Next ideal step": "Seguent pas ideal", "Quality trajectory": "Trajectoria de qualitat", "Biggest current risk": "Major risc actual", "Issue explanation": "Explicacio de la issue", "Learning memory": "Memoria operacional", "What to do first": "Que fer primer", "SEO priorities": "Prioritats de SEO", "Memory panel guide": "Guia del panell de memoria", "App guide": "Guia del producte", "Recent engine log": "Log recent de l'engine" },
  };

  const PREFIX_TRANSLATIONS = {
    pt: [["Current report has ", "O relatorio atual tem "], ["Current SitePulse Quality Score: ", "SitePulse Quality Score atual: "], ["Generated: ", "Gerado em: "], ["Routes checked: ", "Rotas verificadas: "], ["Actions mapped: ", "Acoes mapeadas: "], ["History available: ", "Historico disponivel: "], ["Final resolution: ", "Resolucao final: "], ["Possible resolution: ", "Resolucao possivel: "], ["Avoid: ", "Evitar: "], ["Eligibility: ", "Elegibilidade: "], ["Healing mode: ", "Modo de healing: "], ["Confidence: ", "Confianca: "], ["Strategy: ", "Estrategia: "], ["Best known correction: ", "Melhor correcao conhecida: "], ["Avoid this: ", "Evite isto: "], ["Mode: ", "Modo: "], ["Pending attempt mode: ", "Modo da tentativa pendente: "], ["Expected correction: ", "Correcao esperada: "], ["Current recommendation: ", "Recomendacao atual: "], ["Operational explanation for ", "Explicacao operacional para "], ["Learning memory | ", "Memoria operacional | "], ["Prompt intelligence | ", "Inteligencia de prompt | "], ["Healing strategy | ", "Estrategia de healing | "], ["Healing decision | ", "Decisao de healing | "], ["Revalidate healing | ", "Revalidar healing | "], ["What failed before | ", "O que falhou antes | "]],
    es: [["Current report has ", "El reporte actual tiene "], ["Current SitePulse Quality Score: ", "SitePulse Quality Score actual: "], ["Generated: ", "Generado: "], ["Routes checked: ", "Rutas verificadas: "], ["Actions mapped: ", "Acciones mapeadas: "], ["History available: ", "Historial disponible: "], ["Final resolution: ", "Resolucion final: "], ["Possible resolution: ", "Resolucion posible: "], ["Avoid: ", "Evitar: "], ["Eligibility: ", "Elegibilidad: "], ["Healing mode: ", "Modo de healing: "], ["Confidence: ", "Confianza: "], ["Strategy: ", "Estrategia: "], ["Best known correction: ", "Mejor correccion conocida: "], ["Avoid this: ", "Evita esto: "], ["Mode: ", "Modo: "], ["Pending attempt mode: ", "Modo del intento pendiente: "], ["Expected correction: ", "Correccion esperada: "], ["Current recommendation: ", "Recomendacion actual: "], ["Operational explanation for ", "Explicacion operacional para "], ["Learning memory | ", "Memoria operacional | "], ["Prompt intelligence | ", "Inteligencia de prompt | "], ["Healing strategy | ", "Estrategia de healing | "], ["Healing decision | ", "Decision de healing | "], ["Revalidate healing | ", "Revalidar healing | "], ["What failed before | ", "Que fallo antes | "]],
    ca: [["Current report has ", "L'informe actual te "], ["Current SitePulse Quality Score: ", "SitePulse Quality Score actual: "], ["Generated: ", "Generat: "], ["Routes checked: ", "Rutes verificades: "], ["Actions mapped: ", "Accions mapejades: "], ["History available: ", "Historial disponible: "], ["Final resolution: ", "Resolucio final: "], ["Possible resolution: ", "Resolucio possible: "], ["Avoid: ", "Evitar: "], ["Eligibility: ", "Elegibilitat: "], ["Healing mode: ", "Mode de healing: "], ["Confidence: ", "Confianca: "], ["Strategy: ", "Estrategia: "], ["Best known correction: ", "Millor correccio coneguda: "], ["Avoid this: ", "Evita aixo: "], ["Mode: ", "Mode: "], ["Pending attempt mode: ", "Mode de l'intent pendent: "], ["Expected correction: ", "Correccio esperada: "], ["Current recommendation: ", "Recomanacio actual: "], ["Operational explanation for ", "Explicacio operacional per a "], ["Learning memory | ", "Memoria operacional | "], ["Prompt intelligence | ", "Intelligencia de prompt | "], ["Healing strategy | ", "Estrategia de healing | "], ["Healing decision | ", "Decisio de healing | "], ["Revalidate healing | ", "Revalidar healing | "], ["What failed before | ", "Que ha fallat abans | "]],
  };

  function normalizeText(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
  function normalizeSignalText(value) { return normalizeText(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function readStorage(key, fallback) { try { const raw = globalScope.localStorage?.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
  function writeStorage(key, value) { try { globalScope.localStorage?.setItem(key, JSON.stringify(value)); } catch {} }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function sanitizeLanguage(languageKey, fallback = "en") { return SUPPORTED_LANGUAGES.includes(languageKey) ? languageKey : fallback; }
  function mapBrowserLanguage() { const browserLanguage = normalizeText(globalScope.navigator?.language || "").toLowerCase(); if (browserLanguage.startsWith("pt")) return "pt"; if (browserLanguage.startsWith("es")) return "es"; if (browserLanguage.startsWith("ca")) return "ca"; return "en"; }
  function getUiText(languageKey) { return UI_TEXT[sanitizeLanguage(languageKey, "en")] || UI_TEXT.en; }
  function interpolate(template, variables) { return String(template || "").replace(/\{(\w+)\}/g, (_, key) => String(variables?.[key] ?? "")); }

  function detectLanguage(text) {
    const normalized = normalizeSignalText(text);
    const tokens = normalized.match(/[a-z]+/g) || [];
    if (normalized.length < MIN_SIGNAL_CHARS || tokens.length < MIN_SIGNAL_TOKENS) return { language: "", confidence: 0, accepted: false };
    const scores = Object.entries(LANGUAGE_PROFILES).map(([language, profile]) => {
      const weighted = Object.entries(profile.terms).reduce((sum, [term, weight]) => sum + tokens.filter((token) => token === term).length * weight, 0);
      const regex = profile.regexes.reduce((sum, item) => sum + ((normalized.match(item) || []).length * 0.55), 0);
      return { language, score: weighted + regex };
    }).sort((left, right) => right.score - left.score);
    const best = scores[0] || { language: "", score: 0 };
    const second = scores[1] || { score: 0 };
    const total = scores.reduce((sum, item) => sum + item.score, 0);
    const confidence = total > 0 ? clamp(best.score / total, 0, 1) : 0;
    const accepted = best.score >= 2.2 && confidence >= MIN_DETECTION_CONFIDENCE && (best.score - second.score) >= 0.55;
    return { language: accepted ? best.language : "", confidence: Number(confidence.toFixed(2)), accepted };
  }

  function evaluateDominantLanguage(history, currentPreferredLanguage) {
    const windowed = history.filter((entry) => entry?.accepted === true && Number(entry.confidence) >= MIN_DETECTION_CONFIDENCE).slice(-SIGNAL_WINDOW);
    if (windowed.length < 2) return { shouldUpdate: false, language: currentPreferredLanguage, confidence: 0 };
    const weighted = new Map();
    const counts = new Map();
    for (const entry of windowed) {
      weighted.set(entry.language, (weighted.get(entry.language) || 0) + Number(entry.confidence || 0));
      counts.set(entry.language, (counts.get(entry.language) || 0) + 1);
    }
    const sorted = [...weighted.entries()].sort((left, right) => right[1] - left[1]);
    const [language, topWeight] = sorted[0] || [currentPreferredLanguage, 0];
    const secondWeight = sorted[1]?.[1] || 0;
    const count = counts.get(language) || 0;
    const confidence = clamp(topWeight / Math.max(windowed.length, 1), 0, 1);
    return { shouldUpdate: count >= 2 && confidence >= MIN_SWITCH_CONFIDENCE && (topWeight - secondWeight) >= 0.55, language, confidence: Number(confidence.toFixed(2)) };
  }

  function buildDefaultState() { return { assistantLanguageMode: "auto", assistantPreferredLanguage: mapBrowserLanguage(), assistantDetectedLanguageHistory: [], lastLanguageConfidence: 0, lastLanguageUpdatedAt: "", activeLanguage: mapBrowserLanguage(), voiceReadiness: { supportsTranscriptSignals: true, supportsVoiceInput: false, transcriptLanguageSignal: true } }; }
  function hydrateState() {
    const fallback = buildDefaultState();
    const history = readStorage(STORAGE_KEYS.assistantDetectedLanguageHistory, []);
    const preferredLanguage = readStorage(STORAGE_KEYS.assistantPreferredLanguage, fallback.assistantPreferredLanguage);
    return { assistantLanguageMode: readStorage(STORAGE_KEYS.assistantLanguageMode, "auto") === "manual" ? "manual" : "auto", assistantPreferredLanguage: sanitizeLanguage(preferredLanguage, fallback.assistantPreferredLanguage), assistantDetectedLanguageHistory: Array.isArray(history) ? history.slice(-HISTORY_LIMIT) : [], lastLanguageConfidence: Number(readStorage(STORAGE_KEYS.lastLanguageConfidence, 0) || 0), lastLanguageUpdatedAt: String(readStorage(STORAGE_KEYS.lastLanguageUpdatedAt, "") || ""), activeLanguage: sanitizeLanguage(preferredLanguage, fallback.assistantPreferredLanguage), voiceReadiness: fallback.voiceReadiness };
  }
  function persistState(state) { writeStorage(STORAGE_KEYS.assistantLanguageMode, state.assistantLanguageMode); writeStorage(STORAGE_KEYS.assistantPreferredLanguage, state.assistantPreferredLanguage); writeStorage(STORAGE_KEYS.assistantDetectedLanguageHistory, state.assistantDetectedLanguageHistory); writeStorage(STORAGE_KEYS.lastLanguageConfidence, state.lastLanguageConfidence); writeStorage(STORAGE_KEYS.lastLanguageUpdatedAt, state.lastLanguageUpdatedAt); }
  function buildPublicState(state) { return { ...state, activeLanguage: state.assistantLanguageMode === "manual" ? sanitizeLanguage(state.assistantPreferredLanguage, "en") : sanitizeLanguage(state.assistantPreferredLanguage, mapBrowserLanguage()) }; }

  function getLanguageLabel(languageKey) {
    switch (sanitizeLanguage(languageKey, "en")) {
      case "pt": return "Portugues";
      case "es": return "Espanol";
      case "ca": return "Catala";
      default: return "English";
    }
  }

  function localizeAssistantTextLine(value, languageKey) {
    const safeLanguage = sanitizeLanguage(languageKey, "en");
    if (safeLanguage === "en") return String(value || "");
    const raw = String(value || "");
    const exact = EXACT_TRANSLATIONS[safeLanguage]?.[raw];
    if (exact) return exact;
    const prefix = (PREFIX_TRANSLATIONS[safeLanguage] || []).find(([source]) => raw.startsWith(source));
    return prefix ? `${prefix[1]}${raw.slice(prefix[0].length)}` : raw;
  }

  function buildPromptRequest(issueCode = "", languageKey = "en") {
    const safeLanguage = sanitizeLanguage(languageKey, "en");
    if (safeLanguage === "pt") return issueCode ? `gere um prompt para corrigir a issue ${issueCode}` : "gere um prompt para corrigir a top issue";
    if (safeLanguage === "es") return issueCode ? `genera un prompt para corregir la issue ${issueCode}` : "genera un prompt para corregir la issue principal";
    if (safeLanguage === "ca") return issueCode ? `genera un prompt per corregir la issue ${issueCode}` : "genera un prompt per corregir la issue principal";
    return issueCode ? `generate a prompt to fix issue ${issueCode}` : "generate a prompt to fix the top issue";
  }

  function createSitePulseAdaptiveLanguageService() {
    let state = hydrateState();
    function save(nextState) { state = buildPublicState(nextState); persistState(state); return state; }

    return {
      getState() { state = buildPublicState(state); return { ...state }; },
      setAutoMode() { return save({ ...state, assistantLanguageMode: "auto" }); },
      setManualLanguage(languageKey) { return save({ ...state, assistantLanguageMode: "manual", assistantPreferredLanguage: sanitizeLanguage(languageKey, state.assistantPreferredLanguage), lastLanguageUpdatedAt: new Date().toISOString() }); },
      recordTextSignal(text, source = "text") {
        const detection = detectLanguage(text);
        const nextHistory = detection.accepted ? [...state.assistantDetectedLanguageHistory, { language: detection.language, confidence: detection.confidence, accepted: true, source, sample: normalizeText(text).slice(0, 80), at: new Date().toISOString() }].slice(-HISTORY_LIMIT) : state.assistantDetectedLanguageHistory.slice(-HISTORY_LIMIT);
        let nextState = { ...state, assistantDetectedLanguageHistory: nextHistory, lastLanguageConfidence: detection.confidence };
        if (state.assistantLanguageMode === "auto" && detection.accepted) {
          const dominant = evaluateDominantLanguage(nextHistory, state.assistantPreferredLanguage);
          if (dominant.shouldUpdate) nextState = { ...nextState, assistantPreferredLanguage: dominant.language, lastLanguageConfidence: dominant.confidence, lastLanguageUpdatedAt: new Date().toISOString() };
        }
        if (!nextState.lastLanguageUpdatedAt && detection.accepted) nextState.lastLanguageUpdatedAt = new Date().toISOString();
        return save(nextState);
      },
      getUiText(languageKey = state.activeLanguage) { return getUiText(languageKey); },
      getQuickQueries(languageKey = state.activeLanguage) { return QUICK_QUERIES[sanitizeLanguage(languageKey, state.activeLanguage)] || QUICK_QUERIES.en; },
      getLanguageLabel,
      getVoiceReadiness() { return { ...state.voiceReadiness }; },
      getLanguageOptions() { return [{ value: "auto", label: getUiText(state.activeLanguage).modeAuto }, ...SUPPORTED_LANGUAGES.map((language) => ({ value: language, label: getLanguageLabel(language) }))]; },
      translateUiText(key, variables = {}, languageKey = state.activeLanguage) { return interpolate(getUiText(languageKey)[key] || UI_TEXT.en[key] || "", variables); },
      localizeAssistantTextLine(value, languageKey = state.activeLanguage) { return localizeAssistantTextLine(value, languageKey); },
      localizeAssistantActionLabel(label, languageKey = state.activeLanguage) { return ACTION_LABELS[sanitizeLanguage(languageKey, "en")]?.[String(label || "")] || String(label || ""); },
      getAssistantModeMeta(modeKey, languageKey = state.activeLanguage) { return MODE_TEXT[sanitizeLanguage(languageKey, "en")]?.[modeKey] || MODE_TEXT.en[modeKey] || { name: "Operational", description: "" }; },
      buildPromptRequest(issueCode = "", languageKey = state.activeLanguage) { return buildPromptRequest(issueCode, languageKey); },
    };
  }

  globalScope.createSitePulseAdaptiveLanguageService = createSitePulseAdaptiveLanguageService;
})(window);

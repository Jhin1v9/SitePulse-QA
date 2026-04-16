(function attachSitePulseAssistant(globalScope) {
  const MODE_REGISTRY = {
    operator: {
      key: "operator",
      name: "Operator",
      description: "Executes supported workstation actions, confirms operational steps and keeps the user in control.",
      capabilities: ["run-audit", "open-memory", "open-run", "manual-override", "switch-workspace"],
      allowedActions: [
        "run-audit",
        "switch-overview",
        "switch-operations",
        "switch-findings",
        "switch-seo",
        "switch-prompts",
        "switch-compare",
        "switch-reports",
        "switch-settings",
        "open-memory",
        "open-healing",
        "prepare-healing",
        "revalidate-healing",
        "manual-override",
        "generate-prompt",
      ],
      contextSources: ["ui", "report", "commands", "history"],
      priorityRules: [
        "Prefer actions that can be executed safely right now.",
        "Confirm operational context before changing memory.",
      ],
      responseStyle: "directive",
    },
    audit_analyst: {
      key: "audit_analyst",
      name: "Audit Analyst",
      description: "Interprets the current run, logs, issue severity and operational memory to explain technical risk.",
      capabilities: ["analyze-issues", "triage-severity", "read-logs", "use-memory"],
      allowedActions: [
        "switch-findings",
        "switch-seo",
        "switch-operations",
        "switch-compare",
        "switch-settings",
        "open-memory",
        "open-healing",
        "findings-search",
        "generate-prompt",
      ],
      contextSources: ["report", "issues", "logs", "memory", "predictive", "data-intelligence", "optimization"],
      priorityRules: [
        "Prioritize high severity and SEO-impacting failures first.",
        "Use validated memory before generic recommendations.",
      ],
      responseStyle: "analytical",
    },
    prompt_engineer: {
      key: "prompt_engineer",
      name: "Prompt Engineer",
      description: "Builds fix prompts from the active issue, validated memory and failed patterns to avoid weak guidance.",
      capabilities: ["generate-prompt", "cite-memory", "avoid-failed-patterns"],
      allowedActions: [
        "copy-text",
        "switch-prompts",
        "switch-findings",
        "open-memory",
        "open-healing",
        "prepare-healing",
        "generate-prompt",
      ],
      contextSources: ["report", "memory", "prompt-workspace"],
      priorityRules: [
        "Prefer validated fixes when they exist.",
        "Call out failed patterns before proposing another attempt.",
      ],
      responseStyle: "structured",
    },
    product_guide: {
      key: "product_guide",
      name: "Product Guide",
      description: "Explains the interface, workspaces and operational flows using the actual desktop surface and available actions.",
      capabilities: ["explain-ui", "guide-workspace", "teach-memory-panel"],
      allowedActions: [
        "switch-overview",
        "switch-operations",
        "switch-findings",
        "switch-seo",
        "switch-prompts",
        "switch-compare",
        "switch-reports",
        "switch-settings",
        "open-memory",
        "open-healing",
      ],
      contextSources: ["ui", "workspace-help", "commands"],
      priorityRules: [
        "Keep explanations tied to the active workspace.",
        "Prefer the shortest path that gets the user unstuck.",
      ],
      responseStyle: "instructional",
    },
    strategy_advisor: {
      key: "strategy_advisor",
      name: "Strategy Advisor",
      description: "Prioritizes what to fix first using critical issues, business risk signals, SEO impact and run history.",
      capabilities: ["prioritize-work", "compare-runs", "sequence-actions"],
      allowedActions: [
        "switch-findings",
        "switch-prompts",
        "switch-compare",
        "switch-reports",
        "switch-seo",
        "open-memory",
        "open-healing",
        "prepare-healing",
        "generate-prompt",
      ],
      contextSources: ["report", "issues", "memory", "history", "compare", "predictive", "data-intelligence", "optimization"],
      priorityRules: [
        "Sequence fixes by severity, validation gap and business impact.",
        "Use comparison context when available before recommending the next move.",
      ],
      responseStyle: "prioritized",
    },
    bug_analyst: {
      key: "bug_analyst",
      name: "Bug Analyst",
      description: "Analyzes visual and functional bugs captured by Bug Detector, explains root cause and suggests code fixes using AI.",
      capabilities: ["analyze-bug", "explain-root-cause", "suggest-code-fix", "trace-element"],
      allowedActions: [
        "switch-findings",
        "switch-prompts",
        "open-memory",
        "copy-text",
        "generate-prompt",
      ],
      contextSources: ["report", "bug-detector", "issues", "memory", "data-intelligence"],
      priorityRules: [
        "Always explain the root cause before suggesting a fix.",
        "When a code fix is available, present it in a copyable code block.",
        "Use Bug Detector context when available; fall back to audit issues if not.",
      ],
      responseStyle: "technical",
    },
  };

  const INTENT_DEFINITIONS = [
    { id: "greeting", mode: "product_guide", terms: ["oi", "ola", "olá", "hello", "hi", "hey", "hola", "bon dia", "good morning", "good afternoon"], builder: (context) => buildGreetingResponse(context) },
    { id: "thanks", mode: "product_guide", terms: ["obrigado", "obrigada", "thanks", "thank you", "gracias", "merci"], builder: (context) => buildThanksResponse(context) },
    { id: "memory_guide", mode: "product_guide", terms: ["painel de memoria", "memory panel", "painel de aprendizados", "painel de memoria"], builder: (context) => buildMemoryGuideResponse(context) },
    { id: "guide", mode: "product_guide", terms: ["como usar", "how do i use", "como usar o painel", "guide", "what does", "me ensine", "ensine", "painel atual"], builder: (context) => buildGuideResponse(context) },
    { id: "seo", mode: "audit_analyst", terms: ["analise o log", "analyze the log", "problemas prioritarios de seo", "seo priorities"], builder: (context) => buildSeoResponse(context) },
    { id: "issue_explain", mode: "audit_analyst", terms: ["o que significa", "what means", "explain", "explique", "explique este problema", "explain this problem", "este problema"], builder: (context, rawQuery) => buildIssueExplanation(context, rawQuery) },
    { id: "unresolved_critical", mode: "audit_analyst", terms: ["ainda nao tem solucao", "still lack", "sem solucao validada", "without final resolution"], builder: (context) => buildUnresolvedCriticalResponse(context) },
    { id: "validated", mode: "audit_analyst", terms: ["quais problemas criticos", "critical issues", "solucao validada"], builder: (context) => buildValidatedResponse(context) },
    { id: "failed", mode: "audit_analyst", terms: ["quais solucoes falharam", "failed solutions", "failed attempts"], builder: (context, rawQuery) => buildFailedResponse(context, rawQuery) },
    { id: "manual_override", mode: "operator", terms: ["promova", "manual override", "promote solution"], builder: (context, rawQuery) => buildManualOverrideResponse(context, rawQuery) },
    { id: "healing_candidates", mode: "strategy_advisor", terms: ["auto-curadas", "auto curadas", "healing available", "healing candidates", "maior chance de resolucao automatica", "eligible for healing"], builder: (context) => buildHealingCandidatesResponse(context) },
    { id: "healing_strategy", mode: "strategy_advisor", terms: ["melhor estrategia", "best strategy", "healing strategy", "melhor forma de corrigir", "best fix strategy"], builder: (context, rawQuery) => buildHealingStrategyResponse(context, rawQuery) },
    { id: "healing_decision", mode: "strategy_advisor", terms: ["manualmente ou assistida", "manual or assisted", "assistida ou manual", "deve ser corrigida manualmente"], builder: (context, rawQuery) => buildHealingDecisionResponse(context, rawQuery) },
    { id: "healing_failures", mode: "audit_analyst", terms: ["falhou nas tentativas anteriores", "what failed before", "tentativas anteriores", "healing failed"], builder: (context, rawQuery) => buildHealingFailureResponse(context, rawQuery) },
    { id: "healing_revalidate", mode: "operator", terms: ["revalide a ultima tentativa", "revalidate the last attempt", "revalidar a correcao", "revalidate this fix"], builder: (context, rawQuery) => buildHealingRevalidateResponse(context, rawQuery) },
    { id: "predictive_risk", mode: "strategy_advisor", terms: ["existe risco de regressao", "risk of regression", "predictive alert", "risco preditivo"], builder: (context) => buildPredictiveRiskResponse(context) },
    { id: "worsening", mode: "audit_analyst", terms: ["quais problemas estao piorando", "what is getting worse", "worsening issues", "problemas piorando"], builder: (context) => buildWorseningResponse(context) },
    { id: "trend", mode: "strategy_advisor", terms: ["qual tendencia estou vendo", "what trend am i seeing", "trend analysis", "tendencia"], builder: (context) => buildTrendResponse(context) },
    { id: "systemic_patterns", mode: "strategy_advisor", terms: ["padroes sistemicos", "systemic patterns", "historico sistemico", "historical patterns"], builder: (context) => buildSystemicPatternsResponse(context) },
    { id: "next_step", mode: "strategy_advisor", terms: ["qual e o proximo passo ideal", "next ideal step", "next action", "proximo passo"], builder: (context) => buildNextStepResponse(context) },
    { id: "quality_trajectory", mode: "strategy_advisor", terms: ["site esta melhorando", "site esta piorando", "quality trajectory", "quality score", "trajectory"], builder: (context) => buildQualityTrajectoryResponse(context) },
    { id: "biggest_risk", mode: "strategy_advisor", terms: ["qual e o maior risco atual", "biggest current risk", "maior risco atual"], builder: (context) => buildBiggestRiskResponse(context) },
    { id: "regression", mode: "strategy_advisor", terms: ["o que piorou", "what got worse", "piorou"], builder: (context) => buildRegressionResponse(context) },
    { id: "compare", mode: "strategy_advisor", terms: ["compare", "comparar", "compare a run", "run atual com a anterior", "compare execucoes", "compare execuções", "compare runs"], builder: (context) => buildCompareResponse(context) },
    { id: "impact", mode: "strategy_advisor", terms: ["maior impacto", "highest impact", "issues tem maior impacto", "which issues have the highest impact"], builder: (context) => buildImpactResponse(context) },
    { id: "seo_risk", mode: "strategy_advisor", terms: ["maior risco de seo", "biggest seo risk", "seo risk now"], builder: (context) => buildSeoRiskResponse(context) },
    { id: "optimization_opportunities", mode: "strategy_advisor", terms: ["seo opportunities", "ux improvements", "performance gains", "optimization opportunities", "top improvements", "oportunidades"], builder: (context) => buildOptimizationResponse(context) },
    { id: "structural_improvements", mode: "strategy_advisor", terms: ["melhorias estruturais", "structural improvements", "template logic", "recommend fixing template logic"], builder: (context) => buildStructuralRecommendationsResponse(context) },
    { id: "prompt", mode: "prompt_engineer", terms: ["gere um prompt", "generate a prompt", "crie um prompt", "gere prompts para correcao", "gere prompts para correção", "generate prompts for correction"], builder: (context, rawQuery) => buildPromptResponse(context, rawQuery) },
    { id: "memory", mode: "audit_analyst", terms: ["abra a memoria", "open memory", "aprendizados validados"], builder: (context, rawQuery) => buildMemoryResponse(context, rawQuery) },
    { id: "latest_run", mode: "operator", terms: ["ultima run", "latest run", "open last run", "abrir ultima run"], builder: (context) => buildLatestRunResponse(context) },
    { id: "priorities", mode: "strategy_advisor", terms: ["me diga o que devo fazer primeiro", "what should i do first", "prioritize"], builder: (context) => buildPrioritiesResponse(context) },
    { id: "audit", mode: "operator", terms: ["audite", "run audit", "audit ", "rode auditoria", "roda auditoria", "rodar auditoria", "run a auditoria"], builder: (context, rawQuery) => buildAuditSiteResponse(context, rawQuery) },
    { id: "analyze_seo_fix", mode: "operator", terms: ["analise seo e diga o que corrigir", "analyze seo and say what to fix", "analise o site", "analise este site", "analyze this site", "analise o seo", "analyze seo"], builder: (context, rawQuery) => buildAnalyzeSeoAndFixResponse(context, rawQuery) },
    { id: "logs", mode: "audit_analyst", terms: ["log", "logs"], builder: (context) => buildLogsResponse(context) },
    { id: "bug_detected", mode: "bug_analyst", terms: ["bug detectado", "bug detector", "reportar bug", "screenshot", "gravacao de tela", "screen recording", "causa raiz", "root cause", "codigo corrigido", "fixed code"], builder: (context, rawQuery) => buildBugAnalystResponse(context, rawQuery) },
  ];

  const TONE_REGISTRY = {
    friendly: { key: "friendly", label: "Friendly / human" },
    operational: { key: "operational", label: "Normal operational" },
    technical: { key: "technical", label: "Technical" },
    advanced_engineer: { key: "advanced_engineer", label: "Advanced engineer" },
    executive_summary: { key: "executive_summary", label: "Executive summary" },
    prompt_engineer: { key: "prompt_engineer", label: "Prompt engineer" },
    simple: { key: "simple", label: "Simplified" },
  };

  const HUMAN_COPY = {
    pt: {
      greetingLead: "Olá. Posso te ajudar a analisar uma auditoria, interpretar um log, gerar um prompt ou te guiar pelo app.",
      thanksLead: "Perfeito. Se quiser, eu continuo daqui com você.",
      guideLead: "Posso te orientar por isso sem te fazer sair do contexto atual.",
      analysisLead: "Entendi. Revisei o estado atual do app e este é o ponto principal.",
      strategyLead: "Pelo que está carregado agora, este é o melhor próximo passo.",
      operatorLead: "Consigo te ajudar a executar isso com segurança dentro do app.",
      promptLead: "Preparei isso de forma mais cirúrgica, usando a issue atual, a memória operacional e o histórico de falhas.",
      executiveLead: "Resumo direto: isto é o que mais importa agora.",
      technicalLead: "Fui mais fundo na leitura técnica para te devolver uma resposta mais precisa.",
      simpleLead: "Vou manter isso simples e claro.",
      followUp: "Se quiser, eu também posso abrir a área certa ou preparar a próxima ação.",
      noReport: "Se você carregar uma auditoria, eu consigo ser bem mais específico.",
      promptCardTitle: "Prompt pronto",
      promptCardContext: "Gerado com base na auditoria atual, memória operacional e padrões failed.",
      copyPrompt: "Copiar",
      sendPrompt: "Enviar para Prompts",
      savePrompt: "Salvar",
      actionCardTitle: "Ação sugerida",
      actionCardHint: "Posso executar isso daqui.",
    },
    es: {
      greetingLead: "Hola. Puedo ayudarte a analizar una auditoría, interpretar un log, generar un prompt o guiarte por la herramienta.",
      thanksLead: "Perfecto. Si quieres, sigo contigo desde aquí.",
      guideLead: "Puedo orientarte por esto sin sacarte del contexto actual.",
      analysisLead: "Entendido. Revisé el estado actual de la app y este es el punto principal.",
      strategyLead: "Con lo que está cargado ahora, este es el mejor siguiente paso.",
      operatorLead: "Puedo ayudarte a ejecutar esto con seguridad dentro de la app.",
      promptLead: "Preparé esto de forma más precisa usando la issue actual, la memoria operacional y el historial de fallos.",
      executiveLead: "Resumen directo: esto es lo que más importa ahora.",
      technicalLead: "Fui más a fondo en la lectura técnica para devolverte una respuesta más precisa.",
      simpleLead: "Voy a mantener esto simple y claro.",
      followUp: "Si quieres, también puedo abrir el área correcta o preparar la siguiente acción.",
      noReport: "Si cargas una auditoría, puedo ser mucho más específico.",
      promptCardTitle: "Prompt listo",
      promptCardContext: "Generado desde la auditoría actual, la memoria operacional y los patrones failed.",
      copyPrompt: "Copiar",
      sendPrompt: "Enviar a Prompts",
      savePrompt: "Guardar",
      actionCardTitle: "Acción sugerida",
      actionCardHint: "Puedo ejecutar esto desde aquí.",
    },
    en: {
      greetingLead: "Hello. I can help you analyze an audit, interpret a log, generate a prompt or guide you through the app.",
      thanksLead: "Good. If you want, I can keep going from here with you.",
      guideLead: "I can walk you through this without pulling you out of the current context.",
      analysisLead: "Understood. I reviewed the current app state and this is the main point.",
      strategyLead: "From what is loaded right now, this is the best next move.",
      operatorLead: "I can help you execute this safely inside the app.",
      promptLead: "I prepared this more surgically using the current issue, operational memory and failed history.",
      executiveLead: "Short version: this is what matters most right now.",
      technicalLead: "I went deeper technically so the answer is more precise.",
      simpleLead: "I will keep this simple and clear.",
      followUp: "If you want, I can also open the right area or prepare the next action.",
      noReport: "If you load an audit, I can be much more specific.",
      promptCardTitle: "Prompt ready",
      promptCardContext: "Generated from the current audit, operational memory and failed patterns.",
      copyPrompt: "Copy",
      sendPrompt: "Send to Prompts",
      savePrompt: "Save",
      actionCardTitle: "Suggested action",
      actionCardHint: "I can run this from here.",
    },
    ca: {
      greetingLead: "Hola. Puc ajudar-te a analitzar una auditoria, interpretar un log, generar un prompt o guiar-te per l'eina.",
      thanksLead: "Perfecte. Si vols, continuo des d'aquí amb tu.",
      guideLead: "Puc orientar-te per això sense treure't del context actual.",
      analysisLead: "Entes. He revisat l'estat actual de l'app i aquest és el punt principal.",
      strategyLead: "Amb el que hi ha carregat ara, aquest és el millor pas següent.",
      operatorLead: "Puc ajudar-te a executar això amb seguretat dins de l'app.",
      promptLead: "He preparat això de manera més precisa usant la issue actual, la memòria operacional i l'historial de fallades.",
      executiveLead: "Resum directe: això és el que més importa ara mateix.",
      technicalLead: "He anat més a fons en la lectura tècnica per tornar-te una resposta més precisa.",
      simpleLead: "Ho mantindré simple i clar.",
      followUp: "Si vols, també puc obrir l'àrea correcta o preparar la següent acció.",
      noReport: "Si carregues una auditoria, puc ser molt més específic.",
      promptCardTitle: "Prompt preparat",
      promptCardContext: "Generat des de l'auditoria actual, la memòria operacional i els patrons failed.",
      copyPrompt: "Copiar",
      sendPrompt: "Enviar a Prompts",
      savePrompt: "Desar",
      actionCardTitle: "Acció suggerida",
      actionCardHint: "Puc executar això des d'aquí.",
    },
  };

  const ACTION_CARD_COPY = {
    "run-audit": {
      pt: "Dispara a auditoria usando o perfil atual do desktop.",
      es: "Lanza la auditoría usando el perfil actual del desktop.",
      en: "Launch the audit using the current desktop profile.",
      ca: "Llança l'auditoria usant el perfil actual del desktop.",
    },
    "switch-findings": {
      pt: "Abra o painel de decisão para revisar e priorizar issues.",
      es: "Abre el panel de decisión para revisar y priorizar issues.",
      en: "Open the decision board to review and rank issues.",
      ca: "Obre el panell de decisió per revisar i prioritzar issues.",
    },
    "switch-seo": {
      pt: "Leve a conversa para o workspace de SEO e veja os riscos atuais.",
      es: "Lleva la conversación al workspace de SEO y mira los riesgos actuales.",
      en: "Move into the SEO workspace and inspect the current search risk.",
      ca: "Porta la conversa al workspace de SEO i mira els riscos actuals.",
    },
    "switch-prompts": {
      pt: "Abra o Prompt Workspace para editar, copiar e reutilizar material.",
      es: "Abre el Prompt Workspace para editar, copiar y reutilizar material.",
      en: "Open the Prompt Workspace to edit, copy and reuse material.",
      ca: "Obre el Prompt Workspace per editar, copiar i reutilitzar material.",
    },
    "switch-compare": {
      pt: "Compare a run atual com a baseline ou com a anterior.",
      es: "Compara la run actual con la baseline o la anterior.",
      en: "Compare the current run against baseline or the previous one.",
      ca: "Compara la run actual amb la baseline o l'anterior.",
    },
    "switch-settings": {
      pt: "Abra memória, overrides e aprendizados persistentes.",
      es: "Abre memoria, overrides y aprendizajes persistentes.",
      en: "Open memory, overrides and persistent learnings.",
      ca: "Obre memòria, overrides i aprenentatges persistents.",
    },
    "open-memory": {
      pt: "Abra o aprendizado operacional já associado a essa issue.",
      es: "Abre el aprendizaje operacional ya asociado a esta issue.",
      en: "Open the operational learning already attached to this issue.",
      ca: "Obre l'aprenentatge operacional ja associat a aquesta issue.",
    },
    "open-healing": {
      pt: "Veja a fila de healing e as estratégias elegíveis.",
      es: "Mira la cola de healing y las estrategias elegibles.",
      en: "Inspect the healing queue and eligible strategies.",
      ca: "Mira la cua de healing i les estratègies elegibles.",
    },
    "prepare-healing": {
      pt: "Prepare a tentativa assistida antes de revalidar.",
      es: "Prepara el intento asistido antes de revalidar.",
      en: "Prepare the assisted attempt before revalidation.",
      ca: "Prepara l'intent assistit abans de revalidar.",
    },
    "revalidate-healing": {
      pt: "Rode a nova verificação para saber se a correção realmente resolveu.",
      es: "Ejecuta la nueva verificación para saber si la corrección realmente resolvió.",
      en: "Run revalidation to confirm whether the fix actually resolved the issue.",
      ca: "Executa la revalidació per confirmar si la correcció realment ha resolt la issue.",
    },
    "generate-prompt": {
      pt: "Gere um prompt mais específico com base no contexto atual.",
      es: "Genera un prompt más específico con base en el contexto actual.",
      en: "Generate a more specific prompt from the current context.",
      ca: "Genera un prompt més específic a partir del context actual.",
    },
    "manual-override": {
      pt: "Promova manualmente uma solução final com rastreabilidade.",
      es: "Promueve manualmente una solución final con trazabilidad.",
      en: "Promote a final solution manually with traceability.",
      ca: "Promou manualment una solució final amb traçabilitat.",
    },
    "copy-text": {
      pt: "Copie o conteúdo preparado sem sair da conversa.",
      es: "Copia el contenido preparado sin salir de la conversación.",
      en: "Copy the prepared content without leaving the conversation.",
      ca: "Copia el contingut preparat sense sortir de la conversa.",
    },
  };

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function toLower(value) {
    return normalizeText(value).toLowerCase();
  }

  function matchesAny(query, terms) {
    return terms.some((term) => {
      const normalized = toLower(term);
      if (!normalized) return false;
      if (normalized.includes(" ")) {
        return query.includes(normalized);
      }
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(query);
    });
  }

  function getLanguageKey(context) {
    const language = normalizeText(context?.assistantLanguage?.activeLanguage || "en").toLowerCase();
    return ["pt", "es", "ca"].includes(language) ? language : "en";
  }

  function getHumanCopy(languageKey) {
    return HUMAN_COPY[getLanguageKey({ assistantLanguage: { activeLanguage: languageKey } })] || HUMAN_COPY.en;
  }

  function getLocalizedActionDescription(actionId, languageKey) {
    const copy = ACTION_CARD_COPY[String(actionId || "")];
    if (!copy) return getHumanCopy(languageKey).actionCardHint;
    return copy[languageKey] || copy.en || getHumanCopy(languageKey).actionCardHint;
  }

  function isShortFollowUp(query) {
    const normalized = normalizeText(query);
    if (!normalized) return false;
    const lowered = normalized.toLowerCase();
    return normalized.split(/\s+/).length <= 4
      || ["e agora", "e depois", "what next", "and now", "continue", "continua", "continúe", "detalha", "detalle", "simplifica", "simplify", "resume", "resuma"].some((term) => lowered.includes(term));
  }

  function detectTone(query, intentId, previousToneKey = "friendly") {
    const lowered = toLower(query);
    if (intentId === "prompt") return "prompt_engineer";
    if (["greeting", "thanks"].includes(intentId)) return "friendly";
    if (["resumo executivo", "executive summary", "for leadership", "para diretoria", "para cliente", "only the headline"].some((term) => lowered.includes(term))) {
      return "executive_summary";
    }
    if (["explica simples", "explain simply", "bem simples", "for non technical", "simplifica", "simple"].some((term) => lowered.includes(term))) {
      return "simple";
    }
    if (["root cause", "deep dive", "advanced", "engineering detail", "arquitetura", "detalhado", "detallado", "tecnico", "technical"].some((term) => lowered.includes(term))) {
      return lowered.includes("advanced") || lowered.includes("deep dive") || lowered.includes("engineering detail")
        ? "advanced_engineer"
        : "technical";
    }
    if (previousToneKey === "prompt_engineer" && isShortFollowUp(query)) {
      return "prompt_engineer";
    }
    return "friendly";
  }

  function getIntentCategory(intentId) {
    if (["greeting", "thanks"].includes(intentId)) return "social";
    if (["audit", "analyze_seo_fix", "manual_override", "healing_revalidate", "latest_run"].includes(intentId)) return "action";
    if (["guide", "memory_guide"].includes(intentId)) return "guide";
    if (["issue_explain", "memory", "logs", "failed", "validated", "unresolved_critical"].includes(intentId)) return "explanation";
    if (["seo", "impact", "worsening", "predictive_risk", "trend", "systemic_patterns", "compare"].includes(intentId)) return "analysis";
    if (["prompt"].includes(intentId)) return "prompt";
    return "strategy";
  }

  function buildGreetingResponse(context) {
    const report = context.report;
    const languageKey = getLanguageKey(context);
    const copy = getHumanCopy(languageKey);
    return {
      title: "Greeting",
      summary: copy.greetingLead,
      analysis: report
        ? [
            `${report.meta.baseUrl} is loaded in the desktop right now.`,
            `Current report: ${report.summary.totalIssues} issue(s), SEO ${report.summary.seoScore}, quality ${context.dataIntelligence?.QUALITY_STATE?.overallScore || context.autonomous?.qualityScore?.total || 0}.`,
            "I can analyze the audit, explain an issue, rank what to fix first or generate a fix prompt.",
          ]
        : [
            copy.noReport,
            "I can still guide you through the app, explain the current workspace or prepare the next audit.",
          ],
      actions: report
        ? [
            { id: "switch-findings", label: "Open findings" },
            { id: "switch-prompts", label: "Open prompts" },
            { id: "switch-seo", label: "Open SEO workspace" },
          ]
        : [{ id: "switch-overview", label: "Open overview" }],
    };
  }

  function buildThanksResponse(context) {
    const languageKey = getLanguageKey(context);
    const copy = getHumanCopy(languageKey);
    return {
      title: "Acknowledged",
      summary: copy.thanksLead,
      analysis: [copy.followUp],
      actions: context.report
        ? [
            { id: "switch-findings", label: "Open findings" },
            { id: "switch-prompts", label: "Open prompts" },
          ]
        : [{ id: "switch-overview", label: "Open overview" }],
    };
  }

  function findIssueByCode(context, issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    return (context.report?.issues || []).find((issue) => normalizeText(issue.code).toUpperCase() === code) || null;
  }

  function inferIssueCode(query, context, conversationState = null) {
    const match = normalizeText(query).toUpperCase().match(/\b[A-Z]{2,}(?:_[A-Z0-9]+)+\b/);
    if (match) return match[0];
    if (conversationState?.lastIssueCode && ["this issue", "essa issue", "esta issue", "este problema", "that issue", "aquesta issue"].some((term) => toLower(query).includes(term))) {
      return conversationState.lastIssueCode;
    }
    if (conversationState?.lastIssueCode && isShortFollowUp(query)) {
      return conversationState.lastIssueCode;
    }
    return context.report?.issues?.[0]?.code || "";
  }

  function summarizeMemory(memory, issueCode) {
    const entry = (memory?.entries || []).find((item) => normalizeText(item.issueCode).toUpperCase() === normalizeText(issueCode).toUpperCase());
    if (!entry) return null;
    return {
      issueCode: entry.issueCode,
      category: normalizeText(entry.category),
      severity: normalizeText(entry.severity),
      validated: Number(entry.learningCounts?.validated || 0),
      failed: Number(entry.learningCounts?.failed || 0),
      partial: Number(entry.learningCounts?.partial || 0),
      finalResolution: normalizeText(entry.finalResolution),
      possibleResolution: normalizeText(entry.possibleResolution),
      finalResolutionOrigin: normalizeText(entry.finalResolutionOrigin),
      avoidText: normalizeText(entry.avoidText),
      latestValidatedFix: normalizeText(entry.latestValidatedFix),
      learningSource: normalizeText(entry.learningSource),
    };
  }

  function summarizeHealing(selfHealing, issueCode) {
    const issues = Array.isArray(selfHealing?.issues) ? selfHealing.issues : [];
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    const issue = issues.find((item) => normalizeText(item.issueCode).toUpperCase() === code) || null;
    if (!issue) return null;
    return {
      issueCode: issue.issueCode,
      route: normalizeText(issue.route || "/"),
      action: normalizeText(issue.action),
      severity: normalizeText(issue.severity),
      eligibility: normalizeText(issue.eligibility),
      healingMode: normalizeText(issue.healingMode),
      confidenceScore: Number(issue.confidenceScore || 0),
      confidenceLabel: normalizeText(issue.confidenceLabel),
      strategyId: normalizeText(issue.strategyId),
      strategyDescription: normalizeText(issue.strategyDescription),
      resolutionLead: normalizeText(issue.resolutionLead),
      resolutionSource: normalizeText(issue.resolutionSource),
      promptReady: issue.promptReady === true,
      suggestedNextStep: normalizeText(issue.suggestedNextStep),
      avoidText: normalizeText(issue.avoidText),
      promptText: normalizeText(issue.promptText),
      rationale: Array.isArray(issue.rationale) ? issue.rationale.map((entry) => normalizeText(entry)).filter(Boolean) : [],
      lastAttempt: issue.lastAttempt && typeof issue.lastAttempt === "object"
        ? {
            outcome: normalizeText(issue.lastAttempt.outcome),
            status: normalizeText(issue.lastAttempt.status),
            updatedAt: normalizeText(issue.lastAttempt.updatedAt),
            healingMode: normalizeText(issue.lastAttempt.healingMode),
          }
        : null,
    };
  }

  function summarizePredictive(predictive, issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    const entries = Object.values(predictive?.issueSignals || {});
    const issue = entries.find((item) => normalizeText(item.issueCode).toUpperCase() === code) || null;
    if (!issue) return null;
    return {
      issueCode: issue.issueCode,
      trendDirection: normalizeText(issue.trendDirection),
      trendStrength: Number(issue.trendStrength || 0),
      trendConfidence: Number(issue.trendConfidence || 0),
      riskLevel: normalizeText(issue.riskLevel),
      riskCategory: normalizeText(issue.riskCategory),
      riskConfidence: Number(issue.riskConfidence || 0),
      recurringCount: Number(issue.recurringCount || 0),
      evidence: Array.isArray(issue.evidence) ? issue.evidence.map((entry) => normalizeText(entry)).filter(Boolean) : [],
    };
  }

  function summarizeAutonomous(autonomous, issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    const playbooks = autonomous?.playbooks && typeof autonomous.playbooks === "object" ? autonomous.playbooks : {};
    const entry = Object.values(playbooks).find((item) => normalizeText(item.issueCode).toUpperCase() === code) || null;
    if (!entry) return null;
    return {
      issueCode: entry.issueCode,
      title: normalizeText(entry.title),
      diagnosticStep: normalizeText(entry.diagnosticStep),
      healingStrategy: normalizeText(entry.healingStrategy),
      promptTemplate: normalizeText(entry.promptTemplate),
      revalidationRule: normalizeText(entry.revalidationRule),
      learningRule: normalizeText(entry.learningRule),
      nextActionScore: Number(entry.nextActionScore || 0),
      nextActionLabel: normalizeText(entry.nextActionLabel),
    };
  }

  function summarizeDataIssue(dataIntelligence, issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    const issues = Array.isArray(dataIntelligence?.ISSUE_STATE) ? dataIntelligence.ISSUE_STATE : [];
    return issues.find((item) => normalizeText(item.issueCode).toUpperCase() === code) || null;
  }

  function getHealingCandidates(selfHealing, appContext = {}) {
    const issues = Array.isArray(selfHealing?.issues) ? selfHealing.issues : [];
    const maps = buildOperationalPriorityMaps(appContext);
    return [...issues]
      .filter((item) => ["eligible_for_healing", "assist_only"].includes(normalizeText(item.eligibility)))
      .sort((left, right) => {
        const leftEntry = getOperationalEntry({ code: left.issueCode, route: left.route, action: left.action }, maps);
        const rightEntry = getOperationalEntry({ code: right.issueCode, route: right.route, action: right.action }, maps);
        if (rightEntry.nextAction.score !== leftEntry.nextAction.score) return rightEntry.nextAction.score - leftEntry.nextAction.score;
        if (rightEntry.priority.score !== leftEntry.priority.score) return rightEntry.priority.score - leftEntry.priority.score;
        return Number(right.confidenceScore || 0) - Number(left.confidenceScore || 0);
      })
      .slice(0, 8);
  }

  function priorityRank(priorityLevel) {
    switch (normalizeText(priorityLevel).toUpperCase()) {
      case "P0":
        return 0;
      case "P1":
        return 1;
      case "P2":
        return 2;
      case "P3":
        return 3;
      default:
        return 4;
    }
  }

  function buildOperationalPriorityMaps(appContext) {
    const nextActionMap = new Map();
    const nextActionByCode = new Map();
    const priorityMap = new Map();
    const priorityByCode = new Map();
    const nextActions = Array.isArray(appContext?.autonomous?.nextActions) ? appContext.autonomous.nextActions : [];
    nextActions.forEach((item, index) => {
      const code = normalizeText(item.issueCode).toUpperCase();
      const key = [code, normalizeText(item.route || "/"), normalizeText(item.action)].join("|");
      const payload = { score: Number(item.score || 0), rank: index };
      nextActionMap.set(key, payload);
      if (!nextActionByCode.has(code)) nextActionByCode.set(code, payload);
    });
    const queue = Array.isArray(appContext?.dataIntelligence?.RISK_STATE?.priorityQueue) ? appContext.dataIntelligence.RISK_STATE.priorityQueue : [];
    queue.forEach((item, index) => {
      const code = normalizeText(item.issueCode).toUpperCase();
      const key = [code, normalizeText(item.route || "/"), normalizeText(item.action)].join("|");
      const payload = { score: Number(item.compositeScore || 0), rank: index };
      priorityMap.set(key, payload);
      if (!priorityByCode.has(code)) priorityByCode.set(code, payload);
    });
    return { nextActionMap, nextActionByCode, priorityMap, priorityByCode };
  }

  function getOperationalEntry(issue, maps) {
    const code = normalizeText(issue?.code).toUpperCase();
    const route = normalizeText(issue?.route || "/");
    const action = normalizeText(issue?.action);
    const key = [code, route, action].join("|");
    return {
      nextAction: maps.nextActionMap.get(key) || maps.nextActionByCode.get(code) || { score: 0, rank: Number.MAX_SAFE_INTEGER },
      priority: maps.priorityMap.get(key) || maps.priorityByCode.get(code) || { score: 0, rank: Number.MAX_SAFE_INTEGER },
    };
  }

  function prioritizeIssues(report, appContext = {}) {
    const issues = Array.isArray(report?.issues) ? report.issues : [];
    const maps = buildOperationalPriorityMaps(appContext);
    return [...issues].sort((left, right) => {
      const leftEntry = getOperationalEntry(left, maps);
      const rightEntry = getOperationalEntry(right, maps);
      if (rightEntry.nextAction.score !== leftEntry.nextAction.score) return rightEntry.nextAction.score - leftEntry.nextAction.score;
      if (leftEntry.nextAction.rank !== rightEntry.nextAction.rank) return leftEntry.nextAction.rank - rightEntry.nextAction.rank;
      if (rightEntry.priority.score !== leftEntry.priority.score) return rightEntry.priority.score - leftEntry.priority.score;
      if (leftEntry.priority.rank !== rightEntry.priority.rank) return leftEntry.priority.rank - rightEntry.priority.rank;
      const byPriority = priorityRank(left.impact?.priorityLevel) - priorityRank(right.impact?.priorityLevel);
      if (byPriority !== 0) return byPriority;
      const byImpact = Number(right.impact?.impactScore || 0) - Number(left.impact?.impactScore || 0);
      if (byImpact !== 0) return byImpact;
      const severityRankLeft = left.severity === "high" ? 3 : left.severity === "medium" ? 2 : 1;
      const severityRankRight = right.severity === "high" ? 3 : right.severity === "medium" ? 2 : 1;
      if (severityRankRight !== severityRankLeft) return severityRankRight - severityRankLeft;
      const validatedLeft = Number(left.learningCounts?.validated || 0);
      const validatedRight = Number(right.learningCounts?.validated || 0);
      if (validatedLeft !== validatedRight) return validatedLeft - validatedRight;
      return normalizeText(left.code).localeCompare(normalizeText(right.code));
    });
  }

  function getIntentDefinition(query, conversationState = null) {
    if (!query) {
      return INTENT_DEFINITIONS.find((definition) => definition.id === "priorities");
    }
    const direct = INTENT_DEFINITIONS.find((definition) => matchesAny(query, definition.terms));
    if (direct) return direct;
    if (isShortFollowUp(query) && conversationState?.lastIntentId) {
      return INTENT_DEFINITIONS.find((definition) => definition.id === conversationState.lastIntentId)
        || INTENT_DEFINITIONS.find((definition) => definition.id === "next_step")
        || INTENT_DEFINITIONS.find((definition) => definition.id === "priorities");
    }
    return INTENT_DEFINITIONS.find((definition) => definition.id === "priorities");
  }

  function filterActionsForMode(modeKey, actions) {
    const mode = MODE_REGISTRY[modeKey];
    if (!mode || !Array.isArray(actions)) return [];
    const allowed = new Set(mode.allowedActions);
    return actions.filter((action) => allowed.has(String(action?.id || "")));
  }

  function buildModeContext(modeKey, appContext, rawQuery, conversationState = null) {
    const report = appContext.report || null;
    const issueCode = inferIssueCode(rawQuery, appContext, conversationState);
    const prioritizedIssues = prioritizeIssues(report, appContext);
    const issue = findIssueByCode(appContext, issueCode);
    const issueMemory = summarizeMemory(appContext.learningMemory, issueCode);
    const issueHealing = summarizeHealing(appContext.selfHealing, issueCode);
    const issuePredictive = summarizePredictive(appContext.predictive, issueCode);
    const issueAutonomous = summarizeAutonomous(appContext.autonomous, issueCode);
    const history = Array.isArray(appContext.runHistory) ? appContext.runHistory : [];
    const availableCommands = Array.isArray(appContext.availableCommands) ? appContext.availableCommands : [];
    const intelligence = appContext.intelligence && typeof appContext.intelligence === "object" ? appContext.intelligence : null;
    const predictive = appContext.predictive && typeof appContext.predictive === "object" ? appContext.predictive : null;
    const autonomous = appContext.autonomous && typeof appContext.autonomous === "object" ? appContext.autonomous : null;
    const dataIntelligence = appContext.dataIntelligence && typeof appContext.dataIntelligence === "object" ? appContext.dataIntelligence : null;
    const optimization = appContext.optimization && typeof appContext.optimization === "object" ? appContext.optimization : null;
    const dataIssue = summarizeDataIssue(dataIntelligence, issueCode);

    const baseContext = {
      ...appContext,
      mode: MODE_REGISTRY[modeKey],
      modeKey,
      rawQuery,
      issueCode,
      issue,
      issueMemory,
      issueHealing,
      issuePredictive,
      issueAutonomous,
      prioritizedIssues,
      criticalIssues: prioritizedIssues.filter((entry) => entry.severity === "high"),
      runHistory: history,
      availableCommands,
      intelligence,
      predictive,
      autonomous,
      dataIntelligence,
      optimization,
      dataIssue,
    };

    if (modeKey === "operator") {
      return {
        ...baseContext,
        operatorContext: {
          activeView: appContext.activeView,
          commands: availableCommands.slice(0, 12),
          currentRun: report
            ? {
                baseUrl: report.meta.baseUrl,
                totalIssues: report.summary.totalIssues,
                seoScore: report.summary.seoScore,
              }
            : null,
          healingSummary: appContext.selfHealing?.summary || null,
        },
      };
    }

    if (modeKey === "audit_analyst") {
      return {
        ...baseContext,
        auditContext: {
          topIssues: prioritizedIssues.slice(0, 8),
          logs: Array.isArray(appContext.logs) ? appContext.logs.slice(-12) : [],
          memorySummary: appContext.learningMemory?.summary || null,
          healingSummary: appContext.selfHealing?.summary || null,
          impactSummary: intelligence?.executiveSummary || null,
          predictiveSummary: predictive?.summary || null,
          autonomousSummary: autonomous?.qualityScore || null,
          dataSummary: dataIntelligence?.RISK_STATE || null,
          optimizationSummary: optimization?.summary || null,
        },
      };
    }

    if (modeKey === "prompt_engineer") {
      return {
        ...baseContext,
        promptContext: {
          issueCode,
          issue,
          issueMemory,
          issueHealing,
          promptWorkspaceReady: typeof appContext.buildIssuePrompt === "function",
        },
      };
    }

    if (modeKey === "product_guide") {
      return {
        ...baseContext,
        guideContext: {
          activeView: appContext.activeView,
          workspaceHelp: appContext.workspaceHelp || {},
          commands: availableCommands.slice(0, 10),
        },
      };
    }

    if (modeKey === "bug_analyst") {
      const bd = appContext.bugDetector && typeof appContext.bugDetector === "object" ? appContext.bugDetector : null;
      return {
        ...baseContext,
        bugContext: {
          reportId: bd?.reportId || null,
          description: bd?.description || "",
          url: bd?.url || "",
          elementSelector: bd?.elementSelector || "",
          severity: bd?.severity || "medium",
          aiProvider: bd?.aiProvider || "none",
          aiConfidence: bd?.aiConfidence || 0,
          rootCause: bd?.rootCause || "",
          solution: bd?.solution || "",
          recommendations: Array.isArray(bd?.recommendations) ? bd.recommendations : [],
          fixCode: bd?.fixCode || "",
          fixLanguage: bd?.fixLanguage || "",
          consoleLogCount: bd?.consoleLogCount || 0,
          networkRequestCount: bd?.networkRequestCount || 0,
          hasScreenshot: bd?.hasScreenshot || false,
          hasVideo: bd?.hasVideo || false,
        },
      };
    }

    return {
      ...baseContext,
      strategyContext: {
        topIssues: prioritizedIssues.slice(0, 5),
        compareDigest: appContext.compareDigest || "",
        runHistory: history.slice(0, 5),
        healingSummary: appContext.selfHealing?.summary || null,
        healingCandidates: getHealingCandidates(appContext.selfHealing, appContext),
        intelligence,
        predictive,
        autonomous,
        dataIntelligence,
        optimization,
      },
    };
  }

  function buildActionCards(actions, languageKey) {
    return (Array.isArray(actions) ? actions : []).map((action) => ({
      id: String(action.id || ""),
      label: String(action.label || action.id || ""),
      description: getLocalizedActionDescription(action.id, languageKey),
      payload: action.payload && typeof action.payload === "object" ? { ...action.payload } : {},
    }));
  }

  function buildPromptCard(result, languageKey) {
    if (!normalizeText(result.promptText)) return null;
    const copy = getHumanCopy(languageKey);
    return {
      title: copy.promptCardTitle,
      context: copy.promptCardContext,
      promptText: String(result.promptText || ""),
      copyLabel: copy.copyPrompt,
      sendLabel: copy.sendPrompt,
      saveLabel: copy.savePrompt,
    };
  }

  function buildConversationalEnvelope(result, meta) {
    const copy = getHumanCopy(meta.languageKey);
    const analysis = Array.isArray(result.analysis) ? result.analysis.filter(Boolean) : [];
    const localizedHint = (values) => values[meta.languageKey] || values.en;
    const limitedAnalysis = (() => {
      switch (meta.toneKey) {
        case "executive_summary":
          return analysis.slice(0, 2);
        case "simple":
        case "friendly":
          return analysis.slice(0, 3);
        case "technical":
          return analysis.slice(0, 5);
        case "advanced_engineer":
          return analysis;
        default:
          return analysis.slice(0, 4);
      }
    })();

    let lead = copy.analysisLead;
    if (meta.intentId === "greeting") lead = copy.greetingLead;
    if (meta.intentId === "thanks") lead = copy.thanksLead;
    if (meta.intentCategory === "guide") lead = copy.guideLead;
    if (meta.intentCategory === "strategy") lead = copy.strategyLead;
    if (meta.intentCategory === "action") lead = copy.operatorLead;
    if (meta.intentCategory === "prompt") lead = copy.promptLead;
    if (meta.toneKey === "executive_summary") lead = copy.executiveLead;
    if (meta.toneKey === "technical" || meta.toneKey === "advanced_engineer") lead = copy.technicalLead;
    if (meta.toneKey === "simple") lead = copy.simpleLead;

    const body = [];
    if (meta.toneKey === "technical" || meta.toneKey === "advanced_engineer" || meta.languageKey === "en") {
      if (normalizeText(result.summary)) {
        body.push(String(result.summary || ""));
      }
      body.push(...limitedAnalysis);
    } else {
      if (meta.intentCategory === "social") {
        body.push(localizedHint({
          pt: "Eu posso analisar a auditoria atual, te dizer o que corrigir primeiro, explicar uma issue, interpretar logs ou montar um prompt pronto para voce.",
          es: "Puedo analizar la auditoria actual, decirte que corregir primero, explicar una issue, interpretar logs o montar un prompt listo para ti.",
          en: "I can analyze the current audit, tell you what to fix first, explain an issue, interpret logs or prepare a ready-to-use prompt for you.",
          ca: "Puc analitzar l'auditoria actual, dir-te que corregir primer, explicar una issue, interpretar logs o preparar un prompt llest per a tu.",
        }));
      } else if (meta.intentCategory === "prompt") {
        body.push(localizedHint({
          pt: "Deixei um prompt card logo abaixo para voce copiar, salvar ou mandar direto para o Prompt Workspace.",
          es: "Deje una prompt card abajo para que la copies, la guardes o la mandes directo al Prompt Workspace.",
          en: "I left a prompt card below so you can copy it, save it or send it straight to the Prompt Workspace.",
          ca: "He deixat una prompt card a sota perque la copiïs, la desis o l'enviïs directament al Prompt Workspace.",
        }));
      } else if (meta.intentCategory === "action") {
        body.push(localizedHint({
          pt: "A acao sugerida continua conectada ao estado real do app e pode ser executada daqui.",
          es: "La accion sugerida sigue conectada al estado real de la app y puede ejecutarse desde aqui.",
          en: "The suggested action remains connected to the real app state and can be executed from here.",
          ca: "L'accio suggerida continua connectada a l'estat real de l'app i es pot executar des d'aqui.",
        }));
      } else if (meta.intentCategory === "strategy") {
        body.push(localizedHint({
          pt: "Eu levei em conta impacto, risco preditivo, historico, tendencia e confianca de healing para priorizar isso.",
          es: "Tome en cuenta impacto, riesgo predictivo, historial, tendencia y confianza de healing para priorizar esto.",
          en: "I used impact, predictive risk, history, trend and healing confidence to prioritize this.",
          ca: "He tingut en compte impacte, risc predictiu, historial, tendencia i confianca de healing per prioritzar aixo.",
        }));
      } else if (meta.intentCategory === "analysis") {
        body.push(localizedHint({
          pt: "Li o contexto atual e estou te devolvendo o que mais importa sem te jogar num bloco tecnico seco.",
          es: "Lei el contexto actual y te devuelvo lo que mas importa sin tirarte un bloque tecnico seco.",
          en: "I reviewed the current context and I am giving you the part that matters most without turning it into a dry technical block.",
          ca: "He llegit el context actual i et torno la part que mes importa sense convertir-ho en un bloc tecnic sec.",
        }));
      } else if (meta.intentCategory === "guide") {
        body.push(localizedHint({
          pt: "Estou usando o estado atual da ferramenta para te mostrar o caminho mais curto e util.",
          es: "Estoy usando el estado actual de la herramienta para mostrarte el camino mas corto y util.",
          en: "I am using the current tool state to show you the shortest useful path.",
          ca: "Estic usant l'estat actual de l'eina per mostrar-te el cami mes curt i util.",
        }));
      }
      if (meta.intentCategory !== "social" && normalizeText(result.title)) {
        body.push(String(result.title || ""));
      }
      if (meta.intentCategory !== "social" && Array.isArray(result.actions) && result.actions.length) {
        body.push(localizedHint({
          pt: "A primeira acao pratica ja esta logo abaixo em formato de card.",
          es: "La primera accion practica ya esta abajo en formato de card.",
          en: "The first practical action is already shown below as a card.",
          ca: "La primera accio practica ja apareix a sota en format de card.",
        }));
      }
      if (meta.intentCategory !== "social") {
        body.push(...limitedAnalysis.slice(0, 1));
      }
    }
    if (!body.length && meta.intentId !== "greeting") {
      body.push(copy.noReport);
    }

    const actionCards = buildActionCards(result.actions, meta.languageKey);
    const defaultChipIds = ["switch-findings", "prepare-healing", "generate-prompt"];
    const hasReportContext = !!result.hasReportContext;
    if (hasReportContext && actionCards.length < 4) {
      const existingIds = new Set(actionCards.map((a) => a.id));
      defaultChipIds.forEach((id) => {
        if (!existingIds.has(id)) {
          const label = id === "switch-findings" ? "Open findings" : id === "prepare-healing" ? "Prepare healing" : "Generate prompt";
          actionCards.push({ id, label, description: getLocalizedActionDescription(id, meta.languageKey), payload: {} });
          existingIds.add(id);
        }
      });
    }

    return {
      ...result,
      toneKey: meta.toneKey,
      intentCategory: meta.intentCategory,
      assistantLead: lead,
      assistantBody: body,
      assistantFollowUp: copy.followUp,
      promptCard: buildPromptCard(result, meta.languageKey),
      actionCards,
    };
  }

  function wrapModeResult(modeKey, intentId, result, meta = {}) {
    const mode = MODE_REGISTRY[modeKey] || MODE_REGISTRY.strategy_advisor;
    const hasReportContext = !!meta.context?.report;
    const wrapped = {
      ...result,
      hasReportContext,
      modeKey: mode.key,
      modeName: mode.name,
      modeDescription: mode.description,
      modeCapabilities: [...mode.capabilities],
      modeContextSources: [...mode.contextSources],
      modePriorityRules: [...mode.priorityRules],
      responseStyle: mode.responseStyle,
      intentId,
      actions: filterActionsForMode(mode.key, Array.isArray(result.actions) ? result.actions : []),
    };
    return buildConversationalEnvelope(wrapped, {
      languageKey: meta.languageKey || "en",
      toneKey: meta.toneKey || "friendly",
      intentCategory: meta.intentCategory || getIntentCategory(intentId),
      intentId,
    });
  }

  function buildGuideResponse(context) {
    const activeView = normalizeText(context.activeView || "overview");
    const workspaceHelp = context.workspaceHelp?.[activeView];
    if (!workspaceHelp) {
      return {
        title: "App guide",
        summary: "No workspace-specific help was found for the current surface.",
        analysis: ["Open Overview, Findings, SEO, Prompts, Compare, Reports or Settings for guided help."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    return {
      title: `${workspaceHelp.title || "App guide"} help`,
      summary: workspaceHelp.description || "Use the active workspace to operate the audit flow.",
      analysis: workspaceHelp.steps || [],
      actions: workspaceHelp.actions || [],
    };
  }

  function buildMemoryGuideResponse(context) {
    const help = context.workspaceHelp?.settings;
    return {
      title: "Memory panel guide",
      summary: "The memory panel lives in Settings and shows validated, failed, partial, auto-promoted and manual override patterns.",
      analysis: help?.steps || [
        "Use filters to isolate validated, failed or partial patterns.",
        "Focus a specific issue code to inspect its history.",
        "Use Promote solution only when you want a deliberate manual override with traceability.",
      ],
      actions: [{ id: "switch-settings", label: "Open learning memory" }],
    };
  }

  function describeImpact(issue) {
    const priority = normalizeText(issue?.impact?.priorityLevel || "P4");
    const impactScore = Number(issue?.impact?.impactScore || 0).toFixed(2);
    const riskType = normalizeText(issue?.impact?.riskType || issue?.impact?.impactCategory || "operational risk");
    return `${priority} | impact ${impactScore} | ${riskType}`;
  }

  function buildPrioritiesResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No audit loaded",
        summary: "There is no report loaded. Run or load an audit first.",
        analysis: ["Prepare a target URL and run a native audit to unlock prioritization."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }

    const autonomousActions = Array.isArray(context.autonomous?.nextActions) ? context.autonomous.nextActions : [];
    const topIssues = context.strategyContext?.topIssues || prioritizeIssues(report, context).slice(0, 3);
    const executive = context.intelligence?.executiveSummary;
    const lines = autonomousActions.length
      ? autonomousActions.slice(0, 4).map((item, index) => `${index + 1}. ${item.actionLabel} | score ${Number(item.score || 0).toFixed(2)} | ${item.playbookTitle}`)
      : topIssues.length
      ? topIssues.map((issue, index) => {
          const memory = summarizeMemory(context.learningMemory, issue.code);
          const suffix = memory?.finalResolution
            ? `Final resolution available (${memory.finalResolutionOrigin || "runtime"}).`
            : memory?.failed
            ? `There are ${memory.failed} failed attempt(s); avoid repeating them blindly.`
            : "No validated fix is attached yet.";
          return `${index + 1}. ${issue.code} on ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}. ${describeImpact(issue)}. ${suffix}`;
        })
      : ["No issues are currently loaded."];

    if (context.strategyContext?.runHistory?.length > 1) {
      lines.push(`Recent history loaded: ${context.strategyContext.runHistory.length} snapshot(s).`);
    }
    if (context.autonomous?.qualityScore?.total) {
      lines.push(`Current SitePulse Quality Score: ${context.dataIntelligence?.QUALITY_STATE?.overallScore || context.autonomous.qualityScore.total}. Trajectory: ${context.dataIntelligence?.QUALITY_STATE?.trajectory || context.autonomous.qualityTrajectory?.direction || "stable"}.`);
    }
    if (Array.isArray(executive?.recommendedActionOrder) && executive.recommendedActionOrder.length) {
      lines.push("Recommended action order:");
      executive.recommendedActionOrder.slice(0, 4).forEach((step) => lines.push(step));
    }

    return {
      title: "What to do first",
      summary: executive?.headline || `Current report has ${report.summary.totalIssues} issue(s) with SEO ${report.summary.seoScore}.`,
      analysis: lines,
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "switch-prompts", label: "Open prompts" },
      ],
    };
  }

  function buildSeoResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "There is no audit report to analyze.",
        analysis: ["Run or load an audit before asking for SEO priorities."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }

    const seoIssues = (report.issues || [])
      .filter((issue) => normalizeText(issue.code).startsWith("SEO_"))
      .sort((left, right) =>
        priorityRank(left.impact?.priorityLevel) - priorityRank(right.impact?.priorityLevel)
        || Number(right.impact?.impactScore || 0) - Number(left.impact?.impactScore || 0));
    const top = seoIssues.slice(0, 4);
    return {
      title: "SEO priorities",
      summary: `SEO score ${report.summary.seoScore}. ${report.summary.seoCriticalIssues || 0} critical SEO issue(s).`,
      analysis: top.length
        ? top.map((issue, index) => `${index + 1}. ${issue.code} | ${describeImpact(issue)} | ${issue.route} | ${issue.detail}`)
        : ["No dedicated SEO issue is loaded in the current report."],
      actions: [
        { id: "switch-seo", label: "Open SEO workspace" },
        { id: "findings-search", label: "Filter SEO findings", payload: { query: "SEO_" } },
      ],
    };
  }

  function buildCompareResponse(context) {
    if (!context.compareDigest || /^No baseline/i.test(context.compareDigest)) {
      return {
        title: "No comparison baseline",
        summary: "There is no baseline or previous run to compare against.",
        analysis: ["Pin the current report as baseline or load a previous snapshot first."],
        actions: [{ id: "switch-compare", label: "Open compare" }],
      };
    }

    return {
      title: "Run comparison",
      summary: context.intelligence?.trendSummary?.seo?.text || "The desktop already has comparison data available.",
      analysis: context.compareDigest.split("\n").slice(0, 10),
      actions: [{ id: "switch-compare", label: "Open compare" }],
    };
  }

  function buildRegressionResponse(context) {
    if (!context.compareDigest || /^No baseline/i.test(context.compareDigest)) {
      return {
        title: "No comparison baseline",
        summary: "The assistant cannot tell what worsened without a baseline or previous run.",
        analysis: ["Pin a baseline or load a previous snapshot first."],
        actions: [{ id: "switch-compare", label: "Open compare" }],
      };
    }

    return {
      title: "What worsened",
      summary: context.predictive?.alerts?.[0]?.label || context.intelligence?.trendSummary?.seo?.text || "Current regression view against the active baseline.",
      analysis: [
        context.intelligence?.trendSummary?.runtime?.text || "Runtime trend unavailable.",
        context.intelligence?.trendSummary?.ux?.text || "UX trend unavailable.",
        ...(context.predictive?.alerts?.length ? context.predictive.alerts.slice(0, 2).map((alert) => `${alert.label} | confidence ${Number(alert.riskConfidence || 0).toFixed(2)}`) : []),
        ...context.compareDigest.split("\n").slice(0, 12),
      ],
      actions: [{ id: "switch-compare", label: "Open compare" }],
    };
  }

  function buildImpactResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "Load a run before asking for impact prioritization.",
        analysis: ["Run or load an audit first."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }
    const topIssues = prioritizeIssues(report, context).slice(0, 5);
    return {
      title: "Highest-impact issues",
      summary: context.intelligence?.executiveSummary?.headline || context.predictive?.alerts?.[0]?.label || "Impact Engine sorted the current issues by operational pressure.",
      analysis: topIssues.length
        ? topIssues.map((issue, index) => {
            const predictive = summarizePredictive(context.predictive, issue.code);
            return `${index + 1}. ${issue.code} | ${describeImpact(issue)}${predictive ? ` | ${predictive.riskLevel} ${predictive.riskCategory}` : ""} | ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}`;
          })
        : ["No issue is currently loaded."],
      actions: [{ id: "switch-findings", label: "Open findings" }],
    };
  }

  function buildSeoRiskResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "There is no SEO context to analyze yet.",
        analysis: ["Run or load an audit first."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }
    const seoLead = prioritizeIssues(report, context).find((issue) => normalizeText(issue.code).startsWith("SEO_"));
    if (!seoLead) {
      return {
        title: "No SEO issue loaded",
        summary: "The current report does not expose a dedicated SEO issue.",
        analysis: ["Use the SEO workspace to confirm the score and checklist."],
        actions: [{ id: "switch-seo", label: "Open SEO workspace" }],
      };
    }
    return {
      title: "Biggest SEO risk",
      summary: `${seoLead.code} is currently the highest-impact SEO risk.`,
      analysis: [
        describeImpact(seoLead),
        seoLead.detail,
        ...(Array.isArray(seoLead.impact?.rationale) ? seoLead.impact.rationale.slice(0, 3) : []),
      ],
      actions: [
        { id: "switch-seo", label: "Open SEO workspace" },
        { id: "generate-prompt", label: "Generate prompt", payload: { issueCode: seoLead.code } },
      ],
    };
  }

  function buildOptimizationResponse(context) {
    const optimization = context.optimization;
    if (!optimization?.topImprovements?.length) {
      return {
        title: "No optimization opportunity",
        summary: "There is not enough clustered evidence yet to suggest structural improvements.",
        analysis: ["Run an audit with related issues across routes or keep comparable history for the same target."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    return {
      title: "Optimization opportunities",
      summary: `${optimization.summary?.seoOpportunities || 0} SEO, ${optimization.summary?.uxImprovements || 0} UX and ${optimization.summary?.performanceGains || 0} performance opportunity cluster(s) detected.`,
      analysis: optimization.topImprovements.slice(0, 5).map((item, index) =>
        `${index + 1}. ${item.title} | score ${Number(item.compositeScore || 0).toFixed(2)} | ${item.issueCount} issue(s) across ${item.routesAffected} route(s) | ${item.recommendation}`),
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-findings", label: "Open findings" },
      ],
    };
  }

  function buildStructuralRecommendationsResponse(context) {
    const optimization = context.optimization;
    const recommendations = Array.isArray(optimization?.structuralRecommendations) ? optimization.structuralRecommendations : [];
    if (!recommendations.length) {
      return {
        title: "No structural recommendation",
        summary: "No structural recommendation is attached to the current optimization snapshot.",
        analysis: ["The engine needs repeated or clustered issues before it can recommend a shared template or pipeline fix."],
        actions: [{ id: "switch-findings", label: "Open findings" }],
      };
    }
    return {
      title: "Structural improvements",
      summary: "The optimization engine found repeated issue clusters that should be fixed structurally instead of route by route.",
      analysis: recommendations.slice(0, 5),
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-prompts", label: "Open prompts" },
      ],
    };
  }

  function buildPredictiveRiskResponse(context) {
    const predictive = context.predictive;
    if (!predictive?.alerts?.length) {
      return {
        title: "No predictive alert",
        summary: "There is not enough comparable run history to raise a predictive regression alert yet.",
        analysis: ["Load at least one previous comparable run or keep building history for the same target."],
        actions: [{ id: "switch-compare", label: "Open compare" }],
      };
    }

    return {
      title: "Predictive regression risk",
      summary: predictive.alerts[0].label,
      analysis: predictive.alerts.slice(0, 4).flatMap((alert, index) => [
        `${index + 1}. ${alert.label} | ${alert.riskLevel} | confidence ${Number(alert.riskConfidence || 0).toFixed(2)}`,
        ...(Array.isArray(alert.evidence) ? alert.evidence.slice(0, 2).map((item) => `   - ${item}`) : []),
      ]),
      actions: [
        { id: "switch-compare", label: "Open compare" },
        { id: "switch-findings", label: "Open findings" },
      ],
    };
  }

  function buildWorseningResponse(context) {
    const degrading = Object.values(context.predictive?.issueSignals || {})
      .filter((signal) => ["degrading", "oscillating"].includes(normalizeText(signal.trendDirection)))
      .sort((left, right) => Number(right.riskConfidence || 0) - Number(left.riskConfidence || 0))
      .slice(0, 5);
    if (!degrading.length) {
      return {
        title: "No worsening pattern",
        summary: "No current issue is showing a degrading or oscillating trend with enough evidence.",
        analysis: ["The current history suggests stable or improving behavior for the loaded issues."],
        actions: [{ id: "switch-compare", label: "Open compare" }],
      };
    }
    return {
      title: "Problems getting worse",
      summary: `${degrading[0].issueCode} is the strongest worsening signal right now.`,
      analysis: degrading.map((signal, index) => `${index + 1}. ${signal.issueCode} | ${signal.trendDirection} | ${signal.riskLevel} | ${signal.evidence[0] || "No evidence attached."}`),
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "switch-compare", label: "Open compare" },
      ],
    };
  }

  function buildTrendResponse(context) {
    const predictive = context.predictive;
    if (!predictive) {
      return {
        title: "No predictive trend context",
        summary: "The predictive intelligence layer is not available in the current state.",
        analysis: ["Load a report and its recent history first."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    const overview = predictive.trendOverview || {};
    return {
      title: "Trend overview",
      summary: "Directional trends are computed only from comparable run history for the active target.",
      analysis: [
        context.dataIntelligence?.TREND_STATE?.seo?.text || overview.seo?.text || "SEO trend unavailable.",
        context.dataIntelligence?.TREND_STATE?.runtime?.text || overview.runtime?.text || "Runtime trend unavailable.",
        context.dataIntelligence?.TREND_STATE?.ux?.text || overview.ux?.text || "UX trend unavailable.",
        `Predictive alerts: ${predictive.summary?.highRiskAlerts || 0} high-risk and ${predictive.summary?.mediumRiskAlerts || 0} medium-risk.`,
      ],
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-compare", label: "Open compare" },
      ],
    };
  }

  function buildSystemicPatternsResponse(context) {
    const patterns = Array.isArray(context.predictive?.systemicPatterns) ? context.predictive.systemicPatterns : [];
    if (!patterns.length) {
      return {
        title: "No systemic pattern",
        summary: "The current history does not show a recurring systemic pattern yet.",
        analysis: ["Keep loading comparable runs for the same target if you want pattern detection to become stronger."],
        actions: [{ id: "switch-reports", label: "Open reports" }],
      };
    }
    return {
      title: "Systemic patterns",
      summary: patterns[0].label,
      analysis: patterns.slice(0, 5).map((pattern, index) => `${index + 1}. ${pattern.label} | ${pattern.riskLevel} | confidence ${Number(pattern.riskConfidence || 0).toFixed(2)}`),
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-findings", label: "Open findings" },
      ],
    };
  }

  function buildNextStepResponse(context) {
    const actions = Array.isArray(context.autonomous?.nextActions) ? context.autonomous.nextActions : [];
    if (!actions.length) {
      return {
        title: "No next action available",
        summary: "The autonomous QA engine could not derive a next action from the current state.",
        analysis: ["Load a report with issues, impact and healing context first."],
        actions: [{ id: "switch-findings", label: "Open findings" }],
      };
    }
    const lead = actions[0];
    return {
      title: "Next ideal step",
      summary: `${lead.actionLabel} is the current lead action.`,
      analysis: [
        `Score ${Number(lead.score || 0).toFixed(2)} | ${lead.playbookTitle}`,
        ...(Array.isArray(lead.reasons) ? lead.reasons.slice(0, 3) : []),
      ],
      actions: [
        lead.actionMode === "prepare_healing"
          ? { id: "prepare-healing", label: "Prepare healing", payload: { issueCode: lead.issueCode, route: lead.route, action: lead.action } }
          : { id: "switch-findings", label: "Open findings" },
        { id: "switch-prompts", label: "Open prompts" },
      ],
    };
  }

  function buildQualityTrajectoryResponse(context) {
    const autonomous = context.autonomous;
    if (!autonomous) {
      return {
        title: "No autonomous QA state",
        summary: "The autonomous QA engine is not available for the current report.",
        analysis: ["Load a report first."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    return {
      title: "Quality trajectory",
      summary: `SitePulse Quality Score ${context.dataIntelligence?.QUALITY_STATE?.overallScore || autonomous.qualityScore?.total || 0} | ${context.dataIntelligence?.QUALITY_STATE?.trajectory || autonomous.qualityTrajectory?.direction || "stable"}.`,
      analysis: [
        ...(context.dataIntelligence?.QUALITY_STATE?.qualityHistory?.length
          ? [`Quality history depth: ${context.dataIntelligence.QUALITY_STATE.qualityHistory.length} comparable snapshot(s).`]
          : []),
        ...(Array.isArray(autonomous.qualityScore?.rationale) ? autonomous.qualityScore.rationale.slice(0, 4) : []),
        ...(Array.isArray(autonomous.qualityTrajectory?.evidence) ? autonomous.qualityTrajectory.evidence : []),
      ],
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-compare", label: "Open compare" },
      ],
    };
  }

  function buildBiggestRiskResponse(context) {
    const autonomous = context.autonomous;
    const predictive = context.predictive;
    const risk = context.dataIntelligence?.RISK_STATE?.topRisks?.[0] || autonomous?.insights?.topRisks?.[0] || predictive?.alerts?.[0]?.label || "";
    if (!risk) {
      return {
        title: "No dominant risk",
        summary: "There is no dominant risk signal attached to the current report.",
        analysis: ["Run another comparable audit if you need stronger risk ranking."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    return {
      title: "Biggest current risk",
      summary: risk,
      analysis: [
        ...(predictive?.alerts?.[0]?.evidence || []).slice(0, 3),
        ...(Array.isArray(autonomous?.insights?.recommendedActions) ? autonomous.insights.recommendedActions.slice(0, 2) : []),
      ],
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "switch-compare", label: "Open compare" },
      ],
    };
  }

  function buildIssueExplanation(context, query) {
    const issueCode = inferIssueCode(query, context);
    const issue = findIssueByCode(context, issueCode);
    const memory = summarizeMemory(context.learningMemory, issueCode);
    const autonomous = summarizeAutonomous(context.autonomous, issueCode);
    if (!issue && !memory) {
      return {
        title: "Issue not found",
        summary: `No issue matching ${issueCode || "the requested code"} is loaded right now.`,
        analysis: ["Load a report that contains the issue or specify the exact issue code."],
        actions: [{ id: "switch-findings", label: "Open findings" }],
      };
    }

    const lines = [];
    if (issue) {
      lines.push(`What it means: ${issue.detail}`);
      lines.push(`Impact: ${issue.diagnosis?.laymanExplanation || issue.recommendedResolution}`);
      lines.push(`Priority: ${issue.severity || "unknown"}`);
    }
    if (memory?.finalResolution) {
      lines.push(`Final resolution: ${memory.finalResolution}`);
    } else if (memory?.possibleResolution) {
      lines.push(`Current best hypothesis: ${memory.possibleResolution}`);
    }
    if (memory?.avoidText) {
      lines.push(`Avoid this: ${memory.avoidText}`);
    }
    if (autonomous?.title) {
      lines.push(`Playbook: ${autonomous.title}`);
      if (autonomous.diagnosticStep) lines.push(`Diagnostic step: ${autonomous.diagnosticStep}`);
      if (autonomous.revalidationRule) lines.push(`Revalidation rule: ${autonomous.revalidationRule}`);
    }
    if (context.dataIssue?.history?.runsObserved) {
      lines.push(`History: ${context.dataIssue.history.runsObserved} comparable run(s) observed; recurring ${context.dataIssue.history.recurringCount || 0} time(s).`);
    }

    return {
      title: issueCode || issue?.code || "Issue explanation",
      summary: `Operational explanation for ${issueCode || issue?.code || "the requested issue"}.`,
      analysis: lines,
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "open-memory", label: "Open learning memory", payload: { issueCode: issueCode || issue?.code || "" } },
      ],
    };
  }

  function buildPromptResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const promptText = context.buildIssuePrompt(issueCode);
    const memory = summarizeMemory(context.learningMemory, issueCode);
    const healing = summarizeHealing(context.selfHealing, issueCode);
    const autonomous = summarizeAutonomous(context.autonomous, issueCode);
    const analysis = [
      "The prompt below prioritizes validated solutions, cites failed attempts when they exist and stays anchored to the current run.",
    ];
    if (memory?.failed) {
      analysis.push(`This issue has ${memory.failed} failed attempt(s) in memory; the prompt is expected to avoid them.`);
    }
    if (healing) {
      analysis.push(`Self-healing says ${healing.issueCode} is ${healing.eligibility || "blocked"} with ${healing.confidenceLabel || "n/a"} confidence.`);
      if (healing.avoidText) {
        analysis.push(`Healing avoid list: ${healing.avoidText}`);
      }
    }
    if (autonomous?.nextActionLabel) {
      analysis.push(`Autonomous next action: ${autonomous.nextActionLabel}`);
    }
    if (context.dataIssue?.predictiveRisk?.level) {
      analysis.push(`Data Intelligence risk: ${context.dataIssue.predictiveRisk.level} ${context.dataIssue.predictiveRisk.category} with confidence ${Number(context.dataIssue.predictiveRisk.confidence || 0).toFixed(2)}.`);
    }
    return {
      title: `Prompt intelligence${issueCode ? ` | ${issueCode}` : ""}`,
      summary: "Generated from the current report plus operational memory.",
      analysis,
      promptText,
      actions: [
        { id: "copy-text", label: "Copy prompt", payload: { text: promptText, successMessage: "[studio] learning-aware prompt copied." } },
        healing && ["eligible_for_healing", "assist_only"].includes(healing.eligibility)
          ? { id: "prepare-healing", label: "Prepare healing flow", payload: { issueCode: healing.issueCode, route: healing.route, action: healing.action } }
          : null,
        { id: "open-healing", label: "Open self-healing queue" },
        { id: "switch-prompts", label: "Open prompts" },
      ].filter(Boolean),
    };
  }

  function buildHealingCandidatesResponse(context) {
    const summary = context.strategyContext?.healingSummary;
    const candidates = context.strategyContext?.healingCandidates || [];
    if (!summary || candidates.length === 0) {
      return {
        title: "No healing candidates",
        summary: "No issue is currently marked as eligible or assist-only for self-healing.",
        analysis: ["Run a fresh audit or strengthen operational memory to unlock safer healing strategies."],
        actions: [{ id: "open-healing", label: "Open self-healing queue" }],
      };
    }

    return {
      title: "Self-healing candidates",
      summary: `${summary.eligible} eligible | ${summary.assistOnly} assist only | ${summary.promptReady} prompt-ready | ${summary.pendingAttempts} pending attempt(s).`,
      analysis: candidates.map((item, index) => `${index + 1}. ${item.issueCode} | ${item.route}${item.action ? ` | ${item.action}` : ""} | ${item.eligibility} | ${item.healingMode} | ${item.confidenceLabel || "n/a"}${item.resolutionLead ? ` | lead ${item.resolutionLead}` : ""}`),
      actions: [
        { id: "open-healing", label: "Open self-healing queue" },
        candidates[0] ? { id: "prepare-healing", label: "Prepare top candidate", payload: { issueCode: candidates[0].issueCode, route: candidates[0].route, action: candidates[0].action } } : null,
      ].filter(Boolean),
    };
  }

  function buildHealingStrategyResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const issue = findIssueByCode(context, issueCode);
    const healing = summarizeHealing(context.selfHealing, issueCode);
    if (!issue || !healing) {
      return {
        title: "Healing strategy unavailable",
        summary: `No self-healing strategy is loaded for ${issueCode || "the requested issue"}.`,
        analysis: ["Load a report that contains the issue or ask the assistant which issues are eligible for healing."],
        actions: [{ id: "open-healing", label: "Open self-healing queue" }],
      };
    }

    const analysis = [
      `Eligibility: ${healing.eligibility}`,
      `Healing mode: ${healing.healingMode}`,
      `Confidence: ${healing.confidenceLabel || "n/a"} (${healing.confidenceScore}/100)`,
      `Strategy: ${healing.strategyDescription || healing.strategyId || "n/a"}`,
      healing.resolutionLead ? `Best known correction: ${healing.resolutionLead}` : "No correction lead is locked yet.",
      healing.avoidText ? `Avoid this: ${healing.avoidText}` : "No failed pattern is recorded for this issue yet.",
      ...(Array.isArray(healing.rationale) ? healing.rationale.slice(0, 3) : []),
    ].filter(Boolean);

    return {
      title: `Healing strategy | ${healing.issueCode}`,
      summary: healing.suggestedNextStep || "Operational healing strategy prepared from runtime memory.",
      analysis,
      actions: [
        ["eligible_for_healing", "assist_only"].includes(healing.eligibility)
          ? { id: "prepare-healing", label: "Prepare healing", payload: { issueCode: healing.issueCode, route: healing.route, action: healing.action } }
          : null,
        healing.promptReady ? { id: "generate-prompt", label: "Generate healing-aware prompt", payload: { issueCode: healing.issueCode } } : null,
        { id: "open-healing", label: "Open self-healing queue" },
      ].filter(Boolean),
    };
  }

  function buildHealingDecisionResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const healing = summarizeHealing(context.selfHealing, issueCode);
    if (!healing) {
      return {
        title: "Healing decision unavailable",
        summary: `No self-healing decision context is loaded for ${issueCode || "the requested issue"}.`,
        analysis: ["Ask which issues are eligible for healing or load a report that contains the target issue."],
        actions: [{ id: "open-healing", label: "Open self-healing queue" }],
      };
    }

    const verdict = healing.eligibility === "eligible_for_healing"
      ? "This issue is a candidate for assisted correction and can be prepared safely."
      : healing.eligibility === "assist_only"
      ? "This issue should stay prompt-assisted and human-reviewed before revalidation."
      : healing.eligibility === "manual_only"
      ? "This issue should stay manual until the memory is stronger."
      : healing.eligibility === "unsafe"
      ? "This issue is unsafe for automated correction."
      : "This issue is blocked until more context is available.";

    return {
      title: `Healing decision | ${healing.issueCode}`,
      summary: verdict,
      analysis: [
        `Mode: ${healing.healingMode}`,
        `Confidence: ${healing.confidenceLabel || "n/a"} (${healing.confidenceScore}/100)`,
        healing.resolutionLead ? `Correction lead: ${healing.resolutionLead}` : "No correction lead is currently stored.",
        healing.avoidText ? `Avoid: ${healing.avoidText}` : "No failed pattern is stored for this issue.",
      ],
      actions: [
        { id: "open-healing", label: "Open self-healing queue" },
        ["eligible_for_healing", "assist_only"].includes(healing.eligibility)
          ? { id: "prepare-healing", label: "Prepare healing", payload: { issueCode: healing.issueCode, route: healing.route, action: healing.action } }
          : null,
      ].filter(Boolean),
    };
  }

  function buildHealingFailureResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const healing = summarizeHealing(context.selfHealing, issueCode);
    const memory = summarizeMemory(context.learningMemory, issueCode);
    const lines = [];
    if (memory?.failed) {
      lines.push(`Operational memory shows ${memory.failed} failed attempt(s).`);
    }
    if (memory?.avoidText) {
      lines.push(`Avoid this pattern: ${memory.avoidText}`);
    }
    if (healing?.lastAttempt) {
      lines.push(`Last healing attempt: ${healing.lastAttempt.outcome || healing.lastAttempt.status}${healing.lastAttempt.updatedAt ? ` | ${healing.lastAttempt.updatedAt}` : ""}`);
    }
    if (!lines.length) {
      lines.push("No failed healing pattern is currently recorded for this issue.");
    }

    return {
      title: issueCode ? `What failed before | ${issueCode}` : "What failed before",
      summary: "Review failed patterns before repeating a correction attempt.",
      analysis: lines,
      actions: [
        issueCode ? { id: "open-memory", label: "Open learning memory", payload: { issueCode } } : null,
        { id: "open-healing", label: "Open self-healing queue" },
      ].filter(Boolean),
    };
  }

  function buildHealingRevalidateResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const healing = summarizeHealing(context.selfHealing, issueCode)
      || getHealingCandidates(context.selfHealing).find((item) => item.lastAttempt && item.lastAttempt.outcome === "pending")
      || null;
    if (!healing || healing.lastAttempt?.outcome !== "pending") {
      return {
        title: "No pending healing attempt",
        summary: "There is no pending self-healing attempt ready for revalidation.",
        analysis: ["Prepare a healing attempt first, apply the fix, then rerun the audit through the operator mode."],
        actions: [{ id: "open-healing", label: "Open self-healing queue" }],
      };
    }

    return {
      title: `Revalidate healing | ${healing.issueCode}`,
      summary: "The assistant can trigger a new audit so the Self-Healing Engine can resolve the pending attempt.",
      analysis: [
        `Pending attempt mode: ${healing.lastAttempt.healingMode || healing.healingMode}`,
        healing.resolutionLead ? `Expected correction: ${healing.resolutionLead}` : "No correction lead is stored.",
        "Only trigger this after the actual fix has been applied.",
      ],
      actions: [{ id: "revalidate-healing", label: "Revalidate now", payload: { issueCode: healing.issueCode, route: healing.route, action: healing.action } }],
    };
  }

  function buildValidatedResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "There is no audit report available.",
        analysis: ["Run or load an audit before asking which critical issues already have validated solutions."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }
    const items = (report.issues || [])
      .filter((issue) => issue.severity === "high" && normalizeText(issue.finalResolution))
      .slice(0, 6);
    return {
      title: "Critical issues with final resolution",
      summary: items.length ? `${items.length} critical issue(s) already have a final resolution attached.` : "No critical issue with final resolution is loaded.",
      analysis: items.length
        ? items.map((issue, index) => `${index + 1}. ${issue.code} | ${issue.route} | ${issue.finalResolution}`)
        : ["Use manual override or revalidation to strengthen the memory for critical items that are still unresolved."],
      actions: [{ id: "switch-findings", label: "Open findings" }],
    };
  }

  function buildUnresolvedCriticalResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "There is no audit report available.",
        analysis: ["Run or load an audit before asking which critical issues still lack a final resolution."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }
    const items = (report.issues || [])
      .filter((issue) => issue.severity === "high" && !normalizeText(issue.finalResolution))
      .slice(0, 6);
    return {
      title: "Critical issues without final resolution",
      summary: items.length ? `${items.length} critical issue(s) still do not have a final resolution.` : "All critical issues currently loaded already have a final resolution.",
      analysis: items.length
        ? items.map((issue, index) => `${index + 1}. ${issue.code} | ${issue.route} | ${issue.detail}`)
        : ["Use compare and memory to confirm what still needs technical validation."],
      actions: [{ id: "switch-findings", label: "Open findings" }],
    };
  }

  function buildFailedResponse(context, query) {
    const lower = toLower(query);
    const categoryMatch = lower.match(/\b(seo|visual|network|runtime|interaction|content|http|general)\b/);
    const requestedCategory = categoryMatch ? categoryMatch[1] : "";
    const entries = (context.learningMemory?.entries || []).filter((entry) => {
      if (Number(entry.learningCounts?.failed || 0) <= 0) return false;
      if (!requestedCategory) return true;
      return toLower(entry.category) === requestedCategory;
    }).slice(0, 8);

    return {
      title: requestedCategory ? `Failed patterns | ${requestedCategory}` : "Failed patterns",
      summary: entries.length
        ? `${entries.length} learned pattern(s) contain failed attempts${requestedCategory ? ` in ${requestedCategory}` : ""}.`
        : "No failed pattern matched the requested scope.",
      analysis: entries.length
        ? entries.map((entry, index) => `${index + 1}. ${entry.issueCode} | fail ${entry.learningCounts.failed}${entry.avoidText ? ` | avoid ${entry.avoidText}` : ""}`)
        : ["Try another category or run more audits to accumulate failure memory."],
      actions: [{ id: "switch-settings", label: "Open learning memory" }],
    };
  }

  function buildAuditSiteResponse(context, query) {
    const match = normalizeText(query).match(/https?:\/\/[^\s]+/i);
    if (!match) {
      return {
        title: "Audit target missing",
        summary: "No URL was found in the request.",
        analysis: ["Ask again with a full URL, for example: audite https://example.com"],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    const baseUrl = match[0];
    const commandCount = context.operatorContext?.commands?.length || 0;
    return {
      title: "Audit target detected",
      summary: `The assistant can prepare and run an audit for ${baseUrl}.`,
      analysis: [
        "This action uses the real engine and the current desktop profile.",
        commandCount ? `Operator mode currently sees ${commandCount} actionable workstation command(s).` : "Operator mode is ready to dispatch the audit through the desktop engine.",
      ],
      actions: [{ id: "run-audit", label: "Run audit now", payload: { baseUrl } }],
    };
  }

  const OPERATOR_PLAN_STEPS = {
    pt: [
      { id: "1", label: "Iniciar auditoria" },
      { id: "2", label: "Coletar resultados" },
      { id: "3", label: "Priorizar problemas" },
      { id: "4", label: "Explicar ao usuário" },
    ],
    es: [
      { id: "1", label: "Iniciar auditoría" },
      { id: "2", label: "Recolectar resultados" },
      { id: "3", label: "Priorizar problemas" },
      { id: "4", label: "Explicar al usuario" },
    ],
    en: [
      { id: "1", label: "Start audit" },
      { id: "2", label: "Collect results" },
      { id: "3", label: "Prioritize issues" },
      { id: "4", label: "Explain to user" },
    ],
    ca: [
      { id: "1", label: "Iniciar auditoria" },
      { id: "2", label: "Recollir resultats" },
      { id: "3", label: "Prioritzar problemes" },
      { id: "4", label: "Explicar a l'usuari" },
    ],
  };

  function buildAnalyzeSeoAndFixResponse(context, rawQuery) {
    const languageKey = getLanguageKey(context);
    const steps = OPERATOR_PLAN_STEPS[languageKey] || OPERATOR_PLAN_STEPS.en;
    const report = context.report;
    const copy = getHumanCopy(languageKey);
    const planLabel = { pt: "Plano", es: "Plan", en: "Plan", ca: "Pla" }[languageKey] || "Plan";
    if (!report) {
      return {
        title: planLabel,
        summary: copy.noReport,
        plan: steps,
        analysis: [
          "1. " + steps[0].label,
          "2. " + steps[1].label,
          "3. " + steps[2].label,
          "4. " + steps[3].label,
        ],
        actions: [
          { id: "run-audit", label: "Run audit now" },
          { id: "switch-overview", label: "Open overview" },
        ],
      };
    }
    const totalIssues = report.summary?.totalIssues ?? 0;
    const seoScore = report.summary?.seoScore ?? 0;
    const criticalCount = (context.criticalIssues || []).length;
    return {
      title: planLabel,
      summary: `${report.meta?.baseUrl || "Current run"} · ${totalIssues} issue(s) · SEO ${seoScore}. ${criticalCount ? `${criticalCount} critical.` : ""}`,
      plan: steps,
      analysis: [
        "1. " + steps[0].label,
        "2. " + steps[1].label,
        "3. " + steps[2].label,
        "4. " + steps[3].label,
      ],
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "prepare-healing", label: "Prepare healing" },
        { id: "generate-prompt", label: "Generate prompt" },
      ],
    };
  }

  function buildLatestRunResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No run loaded",
        summary: "There is no current or last run loaded in the desktop.",
        analysis: ["Run or load an audit first."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }

    const lines = [
      `Generated: ${report.meta.generatedAt}`,
      `Routes checked: ${report.summary.routesChecked}`,
      `Actions mapped: ${report.summary.actionsMapped}`,
    ];
    if (Array.isArray(context.runHistory) && context.runHistory.length > 1) {
      lines.push(`History available: ${context.runHistory.length} snapshot(s).`);
    }

    return {
      title: "Latest loaded run",
      summary: `${report.meta.baseUrl} | ${report.summary.totalIssues} issue(s) | SEO ${report.summary.seoScore}`,
      analysis: lines,
      actions: [{ id: "switch-reports", label: "Open reports" }],
    };
  }

  function buildMemoryResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const memory = summarizeMemory(context.learningMemory, issueCode);
    if (!memory) {
      return {
        title: "Memory not found",
        summary: `No operational memory entry matched ${issueCode || "the requested issue"}.`,
        analysis: ["Run more audits or specify another issue code."],
        actions: [{ id: "switch-settings", label: "Open learning memory" }],
      };
    }

    const lines = [
      `Validated: ${memory.validated}`,
      `Failed: ${memory.failed}`,
      `Partial: ${memory.partial}`,
    ];
    if (memory.finalResolution) lines.push(`Final resolution: ${memory.finalResolution}`);
    if (memory.possibleResolution) lines.push(`Possible resolution: ${memory.possibleResolution}`);
    if (memory.avoidText) lines.push(`Avoid: ${memory.avoidText}`);

    return {
      title: `Learning memory | ${memory.issueCode}`,
      summary: memory.learningSource || "Operational memory loaded from the local store.",
      analysis: lines,
      actions: [{ id: "open-memory", label: "Open memory panel", payload: { issueCode: memory.issueCode } }],
    };
  }

  function buildManualOverrideResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const issue = findIssueByCode(context, issueCode);
    if (!issue) {
      return {
        title: "Issue code required",
        summary: "The assistant needs an issue code loaded in the current report before asking for a manual override.",
        analysis: ["Example: promova manualmente SEO_CANONICAL_MISSING"],
        actions: [{ id: "switch-findings", label: "Open findings" }],
      };
    }
    return {
      title: `Manual override | ${issue.code}`,
      summary: "A manual override should only be applied when you deliberately want to mark a final resolution with traceability.",
      analysis: [
        `Current recommendation: ${issue.recommendedResolution}`,
        issue.possibleResolution ? `Possible resolution: ${issue.possibleResolution}` : "No possible resolution is attached yet.",
      ],
      actions: [{ id: "manual-override", label: "Promote solution", payload: { issueCode: issue.code } }],
    };
  }

  function buildBugAnalystResponse(context, rawQuery = "") {
    const bc = context.bugContext || {};
    const lang = context.language || "en";
    const hasBugData = !!bc.reportId;

    if (!hasBugData) {
      return {
        title: lang === "pt" ? "Análise de Bug" : "Bug Analysis",
        summary: lang === "pt"
          ? "Nenhum report do Bug Detector foi carregado ainda. Capture um bug primeiro para que eu possa analisar."
          : "No Bug Detector report has been loaded yet. Capture a bug first so I can analyze it.",
        analysis: [],
        actions: [{ id: "switch-findings", label: lang === "pt" ? "Abrir findings" : "Open findings" }],
      };
    }

    const lines = [];
    if (bc.rootCause) {
      lines.push(lang === "pt" ? `Causa raiz: ${bc.rootCause}` : `Root cause: ${bc.rootCause}`);
    }
    if (bc.solution) {
      lines.push(lang === "pt" ? `Solução sugerida: ${bc.solution}` : `Suggested solution: ${bc.solution}`);
    }
    if (bc.recommendations && bc.recommendations.length) {
      lines.push(...bc.recommendations.map((r) => `• ${r}`));
    }
    if (bc.consoleLogCount) {
      lines.push(lang === "pt" ? `Console logs capturados: ${bc.consoleLogCount}` : `Captured console logs: ${bc.consoleLogCount}`);
    }
    if (bc.networkRequestCount) {
      lines.push(lang === "pt" ? `Requisições de rede capturadas: ${bc.networkRequestCount}` : `Captured network requests: ${bc.networkRequestCount}`);
    }

    const actions = [];
    if (bc.fixCode) {
      actions.push({ id: "copy-text", label: lang === "pt" ? "Copiar código corrigido" : "Copy fixed code", payload: { text: bc.fixCode } });
    }
    actions.push({ id: "generate-prompt", label: lang === "pt" ? "Gerar prompt de correção" : "Generate fix prompt" });
    actions.push({ id: "switch-prompts", label: lang === "pt" ? "Abrir Prompt Workspace" : "Open Prompt Workspace" });

    return {
      title: lang === "pt" ? `Análise de Bug — ${bc.description}` : `Bug Analysis — ${bc.description}`,
      summary: lang === "pt"
        ? `Bug detectado em ${bc.url} (severidade: ${bc.severity}). Confiança da IA (${bc.aiProvider}): ${Math.round(bc.aiConfidence * 100)}%.`
        : `Bug detected at ${bc.url} (severity: ${bc.severity}). AI confidence (${bc.aiProvider}): ${Math.round(bc.aiConfidence * 100)}%.`,
      analysis: lines.length ? lines : [lang === "pt" ? "Nenhuma análise detalhada disponível." : "No detailed analysis available."],
      actions,
    };
  }

  function buildLogsResponse(context) {
    const lines = (context.logs || []).slice(-8);
    return {
      title: "Recent engine log",
      summary: lines.length ? "Latest log entries from the desktop runtime." : "No runtime log is loaded.",
      analysis: lines.length ? lines : ["No runtime log is available yet."],
      actions: [{ id: "switch-operations", label: "Open operations" }],
    };
  }

  function routeQuery(rawQuery, appContext, conversationState) {
    const normalizedQuery = toLower(rawQuery);
    const intentDefinition = getIntentDefinition(normalizedQuery, conversationState);
    const modeKey = intentDefinition?.mode || "strategy_advisor";
    const modeContext = buildModeContext(modeKey, appContext, rawQuery, conversationState);
    const result = intentDefinition?.builder
      ? intentDefinition.builder(modeContext, rawQuery)
      : buildPrioritiesResponse(modeContext);
    return wrapModeResult(modeKey, intentDefinition?.id || "priorities", result, {
      context: appContext,
      languageKey: getLanguageKey(appContext),
      toneKey: detectTone(rawQuery, intentDefinition?.id || "priorities", conversationState?.lastToneKey || "friendly"),
      intentCategory: getIntentCategory(intentDefinition?.id || "priorities"),
      intentId: intentDefinition?.id || "priorities",
    });
  }

  globalScope.createSitePulseAssistantService = function createSitePulseAssistantService(options) {
    const conversationState = {
      lastIntentId: "",
      lastIssueCode: "",
      lastModeKey: "",
      lastToneKey: "friendly",
    };

    return {
      getModeRegistry() {
        return MODE_REGISTRY;
      },
      respond(rawQuery) {
        const context = options.getContext();
        const response = routeQuery(rawQuery, context, conversationState);
        conversationState.lastIntentId = String(response.intentId || conversationState.lastIntentId || "");
        conversationState.lastModeKey = String(response.modeKey || conversationState.lastModeKey || "");
        conversationState.lastToneKey = String(response.toneKey || conversationState.lastToneKey || "friendly");
        const issueCode = inferIssueCode(rawQuery, context, conversationState);
        if (issueCode) {
          conversationState.lastIssueCode = String(issueCode);
        }
        return response;
      },
    };
  };
})(window);

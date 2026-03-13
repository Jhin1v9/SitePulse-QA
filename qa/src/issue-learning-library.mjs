export const ISSUE_LEARNING_LIBRARY = Object.freeze({
  CONTENT_LANGUAGE_CONFLICT: {
    source: "Aprendizado validado durante o rework multilocale do SitePulse Studio (2026-03).",
    possibleSolution:
      "Centralizar toda a copy em um dicionario de i18n, definir idioma principal por rota e revisar header, footer, hero, screenshots, formularios e estados para remover textos fixos fora da traducao.",
    finalSolution:
      "Mover os textos residuais para a camada oficial de traducao, alinhar o atributo lang do documento com o locale ativo e reexecutar a auditoria ate nao restarem trechos visiveis em idioma errado.",
    cases: [
      {
        outcome: "failed",
        title: "Correcao isolada de labels",
        symptom: "A rota localizada ainda exibia trechos em ingles e portugues fora do dicionario principal.",
        attempt: "Corrigir apenas labels visiveis do header ou de uma pagina isolada.",
        result: "Falhou: o auditor continuou encontrando texto residual em showcase, footer e metadata.",
        source: "SitePulse landing multilingual cleanup",
      },
      {
        outcome: "validated",
        title: "i18n completo por rota",
        symptom: "ES, CA e EN misturavam copy residual em componentes compartilhados.",
        attempt: "Mover textos residuais para i18n, alinhar lang do documento e revisar todas as rotas localizadas.",
        result: "Validado: conflito de idioma deixou de aparecer nas rotas auditadas.",
        finalFix:
          "Usar apenas a camada de mensagens por locale, alinhar document lang e revisar componentes reutilizados fora da pagina atual.",
        source: "SitePulse landing multilingual cleanup",
      },
    ],
  },
  BTN_NO_EFFECT: {
    source: "Aprendizado validado durante a limpeza de self-links e CTAs ativos da landing (2026-03).",
    possibleSolution:
      "Verificar se o item clicado aponta para a rota atual ou para um estado ja ativo. Se sim, converter o elemento em estado visual, nao em acao navegavel.",
    finalSolution:
      "Renderizar o item ativo do menu, footer ou CTA como estado nao clicavel com aria-current=\"page\" e manter href apenas em destinos realmente navegaveis.",
    cases: [
      {
        outcome: "failed",
        title: "Link ativo apenas com estilo diferenciado",
        symptom: "A pagina atual continuava com link/CTA clicavel e o auditor marcava clique sem efeito.",
        attempt: "Aplicar so um estilo active mantendo href e onClick intactos.",
        result: "Falhou: o clique continuou sem mudanca detectavel e BTN_NO_EFFECT permaneceu aberto.",
        source: "SitePulse landing CTA cleanup",
      },
      {
        outcome: "validated",
        title: "Rota atual vira estado, nao acao",
        symptom: "Header, footer e CTAs repetiam a rota atual.",
        attempt: "Substituir o item ativo por span/estado visual com aria-current e remover href do alvo atual.",
        result: "Validado: buttonsNoEffect caiu para 0 na rodada final.",
        finalFix:
          "Nao oferecer clique para a rota atual. Exibir estado ativo semanticamente correto e manter links apenas para destinos alternativos.",
        source: "SitePulse landing CTA cleanup",
      },
    ],
  },
  VISUAL_TIGHT_SPACING: {
    source: "Aprendizado validado durante o refinamento de FAQ, Demo, Downloads e Contact (2026-03).",
    possibleSolution:
      "Medir gaps reais entre blocos consecutivos, aumentar respiro vertical e revisar padding interno dos paineis que parecem comprimidos.",
    finalSolution:
      "Sair do gap de 16px entre blocos equivalentes quando a composicao ainda parecer comprimida e elevar tambem o padding do painel para recuperar respiracao visual.",
    cases: [
      {
        outcome: "failed",
        title: "Aumentar apenas o espacamento externo da pagina",
        symptom: "O FAQ ainda parecia colado mesmo com mais espaco na pagina como um todo.",
        attempt: "Mexer so no wrapper externo sem tocar no gap do acordeao.",
        result: "Falhou: as transicoes entre os cards do acordeao continuaram em 16px e a issue persistiu.",
        source: "SitePulse FAQ spacing audit",
      },
      {
        outcome: "validated",
        title: "Gap interno do acordeao + padding maior",
        symptom: "Os cards do FAQ estavam grudados visualmente no topo da pagina.",
        attempt: "Aumentar gap entre cards e padding interno dos paineis.",
        result: "Validado: VISUAL_TIGHT_SPACING zerou na reexecucao final.",
        finalFix:
          "Ajustar gap entre cards equivalentes para 20-24px quando a leitura seguir comprimida e reforcar padding do painel para recuperar ritmo.",
        source: "SitePulse FAQ spacing audit",
      },
    ],
  },
  VISUAL_HIERARCHY_COLLAPSE: {
    source: "Aprendizado validado durante o reforco de hierarquia tipografica das paginas secundarias (2026-03).",
    possibleSolution:
      "Aumentar contraste entre heading e corpo com escala tipografica clara, mais peso no titulo e maior distancia entre titulo e descricao.",
    finalSolution:
      "Subir heading principal e titulos de paineis para uma escala maior, com espacamento vertical mais claro entre subtitulo, titulo e corpo.",
    cases: [
      {
        outcome: "validated",
        title: "Hierarquia recuperada nos paineis secundarios",
        symptom: "Demo, Downloads, FAQ e Contact pareciam blocos do mesmo peso visual.",
        attempt: "Aumentar escala dos headings e separar melhor titulo de texto de apoio.",
        result: "Validado: os paineis passaram a ler como blocos com prioridade clara.",
        finalFix:
          "Combinar heading maior, description mais arejada e padding mais generoso nas superficies principais.",
        source: "SitePulse landing hierarchy pass",
      },
    ],
  },
  VISUAL_CLUSTER_COLLISION: {
    source: "Aprendizado validado durante o ajuste de grids e gutters da landing (2026-03).",
    possibleSolution:
      "Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.",
    finalSolution:
      "Aumentar gap de grid e garantir min-width: 0 nos containers para impedir blocos espremidos ou visualmente colados na mesma linha.",
    cases: [
      {
        outcome: "validated",
        title: "Gutters maiores em grids densos",
        symptom: "Cards laterais em Demo, Downloads e Contact ficavam proximos demais.",
        attempt: "Aumentar gap horizontal/vertical e revisar largura minima dos paineis.",
        result: "Validado: a colisao entre clusters deixou de aparecer na rodada final.",
        finalFix:
          "Subir gutter entre colunas equivalentes e nao depender apenas do padding interno para separar blocos vizinhos.",
        source: "SitePulse landing grid cleanup",
      },
    ],
  },
  VISUAL_BOUNDARY_COLLISION: {
    source: "Aprendizado validado durante o refinamento de downloads e contact (2026-03).",
    possibleSolution:
      "Adicionar respiro real entre blocos principais, revisar bordas e impedir que cards terminem grudados uns nos outros.",
    finalSolution:
      "Separar blocos com gap estrutural, nao so com borda. Quando duas superficies fortes encostam, aumentar o gutter do grid ou a margem entre paineis.",
    cases: [
      {
        outcome: "validated",
        title: "Separacao estrutural entre superficies",
        symptom: "Painel encostado em painel lateral passava sensacao de composicao comprimida.",
        attempt: "Aumentar gap do grid e padding dos paines de maior densidade.",
        result: "Validado: a colisao de borda nao reapareceu na rodada final.",
        finalFix:
          "Tratar separacao entre paineis no grid principal e nao apenas dentro de cada card isolado.",
        source: "SitePulse landing grid cleanup",
      },
    ],
  },
  HTTP_4XX: {
    source: "Aprendizado operacional do motor durante revalidacao local do SitePulse (2026-03).",
    possibleSolution:
      "Antes de assumir regressao real, verificar se o servidor local de producao foi reiniciado apos build e se os chunks estaticos correspondem ao ultimo build.",
    finalSolution:
      "Quando aparecer um lote de 400 em _next/static logo apos build local, reiniciar o next start e repetir a auditoria para descartar falso positivo de assets desatualizados.",
    cases: [
      {
        outcome: "failed",
        title: "Auditoria em servidor local reaproveitado",
        symptom: "Muitos 400 em _next/static/css e erros de console apareceram de uma vez.",
        attempt: "Confiar no resultado sem reiniciar o servidor de producao local.",
        result: "Falhou: eram chunks desalinhados com o build atual, nao erro real do site.",
        source: "SitePulse local production replay",
      },
      {
        outcome: "validated",
        title: "Reiniciar servidor antes do replay final",
        symptom: "Falhas 400 surgiram em massa apenas na auditoria local apos rebuild.",
        attempt: "Encerrar o processo antigo, subir um novo next start e repetir o replay.",
        result: "Validado: HTTP 4xx voltou para 0 e o site auditado zerou issues.",
        finalFix:
          "Para replay local de producao, sempre reiniciar o servidor apos build quando houver suspeita de chunk stale.",
        source: "SitePulse local production replay",
      },
    ],
  },
  CONSOLE_ERROR: {
    source: "Aprendizado operacional do motor durante revalidacao local do SitePulse (2026-03).",
    possibleSolution:
      "Se aparecer um lote identico de console errors ligado a _next/static, verificar primeiro se existe drift entre build atual e servidor local ativo.",
    finalSolution:
      "Classificar esses erros como ambiente suspeito quando vierem em massa de assets _next/static e reexecutar com servidor reiniciado antes de atacar o codigo do site.",
    cases: [
      {
        outcome: "validated",
        title: "Erro de console era ruido de ambiente",
        symptom: "Console explodiu com erros de assets, mas o site nao tinha regressao funcional equivalente.",
        attempt: "Reiniciar servidor local e repetir auditoria.",
        result: "Validado: consoleErrors voltou para 0 sem nova mudanca de codigo no site.",
        finalFix:
          "Descartar drift de ambiente local antes de tratar console error em massa como regressao de produto.",
        source: "SitePulse local production replay",
      },
    ],
  },
  SEO_META_DESCRIPTION_LENGTH: {
    source: "Aprendizado validado durante a recuperacao do baseline SEO 100/100 (2026-03).",
    possibleSolution:
      "Reescrever descriptions por pagina e por locale para ficar entre 70 e 170 caracteres, com beneficio claro e contexto especifico da rota.",
    finalSolution:
      "Nao reutilizar uma descricao curta generica. Cada rota publica precisa de meta description propria, suficiente para explicar valor e evitar corte.",
    cases: [
      {
        outcome: "validated",
        title: "Descriptions curtas em paginas secundarias",
        symptom: "Demo, Downloads, Pricing, FAQ e Contact tinham descriptions curtas demais.",
        attempt: "Alongar a copy por rota e locale mantendo intencao comercial e sem repeticao mecanica.",
        result: "Validado: o score SEO voltou para 100 na rodada final.",
        finalFix:
          "Escrever descriptions especificas por pagina, traduzidas por locale, com promessa clara e comprimento adequado.",
        source: "SitePulse SEO recovery pass",
      },
    ],
  },
  SEO_STRUCTURED_DATA_MISSING: {
    source: "Aprendizado validado durante a recuperacao do baseline SEO 100/100 (2026-03).",
    possibleSolution:
      "Adicionar JSON-LD especifico por tipo de pagina, nao um schema generico unico para o site inteiro.",
    finalSolution:
      "Usar schema dedicado por pagina publica (WebPage, FAQPage, ContactPage, CollectionPage, OfferCatalog ou equivalente) com canonical localizado.",
    cases: [
      {
        outcome: "validated",
        title: "Schema ausente em paginas secundarias",
        symptom: "Paginas publicas estavam sem JSON-LD ou com cobertura insuficiente.",
        attempt: "Adicionar schema por pagina ligado a canonical e idioma corretos.",
        result: "Validado: o baseline SEO voltou para 100/100.",
        finalFix:
          "Gerar structured data por rota e locale, em vez de depender apenas do metadata global.",
        source: "SitePulse SEO recovery pass",
      },
    ],
  },
  SEO_LANG_MISSING: {
    source: "Aprendizado validado durante o ajuste de rotas localizadas e document lang (2026-03).",
    possibleSolution:
      "Sincronizar o atributo lang do documento com o locale ativo e revisar wrappers/layouts compartilhados.",
    finalSolution:
      "Garantir que o HTML raiz reflita o locale da rota atual e nao um valor estatico global.",
    cases: [
      {
        outcome: "validated",
        title: "lang alinhado ao locale atual",
        symptom: "Rotas localizadas podiam herdar idioma errado no documento.",
        attempt: "Atualizar o documento conforme o locale ativo.",
        result: "Validado: idioma e SEO deixaram de conflitar.",
        finalFix: "Amarrar document lang ao locale resolvido pela rota atual.",
        source: "SitePulse multilingual SEO pass",
      },
    ],
  },
  SEO_CANONICAL_MISSING: {
    source: "Aprendizado validado durante o ajuste de metadata localizada (2026-03).",
    possibleSolution:
      "Gerar canonical por rota e locale a partir de um helper unico, evitando hardcode e URL errada em paginas secundarias.",
    finalSolution:
      "Usar uma funcao central para montar canonical localizada e reutiliza-la em metadata e structured data.",
    cases: [
      {
        outcome: "validated",
        title: "Canonical unificada por helper",
        symptom: "Paginas localizadas exigiam canonical consistente para nao abrir brecha de duplicidade.",
        attempt: "Centralizar a montagem da URL canonica por locale e route key.",
        result: "Validado: metadata e schema passaram a usar a mesma URL base.",
        finalFix:
          "Remover canonical manual espalhada e usar helper unico para todas as rotas publicas.",
        source: "SitePulse multilingual SEO pass",
      },
    ],
  },
});

export function getIssueLearning(code) {
  return ISSUE_LEARNING_LIBRARY[String(code || "").trim()] ?? null;
}

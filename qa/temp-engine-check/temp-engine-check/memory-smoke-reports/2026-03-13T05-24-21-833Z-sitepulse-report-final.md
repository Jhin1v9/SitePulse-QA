# SitePulse QA Report

- Projeto: sitepulse-memory-smoke
- Inicio: 2026-03-13T05:24:20.673Z
- Fim: 2026-03-13T05:24:21.821Z
- Base URL: https://example.com
- Viewport: 1366x768
- Execucao pausada: nao
- Retomado de checkpoint: nao

## Resumo

- Rotas verificadas: 1
- Falhas de carga de rota: 0
- Botoes verificados: 0
- Acoes mapeadas (detalhadas): 0
- Acoes com efeito: 0
- Acoes sem efeito detectado: 0
- Acoes com erro de clique: 0
- Acoes em modo analise (sem clique): 0
- Botoes sem efeito: 0
- Erros HTTP 4xx: 0
- Erros HTTP 5xx: 0
- Erros de rede: 0
- Erros JS runtime: 0
- Console errors: 0
- Ordem visual invalida: 0
- Secao obrigatoria ausente/invisivel: 0
- SEO score: 47/100
- SEO paginas analisadas: 1
- SEO issues criticas: 1
- SEO issues totais: 9
- Total issues: 0

## Guia Rapido Para Assistente

- Status: clean
- Replay command: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\memory-smoke.json" --fresh --live-log --human-log --scope "seo" --no-server
- Passo: Sem issues: manter baseline e monitorar regressao.
- Passo: Rodar novamente com: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\memory-smoke.json" --fresh --live-log --human-log --scope "seo" --no-server
- Passo: Se houver mudanca grande de layout, atualizar sectionOrderRules.

## Explicacao Para Leigos

- Nenhum problema detectado nesta rodada.

## Inteligencia De Erros

- Sem classificacoes adicionais nesta rodada.

## Progresso

- Proxima rota indice: 1
- Proximo botao indice: 0
- Segmentos executados: 1

## Mapa De Acoes (Botoes/Menu/Links)

- Nenhuma acao mapeada nesta rodada.

## Analise SEO

- SEO score geral: 47/100
- Paginas analisadas: 1
- Score por categoria: tecnico=85, conteudo=62, acessibilidade=100
- Principais pontos SEO:
  - [high] SEO_META_DESCRIPTION_MISSING (1x): Meta description ausente. | recomendacao: Adicione meta description unica com proposta clara da pagina.
  - [medium] SEO_CONTENT_THIN (1x): Conteudo textual curto (19 palavras). | recomendacao: Adicione conteudo util e especifico sobre servico/local para SEO local.
  - [medium] SEO_OPEN_GRAPH_INCOMPLETE (1x): Open Graph incompleto (faltando og:title, og:description, og:image ou og:type). | recomendacao: Complete as metas Open Graph para melhorar compartilhamento e CTR.
  - [medium] SEO_TITLE_LENGTH (1x): Title com 14 caracteres (ideal: 30-65). | recomendacao: Ajuste o tamanho do title para melhorar leitura no Google.
  - [low] SEO_CANONICAL_MISSING (1x): Link canonical ausente. | recomendacao: Defina canonical para evitar duplicidade de URL.
  - [low] SEO_INTERNAL_LINKS_LOW (1x): Poucos links internos (0). | recomendacao: Aumente links internos para melhorar rastreio e distribuicao de autoridade.
  - [low] SEO_META_ROBOTS_MISSING (1x): Meta robots ausente. | recomendacao: Defina meta robots explicita para controle de indexacao.
  - [low] SEO_STRUCTURED_DATA_MISSING (1x): Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.
  - [low] SEO_TWITTER_CARD_MISSING (1x): Twitter Card ausente. | recomendacao: Adicione meta twitter:card e metadados sociais complementares.
- Checklist SEO base:
  - [missing] Title unico e com tamanho ideal (30-65) | E o texto principal que aparece no Google.
  - [missing] Meta description clara (70-170) | Ajuda a pessoa entender a pagina antes de clicar.
  - [ok] Estrutura de headings com 1 H1 | Organiza o tema principal da pagina para Google e usuarios.
  - [ok] HTML com lang e viewport mobile | Melhora indexacao correta por idioma e experiencia em celular.
  - [missing] Canonical definido | Evita conteudo duplicado em URLs diferentes.
  - [ok] Pagina indexavel (sem noindex indevido) | Sem isso o Google pode ignorar paginas importantes.
  - [ok] Imagens com alt descritivo | Ajuda SEO de imagem e acessibilidade.
  - [missing] Schema JSON-LD (LocalBusiness/Service/FAQ) | Aumenta chance de rich results no Google.
  - [missing] Conteudo util e suficiente | Paginas rasas tendem a ranquear pior.
  - [missing] Links internos entre paginas | Ajuda rastreamento e distribuicao de autoridade.
  - [missing] Meta social (Open Graph + Twitter Card) | Melhora compartilhamento e CTR em redes sociais.
  - [missing] Meta robots presente e coerente | Define como bots devem indexar/seguir links.
- Prompt recomendado para corrigir SEO:
```
Atue como especialista SEO senior com foco em causa raiz e impacto real no ranking.
Site auditado: https://example.com
Score SEO atual: 47/100.
Objetivo: corrigir todos os itens pendentes abaixo sem fix cosmetico.

Checklist SEO pendente (explicacao para leigos + acao):
1. Title unico e com tamanho ideal (30-65) | por que importa: E o texto principal que aparece no Google. | o que fazer: Defina um title unico por pagina com foco na intencao do usuario.
2. Meta description clara (70-170) | por que importa: Ajuda a pessoa entender a pagina antes de clicar. | o que fazer: Crie descricao objetiva com beneficio real e chamada para acao.
3. Canonical definido | por que importa: Evita conteudo duplicado em URLs diferentes. | o que fazer: Defina <link rel="canonical"> para cada pagina indexavel.
4. Schema JSON-LD (LocalBusiness/Service/FAQ) | por que importa: Aumenta chance de rich results no Google. | o que fazer: Adicione dados estruturados validos por pagina.
5. Conteudo util e suficiente | por que importa: Paginas rasas tendem a ranquear pior. | o que fazer: Adicione conteudo especifico, provas, FAQs e diferenciais.
6. Links internos entre paginas | por que importa: Ajuda rastreamento e distribuicao de autoridade. | o que fazer: Inclua links para servicos, contato, cidade e paginas correlatas.
7. Meta social (Open Graph + Twitter Card) | por que importa: Melhora compartilhamento e CTR em redes sociais. | o que fazer: Complete og:title, og:description, og:image, og:type e twitter:card.
8. Meta robots presente e coerente | por que importa: Define como bots devem indexar/seguir links. | o que fazer: Defina meta robots adequada para cada tipo de pagina.

Issues SEO detectadas:
1. [SEO_META_DESCRIPTION_MISSING] (high) Meta description ausente. | recomendacao: Adicione meta description unica com proposta clara da pagina.
2. [SEO_CONTENT_THIN] (medium) Conteudo textual curto (19 palavras). | recomendacao: Adicione conteudo util e especifico sobre servico/local para SEO local.
3. [SEO_OPEN_GRAPH_INCOMPLETE] (medium) Open Graph incompleto (faltando og:title, og:description, og:image ou og:type). | recomendacao: Complete as metas Open Graph para melhorar compartilhamento e CTR.
4. [SEO_TITLE_LENGTH] (medium) Title com 14 caracteres (ideal: 30-65). | recomendacao: Ajuste o tamanho do title para melhorar leitura no Google.
5. [SEO_CANONICAL_MISSING] (low) Link canonical ausente. | recomendacao: Defina canonical para evitar duplicidade de URL. | padrao_validado: Usar uma funcao central para montar canonical localizada e reutiliza-la em metadata e structured data.
6. [SEO_INTERNAL_LINKS_LOW] (low) Poucos links internos (0). | recomendacao: Aumente links internos para melhorar rastreio e distribuicao de autoridade.
7. [SEO_META_ROBOTS_MISSING] (low) Meta robots ausente. | recomendacao: Defina meta robots explicita para controle de indexacao.
8. [SEO_STRUCTURED_DATA_MISSING] (low) Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results. | padrao_validado: Usar schema dedicado por pagina publica (WebPage, FAQPage, ContactPage, CollectionPage, OfferCatalog ou equivalente) com canonical localizado.
9. [SEO_TWITTER_CARD_MISSING] (low) Twitter Card ausente. | recomendacao: Adicione meta twitter:card e metadados sociais complementares.

Entrega obrigatoria:
- listar arquivos alterados e motivo de cada alteracao
- mostrar antes/depois dos metadados principais
- validar novamente e comprovar melhoria de score
```

## Issues

Sem issues detectadas.

## Prompts De Correcao Por Issue

Sem prompts especificos porque nao houve issue.

## Prompt Master

```text
Atue como engenheiro de software senior e corrija todas as issues listadas abaixo com foco em causa raiz.

Nao aplique correcoes cosmeticas. Garanta comportamento funcional correto em desktop e mobile.

Exigencias minimas: sem botao sem efeito, sem callback solto, sem erro fetch sem feedback, sem 4xx/5xx inesperado no fluxo principal e sem ordem de secoes quebrada.

Workflow obrigatorio: reproduzir, identificar causa raiz, corrigir com menor impacto, validar novamente via auditor.

Entregue ao final: codigo corrigido, resumo da causa raiz por categoria e evidencias de revalidacao.
```

## Prompt Rapido Do Assistente

```text
Atue como engenheiro de software senior.
Nao ha issues abertas nesta auditoria.
Objetivo: prevenir regressao.
Comando de revalidacao: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\memory-smoke.json" --fresh --live-log --human-log --scope "seo" --no-server
Verifique mudancas recentes e rode a auditoria novamente apos qualquer ajuste estrutural.
```
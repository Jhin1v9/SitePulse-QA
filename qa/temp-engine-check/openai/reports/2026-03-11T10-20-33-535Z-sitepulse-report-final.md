# SitePulse QA Report

- Projeto: sitepulse-default-desktop-audit
- Inicio: 2026-03-11T10:20:30.725Z
- Fim: 2026-03-11T10:20:33.535Z
- Base URL: https://www.openai.com
- Viewport: 1536x864
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
- Erros HTTP 4xx: 2
- Erros HTTP 5xx: 0
- Erros de rede: 0
- Erros JS runtime: 0
- Console errors: 3
- Ordem visual invalida: 0
- Secao obrigatoria ausente/invisivel: 0
- SEO score: 16/100
- SEO paginas analisadas: 1
- SEO issues criticas: 3
- SEO issues totais: 12
- Total issues: 5

## Guia Rapido Para Assistente

- Status: issues_found
- Replay command: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\openai.json" --fresh --live-log --human-log --scope "full" --no-server
- Passo: Corrigir primeiro erros high (runtime/5xx/ordem visual).
- Passo: Depois tratar medium (clicks falhos/rede/secoes ausentes).
- Passo: Finalizar com low e ruido de console.
- Passo: Atacar checklist SEO pendente antes da revalidacao final.
- Passo: Reexecutar auditoria completa e confirmar totalIssues=0.
- Rotas prioritarias:
  - /: total=5 high=0 medium=0 low=5

## Explicacao Para Leigos

- [HTTP_4XX] 2 ocorrencia(s)
  - O que isso significa: A requisicao foi rejeitada por dados/permissao/rota incorreta.
  - O que fazer: Ajustar regra de permissao ou fluxo de autorizacao. Mostrar mensagem de acesso negado orientando proximo passo.
- [CONSOLE_ERROR] 3 ocorrencia(s)
  - O que isso significa: A requisicao foi rejeitada por dados/permissao/rota incorreta.
  - O que fazer: Ajustar regra de permissao ou fluxo de autorizacao. Mostrar mensagem de acesso negado orientando proximo passo.

## Inteligencia De Erros

- [console_http_403] Console reportou recurso com HTTP 403 -> 1 ocorrencia(s)
- [console_http_404] Console reportou recurso com HTTP 404 -> 1 ocorrencia(s)
- [runtime_unknown] Erro no console do navegador -> 1 ocorrencia(s)
- [forbidden_permission] HTTP 403 Forbidden -> 1 ocorrencia(s)
- [endpoint_not_found] HTTP 404 Not Found -> 1 ocorrencia(s)

## Progresso

- Proxima rota indice: 1
- Proximo botao indice: 0
- Segmentos executados: 1

## Mapa De Acoes (Botoes/Menu/Links)

- Nenhuma acao mapeada nesta rodada.

## Analise SEO

- SEO score geral: 16/100
- Paginas analisadas: 1
- Score por categoria: tecnico=68, conteudo=48, acessibilidade=100
- Principais pontos SEO:
  - [high] SEO_H1_MISSING (1x): Nenhum H1 encontrado na pagina. | recomendacao: Inclua 1 H1 claro descrevendo o tema principal da pagina.
  - [high] SEO_META_DESCRIPTION_MISSING (1x): Meta description ausente. | recomendacao: Adicione meta description unica com proposta clara da pagina.
  - [high] SEO_VIEWPORT_MISSING (1x): Meta viewport ausente. | recomendacao: Adicione meta viewport para boa experiencia mobile.
  - [medium] SEO_CONTENT_THIN (1x): Conteudo textual curto (0 palavras). | recomendacao: Adicione conteudo util e especifico sobre servico/local para SEO local.
  - [medium] SEO_LANG_MISSING (1x): Atributo lang ausente em <html>. | recomendacao: Defina lang no HTML para melhorar indexacao e acessibilidade.
  - [medium] SEO_OPEN_GRAPH_INCOMPLETE (1x): Open Graph incompleto (faltando og:title, og:description, og:image ou og:type). | recomendacao: Complete as metas Open Graph para melhorar compartilhamento e CTR.
  - [medium] SEO_TITLE_LENGTH (1x): Title com 16 caracteres (ideal: 30-65). | recomendacao: Ajuste o tamanho do title para melhorar leitura no Google.
  - [low] SEO_CANONICAL_MISSING (1x): Link canonical ausente. | recomendacao: Defina canonical para evitar duplicidade de URL.
  - [low] SEO_INTERNAL_LINKS_LOW (1x): Poucos links internos (0). | recomendacao: Aumente links internos para melhorar rastreio e distribuicao de autoridade.
  - [low] SEO_META_ROBOTS_MISSING (1x): Meta robots ausente. | recomendacao: Defina meta robots explicita para controle de indexacao.
  - [low] SEO_STRUCTURED_DATA_MISSING (1x): Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.
  - [low] SEO_TWITTER_CARD_MISSING (1x): Twitter Card ausente. | recomendacao: Adicione meta twitter:card e metadados sociais complementares.
- Checklist SEO base:
  - [missing] Title unico e com tamanho ideal (30-65) | E o texto principal que aparece no Google.
  - [missing] Meta description clara (70-170) | Ajuda a pessoa entender a pagina antes de clicar.
  - [missing] Estrutura de headings com 1 H1 | Organiza o tema principal da pagina para Google e usuarios.
  - [missing] HTML com lang e viewport mobile | Melhora indexacao correta por idioma e experiencia em celular.
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
Site auditado: https://www.openai.com
Score SEO atual: 16/100.
Objetivo: corrigir todos os itens pendentes abaixo sem fix cosmetico.

Checklist SEO pendente (explicacao para leigos + acao):
1. Title unico e com tamanho ideal (30-65) | por que importa: E o texto principal que aparece no Google. | o que fazer: Defina um title unico por pagina com foco na intencao do usuario.
2. Meta description clara (70-170) | por que importa: Ajuda a pessoa entender a pagina antes de clicar. | o que fazer: Crie descricao objetiva com beneficio real e chamada para acao.
3. Estrutura de headings com 1 H1 | por que importa: Organiza o tema principal da pagina para Google e usuarios. | o que fazer: Mantenha apenas um H1 claro e use H2/H3 para secoes.
4. HTML com lang e viewport mobile | por que importa: Melhora indexacao correta por idioma e experiencia em celular. | o que fazer: Adicione lang em <html> e meta viewport no <head>.
5. Canonical definido | por que importa: Evita conteudo duplicado em URLs diferentes. | o que fazer: Defina <link rel="canonical"> para cada pagina indexavel.
6. Schema JSON-LD (LocalBusiness/Service/FAQ) | por que importa: Aumenta chance de rich results no Google. | o que fazer: Adicione dados estruturados validos por pagina.
7. Conteudo util e suficiente | por que importa: Paginas rasas tendem a ranquear pior. | o que fazer: Adicione conteudo especifico, provas, FAQs e diferenciais.
8. Links internos entre paginas | por que importa: Ajuda rastreamento e distribuicao de autoridade. | o que fazer: Inclua links para servicos, contato, cidade e paginas correlatas.
9. Meta social (Open Graph + Twitter Card) | por que importa: Melhora compartilhamento e CTR em redes sociais. | o que fazer: Complete og:title, og:description, og:image, og:type e twitter:card.
10. Meta robots presente e coerente | por que importa: Define como bots devem indexar/seguir links. | o que fazer: Defina meta robots adequada para cada tipo de pagina.

Issues SEO detectadas:
1. [SEO_H1_MISSING] (high) Nenhum H1 encontrado na pagina. | recomendacao: Inclua 1 H1 claro descrevendo o tema principal da pagina.
2. [SEO_META_DESCRIPTION_MISSING] (high) Meta description ausente. | recomendacao: Adicione meta description unica com proposta clara da pagina.
3. [SEO_VIEWPORT_MISSING] (high) Meta viewport ausente. | recomendacao: Adicione meta viewport para boa experiencia mobile.
4. [SEO_CONTENT_THIN] (medium) Conteudo textual curto (0 palavras). | recomendacao: Adicione conteudo util e especifico sobre servico/local para SEO local.
5. [SEO_LANG_MISSING] (medium) Atributo lang ausente em <html>. | recomendacao: Defina lang no HTML para melhorar indexacao e acessibilidade.
6. [SEO_OPEN_GRAPH_INCOMPLETE] (medium) Open Graph incompleto (faltando og:title, og:description, og:image ou og:type). | recomendacao: Complete as metas Open Graph para melhorar compartilhamento e CTR.
7. [SEO_TITLE_LENGTH] (medium) Title com 16 caracteres (ideal: 30-65). | recomendacao: Ajuste o tamanho do title para melhorar leitura no Google.
8. [SEO_CANONICAL_MISSING] (low) Link canonical ausente. | recomendacao: Defina canonical para evitar duplicidade de URL.
9. [SEO_INTERNAL_LINKS_LOW] (low) Poucos links internos (0). | recomendacao: Aumente links internos para melhorar rastreio e distribuicao de autoridade.
10. [SEO_META_ROBOTS_MISSING] (low) Meta robots ausente. | recomendacao: Defina meta robots explicita para controle de indexacao.
11. [SEO_STRUCTURED_DATA_MISSING] (low) Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.
12. [SEO_TWITTER_CARD_MISSING] (low) Twitter Card ausente. | recomendacao: Adicione meta twitter:card e metadados sociais complementares.

Entrega obrigatoria:
- listar arquivos alterados e motivo de cada alteracao
- mostrar antes/depois dos metadados principais
- validar novamente e comprovar melhoria de score
```

## Issues

- [HTTP_4XX] (low) / -> route_load: 403 GET https://openai.com/
  - Classificacao: HTTP 403 Forbidden [forbidden_permission]
  - Tecnico: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
  - Leigo: A requisicao foi rejeitada por dados/permissao/rota incorreta.
  - Resolucao recomendada: Ajustar regra de permissao ou fluxo de autorizacao. Mostrar mensagem de acesso negado orientando proximo passo.
  - Causas provaveis: Usuario sem permissao para a acao. | RBAC/ACL bloqueando o endpoint. | Protecao CSRF/origin recusando a chamada.
  - Acoes recomendadas: Ajustar regra de permissao ou fluxo de autorizacao. | Mostrar mensagem de acesso negado orientando proximo passo.
  - Prioridade de ataque: P1
  - Checks iniciais: Conferir claims/permissoes do usuario. | Comparar regra de autorizacao com o caso de uso. | Validar controles CSRF e origin. | Validar payload enviado e schema esperado no endpoint. | Revisar autenticacao/autorizacao e headers. | Checar rota e metodo HTTP corretos.
  - Comandos sugeridos: rg -n "role|permission|acl|rbac" src || rg -n "csrf|origin|sameSite" src/app/api src/lib || rg -n "fetch\(|axios|/api/|POST|PATCH|PUT|DELETE" src || rg -n "zod|schema|safeParse|parse\(" src
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [HTTP_4XX] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: 403 GET https://openai.com/
Explicacao tecnica: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
Resolucao recomendada: Ajustar regra de permissao ou fluxo de autorizacao. Mostrar mensagem de acesso negado orientando proximo passo.
Classificacao inteligente: HTTP 403 Forbidden (forbidden_permission)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Usuario sem permissao para a acao.
- RBAC/ACL bloqueando o endpoint.
- Protecao CSRF/origin recusando a chamada.

Checks tecnicos sugeridos:
- Conferir claims/permissoes do usuario.
- Comparar regra de autorizacao com o caso de uso.
- Validar controles CSRF e origin.
- [CONSOLE_ERROR] (low) / -> route_load: Failed to load resource: the server responded with a status of 403 ()
  - Classificacao: Console reportou recurso com HTTP 403 [console_http_403]
  - Tecnico: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
  - Leigo: A requisicao foi rejeitada por dados/permissao/rota incorreta.
  - Resolucao recomendada: Ajustar regra de permissao ou fluxo de autorizacao. Mostrar mensagem de acesso negado orientando proximo passo.
  - Causas provaveis: Usuario sem permissao para a acao. | RBAC/ACL bloqueando o endpoint. | Protecao CSRF/origin recusando a chamada.
  - Acoes recomendadas: Ajustar regra de permissao ou fluxo de autorizacao. | Mostrar mensagem de acesso negado orientando proximo passo.
  - Prioridade de ataque: P2
  - Checks iniciais: Conferir claims/permissoes do usuario. | Comparar regra de autorizacao com o caso de uso. | Validar controles CSRF e origin. | Classificar erro: warning ruido vs falha funcional real. | Eliminar erros silenciosos repetitivos. | Confirmar que nao existe regressao apos ajuste.
  - Comandos sugeridos: rg -n "role|permission|acl|rbac" src || rg -n "csrf|origin|sameSite" src/app/api src/lib || rg -n "console\.error|console\.warn" src || rg -n "catch\s*\(.*\)\s*\{\s*\}" src
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: Failed to load resource: the server responded with a status of 403 ()
Explicacao tecnica: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
Resolucao recomendada: Ajustar regra de permissao ou fluxo de autorizacao. Mostrar mensagem de acesso negado orientando proximo passo.
Classificacao inteligente: Console reportou recurso com HTTP 403 (console_http_403)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Usuario sem permissao para a acao.
- RBAC/ACL bloqueando o endpoint.
- Protecao CSRF/origin recusando a chamada.

Checks tecnicos sugeridos:
- Conferir claims/permissoes do usuario.
- Comparar regra de autorizacao com o caso de uso.
- Validar controles CSRF e origin.
- [HTTP_4XX] (low) / -> route_load: 404 GET https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000
  - Classificacao: HTTP 404 Not Found [endpoint_not_found]
  - Tecnico: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
  - Leigo: A requisicao foi rejeitada por dados/permissao/rota incorreta.
  - Resolucao recomendada: Centralizar construcao de endpoint para evitar typo. Adicionar teste de contrato para rotas criticas.
  - Causas provaveis: Endpoint incorreto no frontend. | Base URL/env aponta para ambiente errado. | Reescrita/proxy nao encaminha a rota.
  - Acoes recomendadas: Centralizar construcao de endpoint para evitar typo. | Adicionar teste de contrato para rotas criticas.
  - Prioridade de ataque: P1
  - Checks iniciais: Comparar URL do fetch com rotas realmente expostas. | Validar variaveis de ambiente de API. | Revisar rewrites/proxy. | Validar payload enviado e schema esperado no endpoint. | Revisar autenticacao/autorizacao e headers. | Checar rota e metodo HTTP corretos.
  - Comandos sugeridos: rg -n "baseUrl|API_URL|NEXT_PUBLIC|/api/" src || rg -n "export async function GET|POST|PUT|PATCH|DELETE" src/app/api || rg -n "fetch\(|axios|/api/|POST|PATCH|PUT|DELETE" src || rg -n "zod|schema|safeParse|parse\(" src
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [HTTP_4XX] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: 404 GET https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000
Explicacao tecnica: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
Resolucao recomendada: Centralizar construcao de endpoint para evitar typo. Adicionar teste de contrato para rotas criticas.
Classificacao inteligente: HTTP 404 Not Found (endpoint_not_found)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Endpoint incorreto no frontend.
- Base URL/env aponta para ambiente errado.
- Reescrita/proxy nao encaminha a rota.

Checks tecnicos sugeridos:
- Comparar URL do fetch com rotas realmente expostas.
- Validar variaveis de ambiente de API.
- Revisar rewrites/proxy.
- [CONSOLE_ERROR] (low) / -> route_load: Failed to load resource: the server responded with a status of 404 ()
  - Classificacao: Console reportou recurso com HTTP 404 [console_http_404]
  - Tecnico: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
  - Leigo: A requisicao foi rejeitada por dados/permissao/rota incorreta.
  - Resolucao recomendada: Centralizar construcao de endpoint para evitar typo. Adicionar teste de contrato para rotas criticas.
  - Causas provaveis: Endpoint incorreto no frontend. | Base URL/env aponta para ambiente errado. | Reescrita/proxy nao encaminha a rota.
  - Acoes recomendadas: Centralizar construcao de endpoint para evitar typo. | Adicionar teste de contrato para rotas criticas.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar URL do fetch com rotas realmente expostas. | Validar variaveis de ambiente de API. | Revisar rewrites/proxy. | Classificar erro: warning ruido vs falha funcional real. | Eliminar erros silenciosos repetitivos. | Confirmar que nao existe regressao apos ajuste.
  - Comandos sugeridos: rg -n "baseUrl|API_URL|NEXT_PUBLIC|/api/" src || rg -n "export async function GET|POST|PUT|PATCH|DELETE" src/app/api || rg -n "console\.error|console\.warn" src || rg -n "catch\s*\(.*\)\s*\{\s*\}" src
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: Failed to load resource: the server responded with a status of 404 ()
Explicacao tecnica: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
Resolucao recomendada: Centralizar construcao de endpoint para evitar typo. Adicionar teste de contrato para rotas criticas.
Classificacao inteligente: Console reportou recurso com HTTP 404 (console_http_404)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Endpoint incorreto no frontend.
- Base URL/env aponta para ambiente errado.
- Reescrita/proxy nao encaminha a rota.

Checks tecnicos sugeridos:
- Comparar URL do fetch com rotas realmente expostas.
- Validar variaveis de ambiente de API.
- Revisar rewrites/proxy.
- [CONSOLE_ERROR] (low) / -> route_load: Refused to execute script from 'https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000' because its MIME type ('') is not executable, and strict MIME type checking is enabled.
  - Classificacao: Erro no console do navegador [runtime_unknown]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Erro de runtime/console sem assinatura especifica. | Excecao nao tratada em render ou evento. | Dados inesperados sem validacao defensiva.
  - Acoes recomendadas: Aprimorar tratamento de erro no frontend. | Criar teste de regressao para o fluxo quebrado.
  - Prioridade de ataque: P2
  - Checks iniciais: Usar stack trace para chegar no arquivo/linha. | Adicionar guard clauses no trecho que falha. | Reexecutar fluxo e confirmar ausencia do erro. | Classificar erro: warning ruido vs falha funcional real. | Eliminar erros silenciosos repetitivos. | Confirmar que nao existe regressao apos ajuste.
  - Comandos sugeridos: rg -n "console.error|throw new Error|try\s*\{|catch\s*\(" src/components src/app src/lib || rg -n "console\.error|console\.warn" src || rg -n "catch\s*\(.*\)\s*\{\s*\}" src
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: Refused to execute script from 'https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000' because its MIME type ('') is not executable, and strict MIME type checking is enabled.
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Erro no console do navegador (runtime_unknown)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Erro de runtime/console sem assinatura especifica.
- Excecao nao tratada em render ou evento.
- Dados inesperados sem validacao defensiva.

Checks tecnicos sugeridos:
- Usar stack trace para chegar no arquivo/linha.
- Adicionar guard clauses no trecho que falha.
- Reexecutar fluxo e confirmar ausencia do erro.

## Prompts De Correcao Por Issue

### 162263c11b34 | HTTP_4XX

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [HTTP_4XX] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: 403 GET https://openai.com/
Explicacao tecnica: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
Resolucao recomendada: Ajustar regra de permissao ou fluxo de autorizacao. Mostrar mensagem de acesso negado orientando proximo passo.
Classificacao inteligente: HTTP 403 Forbidden (forbidden_permission)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Usuario sem permissao para a acao.
- RBAC/ACL bloqueando o endpoint.
- Protecao CSRF/origin recusando a chamada.

Checks tecnicos sugeridos:
- Conferir claims/permissoes do usuario.
- Comparar regra de autorizacao com o caso de uso.
- Validar controles CSRF e origin.
```

### 85f4bfb322ef | CONSOLE_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: Failed to load resource: the server responded with a status of 403 ()
Explicacao tecnica: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
Resolucao recomendada: Ajustar regra de permissao ou fluxo de autorizacao. Mostrar mensagem de acesso negado orientando proximo passo.
Classificacao inteligente: Console reportou recurso com HTTP 403 (console_http_403)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Usuario sem permissao para a acao.
- RBAC/ACL bloqueando o endpoint.
- Protecao CSRF/origin recusando a chamada.

Checks tecnicos sugeridos:
- Conferir claims/permissoes do usuario.
- Comparar regra de autorizacao com o caso de uso.
- Validar controles CSRF e origin.
```

### 0bfecbcd3892 | HTTP_4XX

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [HTTP_4XX] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: 404 GET https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000
Explicacao tecnica: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
Resolucao recomendada: Centralizar construcao de endpoint para evitar typo. Adicionar teste de contrato para rotas criticas.
Classificacao inteligente: HTTP 404 Not Found (endpoint_not_found)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Endpoint incorreto no frontend.
- Base URL/env aponta para ambiente errado.
- Reescrita/proxy nao encaminha a rota.

Checks tecnicos sugeridos:
- Comparar URL do fetch com rotas realmente expostas.
- Validar variaveis de ambiente de API.
- Revisar rewrites/proxy.
```

### 3d3ace6d2a92 | CONSOLE_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: Failed to load resource: the server responded with a status of 404 ()
Explicacao tecnica: Erro HTTP 4xx retornado pela API, ligado a payload/permissao/endpoint incorreto.
Resolucao recomendada: Centralizar construcao de endpoint para evitar typo. Adicionar teste de contrato para rotas criticas.
Classificacao inteligente: Console reportou recurso com HTTP 404 (console_http_404)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Endpoint incorreto no frontend.
- Base URL/env aponta para ambiente errado.
- Reescrita/proxy nao encaminha a rota.

Checks tecnicos sugeridos:
- Comparar URL do fetch com rotas realmente expostas.
- Validar variaveis de ambiente de API.
- Revisar rewrites/proxy.
```

### fc3d2577cbb7 | CONSOLE_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /
Acao: route_load
URL: https://openai.com/
Detalhe observado: Refused to execute script from 'https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000' because its MIME type ('') is not executable, and strict MIME type checking is enabled.
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Erro no console do navegador (runtime_unknown)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Causas provaveis detectadas:
- Erro de runtime/console sem assinatura especifica.
- Excecao nao tratada em render ou evento.
- Dados inesperados sem validacao defensiva.

Checks tecnicos sugeridos:
- Usar stack trace para chegar no arquivo/linha.
- Adicionar guard clauses no trecho que falha.
- Reexecutar fluxo e confirmar ausencia do erro.
```


## Prompt Master

```text
Atue como engenheiro de software senior e corrija todas as issues listadas abaixo com foco em causa raiz.

Nao aplique correcoes cosmeticas. Garanta comportamento funcional correto em desktop e mobile.

Exigencias minimas: sem botao sem efeito, sem callback solto, sem erro fetch sem feedback, sem 4xx/5xx inesperado no fluxo principal e sem ordem de secoes quebrada.

Workflow obrigatorio: reproduzir, identificar causa raiz, corrigir com menor impacto, validar novamente via auditor.

Entregue ao final: codigo corrigido, resumo da causa raiz por categoria e evidencias de revalidacao.

Corrija as rotas/API com erro HTTP durante interacoes de UI.
Mantenha fluxo idempotente, mensagens de erro claras e status consistente na tela.
Ocorrencias:
- / -> 403 GET https://openai.com/
- / -> 404 GET https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000

Resolva erros de runtime/rede do frontend.
Garanta try/catch, fallback de estado e tratamento de respostas invalidas.
Ocorrencias:
- / -> CONSOLE_ERROR: Failed to load resource: the server responded with a status of 403 ()
- / -> CONSOLE_ERROR: Failed to load resource: the server responded with a status of 404 ()
- / -> CONSOLE_ERROR: Refused to execute script from 'https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000' because its MIME type ('') is not executable, and strict MIME type checking is enabled.

Use a classificacao inteligente para atacar causa raiz de fetch/network/http/runtime.
Para cada item: confirmar causa, aplicar fix robusto e validar com replay da auditoria.
Diagnosticos capturados:
- / -> route_load | HTTP 403 Forbidden [forbidden_permission] | 403 GET https://openai.com/
- / -> route_load | Console reportou recurso com HTTP 403 [console_http_403] | Failed to load resource: the server responded with a status of 403 ()
- / -> route_load | HTTP 404 Not Found [endpoint_not_found] | 404 GET https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000
- / -> route_load | Console reportou recurso com HTTP 404 [console_http_404] | Failed to load resource: the server responded with a status of 404 ()
- / -> route_load | Erro no console do navegador [runtime_unknown] | Refused to execute script from 'https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000' because its MIME type ('') is not executable, and strict MIME type checking is enabled.
```

## Prompt Rapido Do Assistente

```text
Atue como engenheiro de software senior com foco em execucao rapida e causa raiz.
Total de issues: 5.
Ordem de ataque: high -> medium -> low.
Nao aceitar fix cosmetico: cada problema precisa de evidencia de resolucao.

Top issues para iniciar:
1. [CONSOLE_ERROR] (low) / -> route_load | Failed to load resource: the server responded with a status of 403 ()
2. [CONSOLE_ERROR] (low) / -> route_load | Failed to load resource: the server responded with a status of 404 ()
3. [CONSOLE_ERROR] (low) / -> route_load | Refused to execute script from 'https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000' because its MIME type ('') is not executable, and strict MIME type checking is enabled.
4. [HTTP_4XX] (low) / -> route_load | 403 GET https://openai.com/
5. [HTTP_4XX] (low) / -> route_load | 404 GET https://openai.com/cdn-cgi/challenge-platform/h/b/scripts/alpha/invisible.js?ts=1773216000

SEO (obrigatorio):
Atue como especialista SEO senior com foco em causa raiz e impacto real no ranking.
Site auditado: https://www.openai.com
Score SEO atual: 16/100.
Objetivo: corrigir todos os itens pendentes abaixo sem fix cosmetico.

Checklist SEO pendente (explicacao para leigos + acao):
1. Title unico e com tamanho ideal (30-65) | por que importa: E o texto principal que aparece no Google. | o que fazer: Defina um title unico por pagina com foco na intencao do usuario.
2. Meta description clara (70-170) | por que importa: Ajuda a pessoa entender a pagina antes de clicar. | o que fazer: Crie descricao objetiva com beneficio real e chamada para acao.
3. Estrutura de headings com 1 H1 | por que importa: Organiza o tema principal da pagina para Google e usuarios. | o que fazer: Mantenha apenas um H1 claro e use H2/H3 para secoes.
4. HTML com lang e viewport mobile | por que importa: Melhora indexacao correta por idioma e experiencia em celular. | o que fazer: Adicione lang em <html> e meta viewport no <head>.
5. Canonical definido | por que importa: Evita conteudo duplicado em URLs diferentes. | o que fazer: Defina <link rel="canonical"> para cada pagina indexavel.
6. Schema JSON-LD (LocalBusiness/Service/FAQ) | por que importa: Aumenta chance de rich results no Google. | o que fazer: Adicione dados estruturados validos por pagina.
7. Conteudo util e suficiente | por que importa: Paginas rasas tendem a ranquear pior. | o que fazer: Adicione conteudo especifico, provas, FAQs e diferenciais.
8. Links internos entre paginas | por que importa: Ajuda rastreamento e distribuicao de autoridade. | o que fazer: Inclua links para servicos, contato, cidade e paginas correlatas.
9. Meta social (Open Graph + Twitter Card) | por que importa: Melhora compartilhamento e CTR em redes sociais. | o que fazer: Complete og:title, og:description, og:image, og:type e twitter:card.
10. Meta robots presente e coerente | por que importa: Define como bots devem indexar/seguir links. | o que fazer: Defina meta robots adequada para cada tipo de pagina.

Issues SEO detectadas:
1. [SEO_H1_MISSING] (high) Nenhum H1 encontrado na pagina. | recomendacao: Inclua 1 H1 claro descrevendo o tema principal da pagina.
2. [SEO_META_DESCRIPTION_MISSING] (high) Meta description ausente. | recomendacao: Adicione meta description unica com proposta clara da pagina.
3. [SEO_VIEWPORT_MISSING] (high) Meta viewport ausente. | recomendacao: Adicione meta viewport para boa experiencia mobile.
4. [SEO_CONTENT_THIN] (medium) Conteudo textual curto (0 palavras). | recomendacao: Adicione conteudo util e especifico sobre servico/local para SEO local.
5. [SEO_LANG_MISSING] (medium) Atributo lang ausente em <html>. | recomendacao: Defina lang no HTML para melhorar indexacao e acessibilidade.
6. [SEO_OPEN_GRAPH_INCOMPLETE] (medium) Open Graph incompleto (faltando og:title, og:description, og:image ou og:type). | recomendacao: Complete as metas Open Graph para melhorar compartilhamento e CTR.
7. [SEO_TITLE_LENGTH] (medium) Title com 16 caracteres (ideal: 30-65). | recomendacao: Ajuste o tamanho do title para melhorar leitura no Google.
8. [SEO_CANONICAL_MISSING] (low) Link canonical ausente. | recomendacao: Defina canonical para evitar duplicidade de URL.
9. [SEO_INTERNAL_LINKS_LOW] (low) Poucos links internos (0). | recomendacao: Aumente links internos para melhorar rastreio e distribuicao de autoridade.
10. [SEO_META_ROBOTS_MISSING] (low) Meta robots ausente. | recomendacao: Defina meta robots explicita para controle de indexacao.
11. [SEO_STRUCTURED_DATA_MISSING] (low) Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.
12. [SEO_TWITTER_CARD_MISSING] (low) Twitter Card ausente. | recomendacao: Adicione meta twitter:card e metadados sociais complementares.

Entrega obrigatoria:
- listar arquivos alterados e motivo de cada alteracao
- mostrar antes/depois dos metadados principais
- validar novamente e comprovar melhoria de score

Comando de revalidacao: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\openai.json" --fresh --live-log --human-log --scope "full" --no-server
```
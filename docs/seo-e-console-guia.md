# Guia de Uso: SEO Google + Console (CMD)

Este guia mostra, passo a passo, como um usuario opera:

- SEO interno do SitePulse (sempre ativo)
- Integracao opcional com Google Search Console
- Console CMD local (fluxo completo manual/replay)

## 1) SEO no SitePulse (uso padrao)

1. Abra o `SitePulse Studio`.
2. Na aba `Overview`, preencha `Target URL`.
3. Em `Audit focus`, escolha:
   - `SEO only` para auditoria so de SEO
   - `Full stack` para SEO + UX/Runtime
4. Clique em `Run native audit`.
5. Abra a aba `SEO` para ver:
   - `SEO score`
   - `Critical SEO issues`
   - recomendacoes

Importante: mesmo sem Google conectado, o SEO interno do SitePulse ja funciona.

## 2) Integrar Google Search Console (dados reais)

### 2.1 O que precisa antes

1. A propriedade precisa existir no Search Console e sua conta precisa ter acesso.
2. Formato da propriedade no app:
   - `https://seusite.com/` (URL-prefix)
   - `sc-domain:seusite.com` (Domain property)
3. Token OAuth com escopo de leitura do Search Console:
   - `https://www.googleapis.com/auth/webmasters.readonly`

### 2.2 Passo a passo dentro do app

1. No `SitePulse Studio`, va para a aba `SEO`.
2. Em `Google Search Console source`:
   - `Property`: informe a propriedade
   - `Access token`: cole o token OAuth
   - `Lookback`: defina janela de dias (3 a 90; padrao 28)
3. Clique `Save source` para salvar localmente.
4. Clique `Refresh Google data`.
5. Confira os campos atualizados:
   - `Avg position`
   - `Clicks`
   - `Impressions`
   - `CTR`
   - `Top query`
   - `Top page`

## 3) Como conseguir o token do Google (passo a passo)

Opcao mais comum para operacao manual:

1. No Google Cloud Console, crie/abra um projeto.
2. Ative a API `Google Search Console API`.
3. Configure OAuth consent (se ainda nao estiver configurado).
4. Crie um `OAuth Client` (Desktop app ou Web app).
5. Abra o OAuth Playground (ou fluxo OAuth equivalente).
6. Autorize o escopo:
   - `https://www.googleapis.com/auth/webmasters.readonly`
7. Troque o authorization code por `access_token`.
8. Cole o `access_token` no campo `Access token` do SitePulse e use `Refresh Google data`.

Se falhar, valide:

- a conta Google tem permissao na propriedade
- propriedade informada no formato correto
- token nao expirou
- escopo do token inclui `webmasters.readonly`

## 4) Uso do Console (CMD) no SitePulse Studio

Use esse modo quando quiser execucao manual visivel no terminal, replay tecnico ou operacao assistida.

### 4.1 Abrindo pelo app (recomendado)

1. Na aba `Overview`, configure:
   - `Target URL`
   - `Device mode`
   - `Audit focus`
   - `Sweep depth`
2. (Opcional) marque `Request admin when opening CMD` se precisar UAC/admin.
3. Clique `Open full CMD flow`.
4. O SitePulse abre uma janela `CMD` com o comando pronto.
5. Acompanhe progresso no proprio CMD e no painel `Operations` do app.

Notas:

- `Mobile + Family sweep` nao abre via CMD (esse caso fica no fluxo nativo).
- Se o UAC for negado, o app retorna erro de abertura do CMD.

### 4.2 Rodando direto no terminal (sem UI)

Na raiz do repositorio:

```powershell
npm run audit:cmd -- --base-url "https://example.com" --no-server --scope full --fresh --live-log --human-log
```

Modo mobile:

```powershell
npm run audit:cmd:mobile -- --base-url "https://example.com" --no-server --scope full --fresh --live-log --human-log
```

Wizard interativo em terminal:

```powershell
npm run audit:wizard
```

Bridge local para integracao desktop:

```powershell
npm run audit:bridge
```

## 5) Resultado esperado

Depois da execucao, os artefatos ficam em `qa/reports/`:

- `*-sitepulse-report-final.json`
- `*-sitepulse-report-final.md`
- `*-sitepulse-issues-final.log`
- `*-sitepulse-assistant-final.txt`


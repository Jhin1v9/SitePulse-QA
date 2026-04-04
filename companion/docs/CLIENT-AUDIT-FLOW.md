# Fluxo de auditoria — cliente final (coesão e requisitos)

Este documento resume **se** e **como** o utilizador final pode correr auditorias no SitePulse Studio (Electron), e o **nexo** entre motor, URL e UI.

## Resposta direta: pode correr auditoria?

**Sim**, no app empacotado (`npm run dev` em desenvolvimento ou instalador), desde que:

1. **Aplicação + bridge** — o processo Electron está a correr e o **engine/bridge local** está **online** (`companionState.bridge.running === true`). Sem bridge não há execução real de auditoria no motor nativo.
2. **URL alvo** — o campo **Target URL** (Control Center / overview) tem um URL válido. `handleAuditRun` usa `collectRunInput()` e **bloqueia** se `baseUrl` estiver vazio.
3. **Sem corrida** — não há outro pedido de auditoria em curso (`auditRequestInFlight` / `audit.running`).

## Onde o utilizador dispara a auditoria (pontos de entrada)

| Entrada | Notas |
|--------|--------|
| **Run native audit** (overview / sticky) | Fluxo principal |
| **Dock** “run audit” (se existir no layout) | Atalho inferior |
| **Command palette** (Ctrl+K) | “Run native audit”, “Run deep audit”, “Ligar motor”, etc. |
| **Menu Tools** | Start Engine, depois voltar ao overview e Run |
| **Painel IA** | Atalho “Ligar motor” inicia o bridge; não substitui o URL nem a execução da auditoria sozinha |
| **Atalhos** | Ctrl+Enter (native), Ctrl+Shift+Enter (deep), conforme bindings |

## Nexo lógico (ordem recomendada)

```text
Instalar / abrir app → Ligar motor (bridge) → Definir Target URL → Perfil (scope/depth) → Run native audit
     → Operações / Findings / Reports conforme resultado
```

- **Motor offline**: a UI mostra toast orientando a ligar o bridge (Tools, paleta “Ligar motor”, ou botão na IA) — **não** é obrigatório passar só por Settings; o texto da app foi alinhado a isso.
- **Sem URL**: toast a pedir URL antes de iniciar — coerente com `collectRunInput()`.

## Modo Phase1 workspace (Findings + Settings)

Com `sitepulse:workspace-phase1` ativo, apenas **Findings** e **Settings** usam o `workspace-host`; **Overview** continua no **mainGrid** com o Control Center. O utilizador **continua a poder** definir URL e correr auditoria a partir do overview — o mapeamento de workspace não remove essa superfície.

## O que *não* testa o “cliente final” neste repositório

- **Playwright `file://`** em `renderer.html` sem Electron: o `sitePulseCompanion` é mock; útil para layout/smoke, não para auditoria real.
- **CI headless** (`test:phase1-workspace`, `ui-contract.mjs`): valida navegação e contratos de DOM com mocks, não o motor Node da bridge.

## Testes automatizados úteis no repo

- `npm run test:phase1-workspace` — smoke Phase1 (Findings/Settings + DOM).
- `npm run test:ui` — contrato UI com mock do companion.
- `npm run smoke` — arranque Electron smoke (quando aplicável ao ambiente).

Para validação **real** de auditoria: `npm run dev` (ou build instalado), bridge a correr, URL real, e observar Operations / relatório.

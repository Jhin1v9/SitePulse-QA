# Testes e validação — SitePulse Studio (companion)

Sempre que houver alterações no companion (UI, main, preload, serviços), devem ser corridos **smoke**, **testes de UI** e, quando existir, **lint**. O agente deve fazer isto antes de dar a tarefa por concluída.

## Comandos (a correr a partir de `companion/`)

| Comando | Descrição |
|--------|------------|
| `npm run smoke` | Smoke test em Electron: arranque do app, bridge, auditoria curta. Confirma que o processo principal e o runtime respondem. |
| `npm run test:ui` | Contrato de UI (Playwright): carrega o renderer, verifica layout, navegação, overflow, e fluxo de auditoria com mock. |
| `npm run check` | Corre **smoke** e depois **test:ui** (validação em sequência). |

## Quando correr

- Após alterações em `companion/src` (renderer, main, preload, serviços).
- Antes de considerar concluída qualquer tarefa que mexe no desktop app.
- Após correções de bugs (para garantir que não há regressões).

## Notas

- **Smoke:** Requer que o app feche sozinho após o smoke (modo `--smoke-test`). Se o Electron falhar ao arrancar, o script termina com erro.
- **test:ui:** Abre o renderer como ficheiro no Playwright; em alguns ambientes o bootstrap pode não correr como no Electron. Falhas aqui podem ser ambientais; o comportamento real deve ser validado no app construído (`npm run build:run`).
- **Lint:** O companion não tem ESLint configurado. No repo raiz, `npm run lint` aplica-se ao Next.js; para o companion, a validação base é smoke + test:ui. Pode ser adicionado ESLint/outro linter mais tarde.

## Regra para o agente

Sempre que alterar o companion: ao finalizar, correr `npm run check` (ou, em separado, `npm run smoke` e `npm run test:ui`) e reportar o resultado. Se algum teste falhar, investigar e corrigir antes de dar a tarefa por concluída.

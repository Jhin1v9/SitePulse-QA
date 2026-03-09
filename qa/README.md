# SitePulse QA (Standalone)

Auditor via CMD/Playwright para validar o site real com relatorio tecnico e explicacao para leigos.

## O que verifica
- botoes sem efeito
- erros de rota (404)
- erros de request/fetch (4xx/5xx)
- request failed
- runtime JS error
- console error
- regras visuais de ordem de secoes (ex.: FAQ antes do footer)
- secao obrigatoria ausente/invisivel

Cada issue sai com:
- `code`
- explicacao tecnica
- explicacao leiga
- resolucao recomendada
- prompt de correcao por issue (`recommendedPrompt`)
- dicas operacionais para assistente (`assistantHint` com prioridade/checks/comandos)

Eventos live:
- use `--live-log` para emitir eventos de rota/clique no stdout (`SPLIVE {...}`).
- o `SitePulse Studio` usa isso para mostrar a execucao em tempo real.
- use `--human-log` junto para imprimir eventos legiveis no CMD.
- use `--base-url <URL>` para auditar uma URL sem editar config.
- use `--no-server` para nao subir servidor local (ideal para URL externa).

## Uso rapido
1. Entre em `sitepulse-standalone/qa`
2. Rode `npm install`
3. Rode uma das opcoes:
   - `npm run audit` (desktop, headless)
   - `npm run audit:mobile` (mobile, headless)
   - `npm run audit:headed` (desktop com navegador aberto)
   - `npm run audit:auto` (retoma checkpoints ate concluir)
   - `npm run audit:hub` (wizard guiado em CMD com resumo final inteligente)
   - `npm run audit:cmd` (terminal com progresso/eventos em tempo real)
   - `npm run audit:cmd:mobile` (igual acima em mobile)
   - `npm run audit:bridge` (bridge localhost para disparar auditoria completa via app web)

Ou use:
- `run-audit.cmd`
- `run-audit-auto.cmd`
- `run-audit-live.cmd`
- `run-audit-hub.cmd`
- `run-audit-bridge.cmd`
- `run-audit-url.cmd <BASE_URL>`

## Bridge local (web -> CMD completo)
Quando o Hub estiver hospedado (ex.: Vercel), rode no seu PC:
```bash
npm run audit:bridge
```

Endpoints do bridge:
- `GET /health`
- `POST /run` (auditoria completa e retorno do report)
- `POST /open-cmd` (abre janela CMD local, com opcao admin/UAC)

## Configs
- `audit.default.json` (desktop)
- `audit.default.mobile.json` (mobile)

Campos importantes:
- `sectionOrderRules`: regras de ordem visual por seletor
- `sectionOrderWaitMs`: espera antes de validar ordem visual
- `ignoredRequestFailedErrors`: ruido de rede para ignorar

Exemplo de `sectionOrderRules`:
```json
[
  {
    "id": "faq-before-footer",
    "routes": ["/"],
    "beforeSelector": "#service-details",
    "afterSelector": "#footer",
    "required": true
  }
]
```

## Saida
Arquivos na pasta `reports/`:
- `*-sitepulse-report-final.json`
- `*-sitepulse-report-final.md`
- `*-sitepulse-issues-final.log`
- `*-sitepulse-assistant-final.txt` (brief de acao rapida para correcao)

Quando pausa por tempo, gera `partial` e checkpoint para retomada.

No JSON final:
- `promptPack.masterPrompt`: prompt inteligente consolidado para corrigir tudo.
- `promptPack.issuePrompts`: prompt individual por issue.
- `assistantGuide`: plano de ataque rapido (rotas prioritarias, passos imediatos, top issues e prompt rapido).

No `audit:hub`:
- perguntas guiadas (modo/url/server/headed/fresh)
- execucao do auditor normal com live logs
- resumo final com top issues, severidade, passos imediatos e replay command

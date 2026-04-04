# Auto-fix & Verify — Arquitetura real

Objetivo: integrar um fluxo em que o app **vê o problema → aplica correção → confere se arrumou**, de forma realista (pasta local ou ligação à hospedagem).

---

## O que já existe hoje

- **Motor de auditoria:** encontra issues (SEO, runtime, visual, etc.).
- **Self-healing:** classifica elegibilidade, gera **prompt de correção** e marca "prompt ready"; o utilizador **copia o prompt** e aplica à mão; depois **revalida** com nova auditoria.
- **`direct_action`:** existe no modelo (healing mode) mas está só como placeholder — "It is not used as an automatic path today" (DESKTOP_AI_ARCHITECTURE).
- Ou seja: hoje é **sempre human-in-the-loop** (sugestão + revalidação manual).

---

## O que seria "IA arruma e confere"

1. **Detetar** o problema (já temos).
2. **Decidir** a correção (regras + opcionalmente LLM).
3. **Aplicar** a alteração num sítio real: ficheiros no disco **ou** via API da hospedagem.
4. **Verificar** se arrumou: nova auditoria (localhost ou URL após deploy).

Para ser **real**, é preciso uma de duas coisas (ou as duas):

- **Opção A — Pasta local (projeto do site)**  
  Utilizador indica em Settings a pasta do projeto (ex.: `C:\projetos\superclim-es`). O app **edita ficheiros** nessa pasta (HTML, CSS, meta tags, etc.). O utilizador faz deploy (git push, FTP, ou script que ele configurar). A **verificação** pode ser: auditoria em **localhost** (servidor de dev na mesma pasta) ou auditoria na **URL em produção** depois do deploy.

- **Opção B — Login / linkagem com a hospedagem**  
  Utilizador faz login (OAuth) na plataforma (ex.: Vercel, Netlify, ou API do host). O app **envia alterações** via API (ficheiros ou trigger de build) e depois **re-audita a URL** do site para confirmar que arrumou.

Ambas são viáveis; a **A é a mais simples** para um primeiro passo real (sem depender de APIs de terceiros).

---

## Opção A — Pasta local (recomendada para MVP)

### Fluxo

1. **Settings:** nova secção "Auto-fix (experimental)" com:
   - **Project path:** pasta raiz do projeto (ex.: Next.js, Astro, HTML estático).
   - **Local verify URL (opcional):** ex. `http://localhost:3000` para re-auditar depois de aplicar patches.
   - **Deploy command (opcional):** ex. `npm run deploy` ou `git push origin main`, para o utilizador executar quando quiser.

2. **Quando há issue elegível para auto-fix:**
   - O motor já sabe: `issueCode`, `route`, `recommendedResolution`, `diagnosis`, evidência.
   - Um **resolver** (novo módulo) mapeia issue + route → **ficheiro(s) provável(eis)** (ex.: `layout.tsx`, `index.html`, `_document.js`).
   - Um **patch generator** produz a alteração:
     - **Fase 1:** regras por tipo de issue (ex.: `SEO_LANG_MISSING` → adicionar `lang="pt"` em `<html>`; meta description vazia → preencher a partir do título).
     - **Fase 2 (opcional):** chamada a LLM (API do utilizador) para patches mais complexos.
   - O app **aplica o patch** no ficheiro (edição em disco) e regista em "healing attempt" com origem `auto_applied`.

3. **Verificar se arrumou:**
   - Se "Local verify URL" estiver preenchido: o app pode **iniciar o servidor de dev** (ex. `npm run dev`) na project path, esperar estar up, e **rodar uma auditoria contra esse localhost**; compara métricas antes/depois.
   - Se não: o utilizador faz deploy e **re-audita a URL de produção** manualmente; o fluxo de revalidação de healing que já existe marca a tentativa como validada/falhada.

4. **Segurança e confiança:**
   - Primeira vez: pedir confirmação ("Aplicar correção automática em N ficheiros?").
   - Manter **backup** do bloco alterado ou ficheiro antes de editar (rollback simples).
   - Log claro: "Auto-fix applied to file X for issue Y".

### Onde encaixar no código

- **Companion:** nova secção em Settings (project path, local verify URL, deploy command); novo IPC ex.: `applyAutoFix(payload)` que chama um módulo Node no main process.
- **Main process:** módulo que recebe project path + issue + patch, escreve no disco (com backup), e opcionalmente executa comando (ex. dev server) para verify.
- **QA runtime:** o relatório e o healing já expõem o que precisamos; podemos adicionar um "auto-fix suggestion" por issue (patch template ou texto) sem mudar a lógica atual de healing.

---

## Opção B — Hospedagem (Vercel / Netlify / etc.)

### Fluxo

1. **Settings:** "Ligar hospedagem" → OAuth com a plataforma; guardar token; escolher projeto/site.
2. **Após auditoria:** para issues elegíveis, o app gera o patch e envia via API da plataforma (ex.: criar/atualizar ficheiro no repo conectado, ou trigger deploy com build que use esse repo).
3. **Verificar:** polling ou webhook para "deploy finished"; depois **re-auditar a URL** do site e marcar a tentativa de healing como validada ou falhada.

Requer: integração com API (Vercel, Netlify, etc.), gestão de tokens, e que o site do utilizador já esteja lá. É o passo natural **depois** da Opção A estar estável.

---

## Resumo

- **Tem como integrar** uma "IA" (regras + opcionalmente LLM) que **vê o problema, aplica correção e confere**.
- O modo **mais real e controlado** para já é:
  - **Pasta local:** utilizador indica onde está o projeto; o app edita ficheiros, opcionalmente verifica em localhost e/ou o utilizador faz deploy e re-audita a URL.
- O **login/linkagem com a hospedagem** é o próximo passo para aplicar e verificar direto em produção, sem o utilizador ter de fazer deploy manual.

Se quiseres, o próximo passo concreto é: definir em Settings a **Project path** e um primeiro **resolver** (issue → ficheiro) + **patch templates** para 2–3 issue codes (ex. `SEO_LANG_MISSING`, meta description), e o fluxo "Apply patch → optional local verify" sem LLM, para validar o conceito.

# Como usar o programa desktop (build empacotado)

O SitePulse Studio é um **programa desktop**. Cada vez que alteras código, deves **gerar um novo build** e abrir o .exe desse build — não rodar em modo "site" (dev).

---

## Fluxo: alterar → buildar → abrir o programa

**Pasta do projeto:**

```
c:\Users\Administrador\Documents\SitePulse-QA\companion
```

**Comando principal (build + abrir o programa):**

```powershell
cd "c:\Users\Administrador\Documents\SitePulse-QA\companion"
npm run build:run
```

Isto:
1. Faz **sync do runtime** e **pack** do Electron (`pack:dir`).
2. Abre o **executável** gerado em `dist\win-unpacked\SitePulse Studio.exe`.

Sempre que modificares algo no código, volta a correr `npm run build:run` para ter o programa atualizado.

---

## Só buildar (sem abrir)

Se quiseres apenas gerar o programa sem o lançar:

```powershell
cd "c:\Users\Administrador\Documents\SitePulse-QA\companion"
npm run build
```

O .exe fica em:

```
c:\Users\Administrador\Documents\SitePulse-QA\companion\dist\win-unpacked\SitePulse Studio.exe
```

Podes criar um atalho para este .exe. **Importante:** cada vez que mudares código, volta a correr `npm run build` (ou `npm run build:run`) para que o atalho abra a versão nova.

---

## Resumo

| O que queres | Comando | Resultado |
|--------------|---------|-----------|
| Buildar e abrir o programa | `npm run build:run` | Gera `dist\win-unpacked\` e abre **SitePulse Studio.exe** |
| Só buildar | `npm run build` | Gera `dist\win-unpacked\`; abres o .exe à mão |
| Instalador Windows (opcional) | `npm run build:win` | Gera instalador NSIS + zip em `dist\` |

---

## Como confirmar que estás no build certo

- Ao abrir o **AI** (botão AI ou Ctrl+J), o painel deve aparecer **em baixo**, em largura total (não em coluna direita).
- O título da janela é **"SitePulse Studio"** (sem "(Dev)" — "(Dev)" só aparece em `npm run dev`).

---

## Convenção

Sempre que houver alterações no código do companion (UI, lógica, etc.), o fluxo é: **é só dar um `npm run build:run`** e abres o programa atualizado.

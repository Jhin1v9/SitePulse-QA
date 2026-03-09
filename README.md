# SitePulse Standalone

Projeto independente com:
- app web (Next.js) para operar auditoria e ler relatorios
- auditor CLI (`qa`) com Playwright para varrer qualquer URL
- companion Windows (`companion`) para rodar auditoria local completa sem depender do codigo-fonte no navegador

Nao depende de outro projeto para funcionar.

## Estrutura
- `app/`: interface web SitePulse Hub
- `qa/`: motor de auditoria (CMD + relatorios + prompt pack)
- `companion/`: app Windows com localhost bridge e runtime local
- `public/`: recursos web do app instalavel (PWA)

## Rodar local
```bash
cd SitePulse-QA
npm install
npm run dev
```

Abrir:
- `http://localhost:3000/?autologin=1`

## Companion Windows
Objetivo:
- entregar a camada com permissao local que o browser nao tem
- subir o bridge em `127.0.0.1:47891`
- executar o motor `qa` localmente via Playwright real

Comandos:
```bash
npm run companion:install
npm run companion:smoke
npm run companion:build:win
```

Resultado do build Windows:
- `companion/dist/SitePulse-Companion-1.0.0-Setup.exe`

Observacao:
- o companion e a ponte entre o Hub web e a auditoria local completa
- este e o passo correto antes de transformar o produto inteiro em desktop app

## Usar no browser e como app
- Browser normal: abra a URL do projeto e rode auditorias no painel.
- App instalavel (PWA): use o botao `modo app` no topo.
- Quando o navegador liberar instalacao, o botao muda para `instalar app`.
- Se o navegador nao liberar prompt automatico, use menu do navegador:
  - Chrome/Edge: `Instalar app`
  - iOS Safari: `Compartilhar > Adicionar a Tela de Inicio`

## Auditoria completa via browser
Fluxo preferido:
1. instale/abra o `SitePulse Companion`
2. deixe o bridge local online
3. no SitePulse Hub, clique em `Checar Companion local`
4. clique em `Auditar completo (Companion local)`

Fluxo alternativo para desenvolvimento:
1. rode `npm run audit:bridge`
2. use o mesmo Hub web para disparar a auditoria

O bridge roda em `http://127.0.0.1:47891` e permite que a interface web dispare o mesmo motor do CMD com retorno de relatorio completo.

## Auditoria via CMD
```bash
npm run audit:cmd
npm run audit:cmd:mobile
npm run audit:self
npm run audit:self:mobile
```

Relatorios ficam em:
- `qa/reports`

## Deploy no Vercel
1. Importe o repositorio no Vercel.
2. Framework: `Next.js`.
3. Build Command: `npm run build`.
4. Output: padrao do Next.js.
5. Deploy.

## Observacao importante
No Vercel, o app web funciona como central de comando e leitura de relatorios.
A execucao Playwright completa (cliques/layout em browser real) pode ser feita:
- via `SitePulse Companion` local
- via CMD local tradicional
- ou via `Bridge local` manual acionado pela interface web em ambiente de desenvolvimento

# SitePulse Standalone

Projeto independente com:
- app web (Next.js) para operar auditoria e ler relatorios
- auditor CLI (`qa`) com Playwright para varrer qualquer URL
- programa desktop Windows (`companion`) com Hub embutido, bridge local e runtime proprio

Nao depende de outro projeto para funcionar.

## Estrutura
- `app/`: interface web SitePulse Hub
- `qa/`: motor de auditoria (CMD + relatorios + prompt pack)
- `companion/`: app desktop Windows com Hub local, bridge e runtime empacotado
- `public/`: recursos web do app instalavel (PWA)

## Rodar local
```bash
cd SitePulse-QA
npm install
npm run dev
```

Abrir:
- `http://localhost:3000/?autologin=1`

## SitePulse Desktop
Objetivo:
- entregar a camada com permissao local que o browser nao tem
- abrir o SitePulse Hub dentro do proprio programa
- subir o bridge local em `127.0.0.1:47891`
- subir o Hub local em `127.0.0.1:47892`
- executar o motor `qa` localmente via Playwright real, sem depender do browser aberto

Comandos:
```bash
npm run companion:install
npm run desktop:smoke
npm run companion:smoke
npm --prefix companion run pack:dir
npm run companion:build:win
npm run desktop:build:win
```

Resultado do build Windows:
- `companion/dist/SitePulse-Desktop-1.0.0-Setup.exe`
- executavel direto: `companion/dist/win-unpacked/SitePulse Desktop.exe`

Observacao:
- o antigo companion virou a base do `SitePulse Desktop`
- o programa desktop agora embute o Hub e o runtime local
- o site web continua existindo para uso no browser e para deploy no Vercel

## Usar no browser e como app
- Browser normal: abra a URL do projeto e rode auditorias no painel.
- App instalavel (PWA): use o botao `modo app` no topo.
- Quando o navegador liberar instalacao, o botao muda para `instalar app`.
- Se o navegador nao liberar prompt automatico, use menu do navegador:
  - Chrome/Edge: `Instalar app`
  - iOS Safari: `Compartilhar > Adicionar a Tela de Inicio`

## Auditoria completa via browser
Fluxo preferido:
1. instale/abra o `SitePulse Desktop`
2. o programa sobe o Hub e o bridge local automaticamente
3. use o Hub dentro do proprio desktop app
4. opcionalmente, use o Hub web para conversar com o bridge local

Fluxo alternativo para desenvolvimento:
1. rode `npm run audit:bridge`
2. use o mesmo Hub web para disparar a auditoria

O bridge roda em `http://127.0.0.1:47891` e permite que a interface web dispare o mesmo motor do CMD com retorno de relatorio completo.

## Validacao do desktop
- smoke dev: `npm run desktop:smoke`
- empacotar apenas pasta executavel: `npm --prefix companion run pack:dir`
- smoke do empacotado em ambiente automatizado: definir `SITEPULSE_DESKTOP_SMOKE=1` e executar `SitePulse Desktop.exe`

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
- via `SitePulse Desktop` local
- via CMD local tradicional
- ou via `Bridge local` manual acionado pela interface web em ambiente de desenvolvimento

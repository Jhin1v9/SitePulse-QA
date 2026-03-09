# SitePulse Standalone

Projeto independente com:
- app web (Next.js) para operar auditoria e ler relatorios
- auditor CLI (`qa`) com Playwright para varrer qualquer URL

Nao depende de outro projeto para funcionar.

## Estrutura
- `app/`: interface web SitePulse Hub
- `qa/`: motor de auditoria (CMD + relatorios + prompt pack)
- `public/`: recursos web do app instalavel (PWA)

## Rodar local
```bash
cd SitePulse-QA
npm install
npm run dev
```

Abrir:
- `http://localhost:3000/?autologin=1`

## Usar no browser e como app
- Browser normal: abra a URL do projeto e rode auditorias no painel.
- App instalavel (PWA): use o botao `modo app` no topo.
- Quando o navegador liberar instalacao, o botao muda para `instalar app`.
- Se o navegador nao liberar prompt automatico, use menu do navegador:
  - Chrome/Edge: `Instalar app`
  - iOS Safari: `Compartilhar > Adicionar a Tela de Inicio`

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
A execucao Playwright completa (cliques/layout em browser real) continua recomendada em maquina local via CMD.

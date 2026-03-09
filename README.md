# SitePulse Standalone

Pasta independente com:
- app web (Next.js) para operar auditoria e ler relatorios
- auditor CLI (`qa`) com Playwright para varrer qualquer URL

Nao depende do projeto Kuruma para funcionar.

## Estrutura
- `app/`: interface web SitePulse Hub
- `qa/`: motor de auditoria (CMD + relatórios + prompt pack)

## Rodar local
```bash
cd sitepulse-standalone
npm install
npm run qa:install
npm run dev
```

Abrir:
- `http://localhost:3000/?autologin=1`

## Auditoria via CMD
```bash
npm run audit:cmd
npm run audit:cmd:mobile
npm run audit:self
npm run audit:self:mobile
```

Os relatórios ficam em:
- `qa/reports`

## Deploy separado no Vercel
1. Importe o repositório no Vercel.
2. Em **Root Directory**, escolha `sitepulse-standalone`.
3. Framework: `Next.js`.
4. Build Command: `npm run build`.
5. Start Command: `npm run start`.
6. Deploy.

## Observacao importante
No Vercel, o app web funciona como central de comando e leitura de relatorios.
A execução Playwright (`qa`) deve ser usada localmente/runner próprio, porque ambiente serverless normalmente nao suporta browser automation completa.

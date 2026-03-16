# Build output e recuperação

## Onde as alterações ao código são aplicadas

- **Fonte da verdade:** todo o código da aplicação está em `companion/src` (ex.: `renderer.js`, `renderer.html`, `main.cjs`). As alterações que fizeres são guardadas aqui.
- **Modo desenvolvimento (`npm run dev`):** o Electron carrega **diretamente** de `companion/src`. Ao dares Ctrl+F5 (refresh), a janela recarrega com o conteúdo **atual** de `src`. Por isso, em dev vês as últimas alterações sem fazer build.
- **Dist (build) NÃO atualiza sozinho:** a pasta `companion/dist` é gerada **só quando corres um build** (`npm run pack:dir`, `npm run pack:dir:no-sign` ou `npm run build:run`). O executável dentro de `dist` usa uma **cópia** do que estava em `src` no momento do build. Se editares `src` depois, o `.exe` em `dist` continua com o código antigo até fazeres um **novo** build.
- **Resumo:** para que as tuas alterações apareçam no **executável** (.exe), tens de fazer um novo build. Para testar em dev com as últimas alterações, usa `npm run dev` e Ctrl+F5.

## Onde fica o build

- **Única pasta de saída:** `companion/dist`
- **Executável (unpacked):** `companion/dist/win-unpacked/SitePulse Studio.exe`
- **Scripts:** `npm run pack:dir` (só unpacked) ou `npm run build:win` (installer + zip)

Sempre que rodas build, a saída vai para `dist`. Não há outras pastas `dist-*` oficiais.

## Recuperar um build funcional

Se perdeste o conteúdo de `dist` (por exemplo apagaste pastas por engano):

1. **Fechar o app** – encerra o SitePulse Studio e qualquer processo que use ficheiros em `companion/dist`.
2. **Apagar a pasta antiga (opcional):**  
   `Remove-Item -Recurse -Force companion\dist`  
   (só se o build falhar com "Acesso negado".)
3. **Gerar novo build:**  
   `cd companion`  
   `npm run pack:dir`
4. O executável volta a estar em:  
   `companion\dist\win-unpacked\SitePulse Studio.exe`

O código em `companion/src` (renderer, main, etc.) é a fonte da verdade; o `dist` é só o resultado do build. Qualquer build novo a partir desse código gera de novo o app completo (incluindo UI rework e conversas persistentes).

## Preservar um build antes de rebuild

Se quiseres guardar uma cópia do build actual antes de correr outro:

```powershell
$date = Get-Date -Format "yyyy-MM-dd-HHmm"
Copy-Item -Recurse companion\dist "companion\dist-backup-$date"
```

Depois podes voltar a usar esse backup copiando-o de novo para `dist` se precisares.

---

## Erro `ERR_ELECTRON_BUILDER_CANNOT_EXECUTE`

Este erro aparece quando o electron-builder não consegue executar um subprocesso (por exemplo `app-builder.exe` ou `signtool.exe`). Causas comuns no Windows:

1. **SitePulse Studio ainda está aberto** – ficheiros em `dist` ou no runtime estão em uso. **Solução:** Fechar o app completamente e tentar de novo.
2. **Antivírus / Windows Defender** – bloqueia o executável do builder ou o processo de assinatura. **Solução:** Excluir temporariamente a pasta do projeto (ou `companion\node_modules`, `companion\dist`) das verificações em tempo real, ou desativar temporariamente e correr o build.
3. **Assinatura de código (signtool)** – se não tiveres certificado configurado ou o signtool falhar, o build pode terminar com este código. **Solução:** Fazer build **sem assinatura** para uso local (o app funciona na mesma):

   ```powershell
   cd companion
   npm run pack:dir:no-sign
   ```

   Ou manualmente (PowerShell):  
   `$env:CSC_IDENTITY_AUTO_DISCOVERY="false"; npm run pack:dir`
4. **Caminho com caracteres especiais ou muito longo** – em casos raros, mover o projeto para uma pasta mais curta e sem acentos (ex.: `C:\dev\SitePulse-QA`) pode resolver.
5. **Cache/node_modules corrompidos** – apagar `companion\node_modules` e `companion\dist`, depois `npm install` e `npm run pack:dir` de novo.

O executável gerado sem assinatura continua a funcionar; só não é recomendado para distribuição pública.

---

## Testar botões e navegação no app construído

As alterações ao código (ex.: correções nos botões e na navegação) **só são aplicadas no executável depois de um novo build**. Para testar com a versão mais recente:

1. **Fechar** qualquer instância do SitePulse Studio.
2. **Gerar novo build:**  
   `cd companion`  
   `npm run pack:dir:no-sign`  
   (ou `npm run build:run` para construir e lançar o app.)
3. **Abrir o executável** gerado:  
   `companion\dist\win-unpacked\SitePulse Studio.exe`  
   (não uses um atalho antigo que aponte para outra pasta.)
4. **Provar na mão:** clicar na sidebar (Control Center, Runs, Findings, Settings), no Run/Load/AI da topbar e nos botões do Overview. A navegação só trata cliques em botões **dentro da sidebar**; os restantes botões devem executar a ação própria (Run audit, Load report, etc.).

O teste automatizado `npm run test:ui` abre o renderer em contexto de ficheiro (Playwright), onde o bootstrap pode não correr como no Electron; o comportamento real dos botões deve ser validado no app construído.

---

## Log automático (onde o app grava o log)

O SitePulse Studio grava log automaticamente em ficheiro. Para ver erros ou mensagens quando os botões não respondem:

1. **Log principal (desktop):**  
   Pasta: `%APPDATA%\SitePulse Studio\logs\`  
   Ficheiro: `desktop-AAAA-MM-DD.log` (data do dia).  
   Caminho completo exemplo:  
   `C:\Users\<utilizador>\AppData\Roaming\SitePulse Studio\logs\desktop-2026-03-14.log`

2. **Log de arranque (bootstrap):**  
   `%APPDATA%\sitepulse-desktop\bootstrap.log`  
   (útil para falhas ao iniciar o app.)

Dentro do app, o painel **Settings** mostra QA runtime, Reports e Bridge URL; as linhas de log recentes aparecem também no painel **Runs** (log em tempo real). Para abrir a pasta do log no Explorador: `Win+R` → `%APPDATA%\SitePulse Studio\logs` → Enter.

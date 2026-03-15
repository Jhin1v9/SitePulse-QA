# Build output e recuperação

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

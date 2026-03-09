@echo off
setlocal
cd /d "%~dp0"
if "%~1"=="" (
  echo Uso: run-audit-url.cmd ^<BASE_URL^> [opcoes adicionais]
  echo Exemplo: run-audit-url.cmd https://meusite.com --headed
  exit /b 1
)
set BASE_URL=%~1
shift
node src\index.mjs --config audit.default.json --fresh --base-url "%BASE_URL%" --no-server --live-log --human-log %*
endlocal

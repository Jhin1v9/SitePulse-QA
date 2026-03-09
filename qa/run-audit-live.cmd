@echo off
setlocal
cd /d "%~dp0"
node src\index.mjs --config audit.kuruma.json --fresh --live-log --human-log %*
endlocal

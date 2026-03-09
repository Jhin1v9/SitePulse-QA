@echo off
setlocal
cd /d "%~dp0"
node src\index.mjs --config audit.kuruma.json %*
endlocal

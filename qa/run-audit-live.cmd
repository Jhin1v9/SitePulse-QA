@echo off
setlocal
cd /d "%~dp0"
node src\index.mjs --config audit.default.json --fresh --live-log --human-log %*
endlocal

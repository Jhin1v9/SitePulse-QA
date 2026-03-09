@echo off
setlocal
cd /d "%~dp0"
node src\run-until-done.mjs --config audit.default.json %*
endlocal

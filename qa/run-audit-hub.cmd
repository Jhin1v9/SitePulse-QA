@echo off
setlocal
cd /d "%~dp0"
node src\cmd-hub.mjs %*
endlocal


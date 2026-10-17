@echo off
setlocal
title Selfbot Pro - Launcher

set "PROJECT_ROOT=%~dp0"

echo Iniciando os modulos do projeto...

start "Selfbot Pro - Frontend" cmd /k "cd /d ""%PROJECT_ROOT%"" ^&^& npm run dev --workspace=@selfbot-pro/frontend"
start "Selfbot Pro - Backend" cmd /k "cd /d ""%PROJECT_ROOT%"" ^&^& npm run dev --workspace=@selfbot-pro/backend"
start "Selfbot Pro - Worker" cmd /k "cd /d ""%PROJECT_ROOT%"" ^&^& npm run dev --workspace=@selfbot-pro/worker"

echo Frontend, backend e worker foram iniciados em janelas separadas.
endlocal

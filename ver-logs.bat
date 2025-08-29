@echo off
echo 📋 LOGS DO SCRAPER DOS CORREIOS
echo.
echo Pressione Ctrl+C para sair dos logs
echo.
pause

REM Mostrar logs em tempo real
pm2 logs correios-scraper

@echo off
echo 📊 STATUS DO SCRAPER DOS CORREIOS
echo.

REM Status do PM2
echo 🔄 STATUS PM2:
pm2 status

echo.
echo 📈 INFORMAÇÕES DETALHADAS:
pm2 show correios-scraper

echo.
echo 📋 ARQUIVOS DE PROGRESSO:
if exist progresso_pm2.json (
    echo ✅ progresso_pm2.json - Existe
    node -e "try { const p = require('./progresso_pm2.json'); console.log('   Estados processados:', p.estadosProcessados.length); console.log('   Total endereços:', p.totalEnderecos); console.log('   Última atualização:', p.ultimaAtualizacao); } catch(e) { console.log('   Erro ao ler progresso'); }"
) else (
    echo ❌ progresso_pm2.json - Não existe
)

if exist enderecos_pm2.json (
    echo ✅ enderecos_pm2.json - Existe
    node -e "try { const data = require('./enderecos_pm2.json'); console.log('   Endereços salvos:', data.length); } catch(e) { console.log('   Erro ao ler endereços'); }"
) else (
    echo ❌ enderecos_pm2.json - Não existe
)

echo.
pause

@echo off
title GSUNET Worker
echo ========================================
echo    GSUNET Background Worker
echo ========================================
echo.
echo [1/2] Backend dizinine geciliyor ve sanal ortam hazirlaniyor...
cd /d ".\backend\"

echo [2/2] ARQ Worker baslatiliyor...
call venv\Scripts\activate
echo.
echo Worker aktif. Asagidaki isler isleniyor:
echo   - Etkinlik iptal bildirimleri
echo   - Etkinlik hatirlatma bildirimleri
echo   - Gunluk zamanli hatirlatmalar (Saat 09:00)
echo.
echo Durdurmak icin Ctrl+C basin
echo ========================================
python -m app.worker

pause

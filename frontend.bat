@echo off
echo [1/3] Frontend dizinine geciliyor...
cd /d ".\frontend\"

echo [2/3] npm install...
call npm install

echo [3/3] npm run dev...
call npm run dev

pause
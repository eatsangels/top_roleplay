@echo off
REM ============================================================
REM  TOP ROLEPLAY - Arranque completo de la web (Fase 10)
REM  Doble clic aqui para levantar TODO:
REM    1) Servidor web Next.js  -> http://localhost:3000
REM    2) Puente jugadores online (live_server_status)
REM    3) Puente personajes / buscados (live_characters)
REM    4) Puente ranking (live_rankings)
REM  Cada componente abre su propia ventana. Cierra una ventana
REM  para detener solo ese componente. Cierra todas para apagar.
REM ============================================================

cd /d "%~dp0"

echo ============================================================
echo   TOP ROLEPLAY - Levantando la web completa...
echo ============================================================
echo.

REM --- Comprobar que existe node ---
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se encuentra Node.js en el PATH.
  echo         Instala Node 20+ y vuelve a intentarlo.
  echo.
  pause
  exit /b 1
)

REM --- Comprobar que existe .env.local (claves Supabase + SQL) ---
if not exist ".env.local" (
  echo [ERROR] No existe .env.local en %cd%.
  echo         Sin el no hay claves de Supabase ni de SQL Server.
  echo.
  pause
  exit /b 1
)

REM --- Instalar dependencias la primera vez ---
if not exist "node_modules" (
  echo [info] Primera ejecucion: instalando dependencias (npm install)...
  call npm install
  echo.
)

echo Abriendo ventanas (web + 3 puentes de datos)...
echo.

REM 1) Servidor web
start "TOP - WEB (localhost:3000)" cmd /k "npm run dev"

REM 2) Puente de jugadores online (cada 30s)
start "TOP - Puente ONLINE" cmd /k "npm run bridge:online:watch"

REM 3) Puente de personajes / buscados (cada 60s)
start "TOP - Puente PERSONAJES" cmd /k "npm run bridge:characters:watch"

REM 4) Puente de ranking (cada 60s)
start "TOP - Puente RANKING" cmd /k "npm run bridge:ranking:watch"

echo ============================================================
echo   Listo. Se abrieron 4 ventanas.
echo   Abre el navegador en:  http://localhost:3000
echo   Para apagar todo: cierra las 4 ventanas.
echo ============================================================
echo.
echo Esta ventana se puede cerrar.
timeout /t 8 >nul

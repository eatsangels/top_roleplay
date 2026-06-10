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
  echo [info] Primera ejecucion: instalando dependencias [npm install]...
  call npm install
  echo.
)

echo Iniciando todos los servicios en esta misma ventana...
echo Abre el navegador en:  http://localhost:3000
echo.
echo Presiona Ctrl+C en esta ventana para apagar todos los servicios a la vez.
echo ========================================================================
echo.

call npx -y concurrently -n "WEB,ONLINE,CHARS,RANKING" -c "cyan,green,yellow,magenta" "npm run dev" "npm run bridge:online:watch" "npm run bridge:characters:watch" "npm run bridge:ranking:watch"

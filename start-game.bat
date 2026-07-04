@echo off
cd /d "%~dp0"
echo Starting Survivor game server...
echo.
echo Open in browser: http://localhost:8080
echo Press Ctrl+C to stop the server.
echo.

where python >nul 2>&1
if %errorlevel%==0 (
  python -m http.server 8080
  goto :end
)

where py >nul 2>&1
if %errorlevel%==0 (
  py -m http.server 8080
  goto :end
)

where node >nul 2>&1
if %errorlevel%==0 (
  npx --yes serve . -p 8080
  goto :end
)

echo ERROR: Could not find Python or Node.js.
echo Install Python from https://www.python.org/downloads/
echo Or install Node.js from https://nodejs.org/
pause

:end

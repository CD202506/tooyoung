@echo off
setlocal

rem Change to script directory
pushd "%~dp0"

echo [Info] Freeing port 3009 if occupied...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3009') do (
  taskkill /F /PID %%p /T >nul 2>&1
)

echo [Info] Removing .next cache...
if exist ".next" (
  rmdir /S /Q ".next"
)

echo [Info] Starting dev server on port 3009...
set NEXT_PUBLIC_MVP_OPEN=1
npm run dev

popd
endlocal

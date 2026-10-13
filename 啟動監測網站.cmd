@echo off
setlocal
cd /d "%~dp0"
set "MONITORING_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%MONITORING_PYTHON%" (
    "%MONITORING_PYTHON%" scripts\serve_local.py
) else (
    python scripts\serve_local.py
)
if errorlevel 1 pause

@echo off
chcp 65001 >nul
set "ROOT=%~dp0"
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%serve.ps1" "%ROOT%"
ping -n 2 127.0.0.1 >nul
start "" "http://127.0.0.1:8765/"

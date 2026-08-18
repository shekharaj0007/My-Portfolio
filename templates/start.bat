@echo off
title Portfolio Server — Synapse (NEW)
cd /d "%~dp0"
echo.
echo  NEW portfolio: http://127.0.0.1:8080/index.html
echo  (Do NOT open classic.html — that is the old site)
echo.
echo  Press Ctrl+C to stop the server.
echo.
start "" "http://127.0.0.1:8080/index.html"
python -m http.server 8080

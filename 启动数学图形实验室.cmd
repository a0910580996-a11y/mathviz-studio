@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
start "数学图形实验室" http://127.0.0.1:5174
npm run dev -- --port 5174

@echo off
setlocal
cd /d "%~dp0.."
if not exist "data" mkdir "data"
python "generator\daily.py" >> "data\generator.log" 2>&1
exit /b %ERRORLEVEL%

@echo off
title ApeX Cloner - By ApeX Development
color 0D

echo.
echo  ============================================
echo        ApeX Cloner - Discord Server Cloner
echo        By ApeX Development
echo  ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed!
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo  [INFO] Installing dependencies...
    echo.
    npm install --ignore-scripts
    echo.
)

:: Run the application
echo  [INFO] Starting ApeX Cloner...
echo.
node main.js

:: Keep window open on error
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Application exited with an error.
    pause
)

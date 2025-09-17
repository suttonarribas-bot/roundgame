@echo off
REM Miami Vice: Vice Streets - Netlify Deployment Script for Windows
REM This script helps prepare and deploy the game to Netlify

echo 🌴 Miami Vice: Vice Streets - Deployment Script
echo ==============================================

REM Check if Netlify CLI is installed
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Netlify CLI not found. Installing...
    npm install -g netlify-cli
)

REM Check if we're in a git repository
if not exist ".git" (
    echo 📁 Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit: Miami Vice Vice Streets game"
)

REM Check if netlify.toml exists
if not exist "netlify.toml" (
    echo ❌ netlify.toml not found. Please ensure it exists.
    pause
    exit /b 1
)

REM Check if all required files exist
set required_files=index.html styles.css game.js audio.js vehicles.js
for %%f in (%required_files%) do (
    if not exist "%%f" (
        echo ❌ Required file %%f not found.
        pause
        exit /b 1
    )
)

echo ✅ All required files found.

REM Create a simple test to ensure the game loads
echo 🧪 Testing game files...

REM Check if HTML is valid (basic check)
findstr /C:"<!DOCTYPE html>" index.html >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ HTML structure looks good.
) else (
    echo ❌ HTML structure issue detected.
    pause
    exit /b 1
)

echo 🚀 Ready to deploy to Netlify!

REM Ask user if they want to deploy
set /p deploy_choice="Do you want to deploy to Netlify now? (y/n): "
if /i "%deploy_choice%"=="y" (
    echo 🌐 Deploying to Netlify...
    
    REM Deploy to Netlify
    netlify deploy --prod
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Successfully deployed to Netlify!
        echo 🎮 Your game is now live on the web!
        echo 🔗 Check your Netlify dashboard for the live URL.
    ) else (
        echo ❌ Deployment failed. Check the error messages above.
        pause
        exit /b 1
    )
) else (
    echo 📦 Project is ready for deployment.
    echo To deploy manually:
    echo 1. Go to https://netlify.com
    echo 2. Drag and drop this folder
    echo 3. Or use: netlify deploy --prod
)

echo 🎉 Deployment script completed!
pause

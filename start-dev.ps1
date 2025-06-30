#!/usr/bin/env pwsh
# UWS Gaming - Quick Start Development Servers
# This script starts both frontend and backend development servers

Write-Host "UWS Gaming Development Servers" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Blue

# Check if setup has been run
if (-not (Test-Path "apps/frontend/.env.local") -or -not (Test-Path "apps/backend/.env.local")) {
    Write-Host "Environment files not found. Please run setup first:" -ForegroundColor Red
    Write-Host "   .\setup-local-dev.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting Development Servers..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "Database: Cloud SQL (uwsgaming_prod)" -ForegroundColor Cyan

Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Magenta
Write-Host "Admin: admin@uwsgaming.org / admin123" -ForegroundColor Green
Write-Host "User:  user@uwsgaming.org / user123" -ForegroundColor Green

Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in background
Write-Host "Starting backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "apps/backend"
    npm run dev
}

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in foreground
Write-Host "Starting frontend..." -ForegroundColor Yellow
Set-Location "apps/frontend"

# Handle Ctrl+C to cleanup
$cleanup = {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob -PassThru | Remove-Job
    exit
}
[Console]::CancelKeyPress += $cleanup

# Start frontend
npm run dev

#!/usr/bin/env pwsh
# KrakenGaming - Domain Mapping Setup Summary
# ==========================================

Write-Host "✅ CLEANUP COMPLETED!" -ForegroundColor Green
Write-Host "Old services successfully removed:" -ForegroundColor Yellow
Write-Host "- kraken-frontend-prod (DELETED)" -ForegroundColor Red
Write-Host "- kraken-frontend-preview (DELETED)" -ForegroundColor Red
Write-Host "- kraken-backend-prod (DELETED)" -ForegroundColor Red

Write-Host "`n🎯 CURRENT ACTIVE SERVICES:" -ForegroundColor Cyan
Write-Host "Production:" -ForegroundColor Green
Write-Host "- Frontend: krakengaming-frontend" -ForegroundColor White
Write-Host "  URL: https://krakengaming-frontend-7235ln35zq-uc.a.run.app" -ForegroundColor Gray
Write-Host "- Backend: krakengaming-backend" -ForegroundColor White
Write-Host "  URL: https://krakengaming-backend-7235ln35zq-uc.a.run.app" -ForegroundColor Gray

Write-Host "`nPreview:" -ForegroundColor Yellow
Write-Host "- Frontend: krakengaming-frontend-preview" -ForegroundColor White
Write-Host "  URL: https://krakengaming-frontend-preview-7235ln35zq-uc.a.run.app" -ForegroundColor Gray
Write-Host "- Backend: krakengaming-backend-preview" -ForegroundColor White
Write-Host "  URL: https://krakengaming-backend-preview-7235ln35zq-uc.a.run.app" -ForegroundColor Gray

Write-Host "`n📋 NEXT STEPS - DOMAIN MAPPING:" -ForegroundColor Magenta
Write-Host "Go to Google Cloud Console (should be open in browser):" -ForegroundColor White
Write-Host "https://console.cloud.google.com/run/domains?project=kraken-gaming" -ForegroundColor Cyan

Write-Host "`n1. DELETE any existing mappings for:" -ForegroundColor Red
Write-Host "   - krakengaming.org" -ForegroundColor White
Write-Host "   - preview.krakengaming.org" -ForegroundColor White

Write-Host "`n2. CREATE NEW mappings:" -ForegroundColor Green
Write-Host "   Production Domain Mapping:" -ForegroundColor Cyan
Write-Host "   - Click 'ADD MAPPING'" -ForegroundColor Yellow
Write-Host "   - Domain: krakengaming.org" -ForegroundColor White
Write-Host "   - Service: krakengaming-frontend" -ForegroundColor White
Write-Host "   - Region: us-central1" -ForegroundColor White

Write-Host "`n   Preview Domain Mapping:" -ForegroundColor Cyan
Write-Host "   - Click 'ADD MAPPING'" -ForegroundColor Yellow
Write-Host "   - Domain: preview.krakengaming.org" -ForegroundColor White
Write-Host "   - Service: krakengaming-frontend-preview" -ForegroundColor White
Write-Host "   - Region: us-central1" -ForegroundColor White

Write-Host "`n🔑 DISCORD OAUTH FIX:" -ForegroundColor Magenta
Write-Host "After domain mapping is complete:" -ForegroundColor White
Write-Host "1. Go to: https://discord.com/developers/applications" -ForegroundColor Cyan
Write-Host "2. Select your KrakenGaming application" -ForegroundColor White
Write-Host "3. Go to OAuth2 > General" -ForegroundColor White
Write-Host "4. Update Redirect URIs to include:" -ForegroundColor White
Write-Host "   - https://krakengaming.org/api/auth/callback/discord" -ForegroundColor Yellow
Write-Host "   - https://preview.krakengaming.org/api/auth/callback/discord" -ForegroundColor Yellow

Write-Host "`n🧪 TESTING:" -ForegroundColor Blue
Write-Host "After completing the above steps, test:" -ForegroundColor White
Write-Host "1. Visit https://krakengaming.org" -ForegroundColor Cyan
Write-Host "   - Should show the Apply button" -ForegroundColor Green
Write-Host "   - Should allow Discord login" -ForegroundColor Green
Write-Host "2. Visit https://preview.krakengaming.org" -ForegroundColor Cyan
Write-Host "   - Should show preview version" -ForegroundColor Green

Write-Host "`n✨ SUMMARY:" -ForegroundColor Green
Write-Host "- ✅ Redundant services cleaned up" -ForegroundColor Green
Write-Host "- ⏳ Domain mapping needs manual setup (opened in browser)" -ForegroundColor Yellow
Write-Host "- ⏳ Discord OAuth redirect URIs need updating" -ForegroundColor Yellow
Write-Host "- 🎯 After setup: Both issues should be resolved!" -ForegroundColor Green

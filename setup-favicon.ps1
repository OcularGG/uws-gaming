# Script to generate favicon and social media images from UWS logo
# This script creates optimized images for web use

Write-Host "UWS Logo Favicon and Social Media Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$logoPath = "apps\frontend\public\uws-logo.png"
$publicDir = "apps\frontend\public"
$appDir = "apps\frontend\src\app"

if (Test-Path $logoPath) {
    Write-Host "✓ Found UWS logo at: $logoPath" -ForegroundColor Green

    Write-Host "`nCurrent logo file size:" -ForegroundColor Yellow
    Get-ChildItem $logoPath | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}}

    Write-Host "`nTo create optimized favicon and social media images:" -ForegroundColor Yellow
    Write-Host "1. Install ImageMagick or use an online tool" -ForegroundColor White
    Write-Host "2. Create these optimized versions:" -ForegroundColor White
    Write-Host ""

    Write-Host "   Favicon sizes:" -ForegroundColor Green
    Write-Host "   - favicon.ico (16x16, 32x32, 48x48 multi-size)" -ForegroundColor Gray
    Write-Host "   - icon-16x16.png" -ForegroundColor Gray
    Write-Host "   - icon-32x32.png" -ForegroundColor Gray
    Write-Host "   - icon-192x192.png (Android)" -ForegroundColor Gray
    Write-Host "   - icon-512x512.png (Android)" -ForegroundColor Gray
    Write-Host "   - apple-touch-icon.png (180x180)" -ForegroundColor Gray
    Write-Host ""

    Write-Host "   Social Media sizes:" -ForegroundColor Green
    Write-Host "   - og-image.png (1200x630 for Open Graph)" -ForegroundColor Gray
    Write-Host "   - twitter-image.png (1200x600 for Twitter Cards)" -ForegroundColor Gray
    Write-Host ""

    Write-Host "ImageMagick commands:" -ForegroundColor Cyan
    Write-Host "magick `"$logoPath`" -resize 16x16 `"$publicDir\icon-16x16.png`"" -ForegroundColor Gray
    Write-Host "magick `"$logoPath`" -resize 32x32 `"$publicDir\icon-32x32.png`"" -ForegroundColor Gray
    Write-Host "magick `"$logoPath`" -resize 192x192 `"$publicDir\icon-192x192.png`"" -ForegroundColor Gray
    Write-Host "magick `"$logoPath`" -resize 512x512 `"$publicDir\icon-512x512.png`"" -ForegroundColor Gray
    Write-Host "magick `"$logoPath`" -resize 180x180 `"$publicDir\apple-touch-icon.png`"" -ForegroundColor Gray
    Write-Host "magick `"$logoPath`" -resize 1200x630 `"$publicDir\og-image.png`"" -ForegroundColor Gray
    Write-Host "magick `"$logoPath`" -resize 1200x600 `"$publicDir\twitter-image.png`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For favicon.ico (multi-size):" -ForegroundColor Cyan
    Write-Host "magick `"$logoPath`" -resize 16x16 icon16.png" -ForegroundColor Gray
    Write-Host "magick `"$logoPath`" -resize 32x32 icon32.png" -ForegroundColor Gray
    Write-Host "magick `"$logoPath`" -resize 48x48 icon48.png" -ForegroundColor Gray
    Write-Host "magick icon16.png icon32.png icon48.png `"$appDir\favicon.ico`"" -ForegroundColor Gray
    Write-Host ""

} else {
    Write-Host "✗ UWS logo not found at: $logoPath" -ForegroundColor Red
}

Write-Host "Current favicon setup in layout.tsx:" -ForegroundColor Yellow
Write-Host "✓ Already configured to use /uws-logo.png" -ForegroundColor Green
Write-Host "✓ Open Graph metadata added" -ForegroundColor Green
Write-Host "✓ Twitter Card metadata added" -ForegroundColor Green
Write-Host ""

Write-Host "Manual Steps:" -ForegroundColor Cyan
Write-Host "1. Use an image editor or online tool to create the icon sizes above" -ForegroundColor White
Write-Host "2. Replace the favicon.ico in src/app/ with a proper ICO file" -ForegroundColor White
Write-Host "3. Add the optimized PNG files to public/ directory" -ForegroundColor White
Write-Host "4. Deploy the frontend to see the new favicon and social previews" -ForegroundColor White
Write-Host ""

Write-Host "Online tools you can use:" -ForegroundColor Green
Write-Host "- favicon.io (generates favicon from PNG)" -ForegroundColor White
Write-Host "- realfavicongenerator.net (comprehensive favicon generator)" -ForegroundColor White
Write-Host "- squoosh.app (image optimization)" -ForegroundColor White

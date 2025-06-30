# Image Optimization Script for UWS Logo
# Creates properly sized images for social media platforms and favicons

Write-Host "UWS Logo Image Optimization" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$sourceImage = "apps/frontend/public/uws-logo.png"
$publicDir = "apps/frontend/public"

if (-not (Test-Path $sourceImage)) {
    Write-Host "Error: Source image not found at $sourceImage" -ForegroundColor Red
    exit 1
}

Write-Host "Source image: $sourceImage" -ForegroundColor Green
Write-Host "Output directory: $publicDir" -ForegroundColor Green
Write-Host ""

Write-Host "Required image sizes for social media:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Open Graph (Facebook, LinkedIn, Discord embeds):" -ForegroundColor White
Write-Host "   - Primary: 1200x630 (1.91:1 ratio)" -ForegroundColor Gray
Write-Host "   - Minimum: 600x315" -ForegroundColor Gray
Write-Host "   - File: uws-logo-og.png" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Twitter Card:" -ForegroundColor White
Write-Host "   - Large image: 1200x675 (16:9 ratio)" -ForegroundColor Gray
Write-Host "   - Summary: 400x400 (1:1 ratio)" -ForegroundColor Gray
Write-Host "   - File: uws-logo-twitter.png" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Square format (Instagram, profile pics):" -ForegroundColor White
Write-Host "   - Size: 400x400 (1:1 ratio)" -ForegroundColor Gray
Write-Host "   - File: uws-logo-square.png" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Favicon sizes:" -ForegroundColor White
Write-Host "   - 16x16, 32x32, 48x48 (favicon.ico)" -ForegroundColor Gray
Write-Host "   - 180x180 (Apple touch icon)" -ForegroundColor Gray
Write-Host "   - 192x192, 512x512 (Android)" -ForegroundColor Gray
Write-Host ""

Write-Host "MANUAL STEPS REQUIRED:" -ForegroundColor Red
Write-Host "======================" -ForegroundColor Red
Write-Host ""
Write-Host "Since PowerShell cannot directly resize images, please use one of these methods:" -ForegroundColor Yellow
Write-Host ""

Write-Host "Option 1: Online Tools" -ForegroundColor Green
Write-Host "- Go to https://www.canva.com or https://www.figma.com" -ForegroundColor White
Write-Host "- Upload the UWS logo" -ForegroundColor White
Write-Host "- Create designs with these exact dimensions:" -ForegroundColor White
Write-Host "  * 1200x630 for Open Graph (save as uws-logo-og.png)" -ForegroundColor Gray
Write-Host "  * 400x400 for square format (save as uws-logo-square.png)" -ForegroundColor Gray
Write-Host "  * 1200x675 for Twitter (save as uws-logo-twitter.png)" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Using ImageMagick (if installed)" -ForegroundColor Green
Write-Host "magick $sourceImage -resize 1200x630! $publicDir/uws-logo-og.png" -ForegroundColor Gray
Write-Host "magick $sourceImage -resize 400x400! $publicDir/uws-logo-square.png" -ForegroundColor Gray
Write-Host "magick $sourceImage -resize 1200x675! $publicDir/uws-logo-twitter.png" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 3: Using GIMP or Photoshop" -ForegroundColor Green
Write-Host "- Open the UWS logo" -ForegroundColor White
Write-Host "- Resize to each dimension" -ForegroundColor White
Write-Host "- Export as PNG files with the specified names" -ForegroundColor White
Write-Host ""

Write-Host "IMPORTANT TIPS FOR SOCIAL MEDIA:" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Open Graph (1200x630):" -ForegroundColor Yellow
Write-Host "   - Keep important content in center 1200x600 area" -ForegroundColor White
Write-Host "   - Avoid text near edges (15px safe zone)" -ForegroundColor White
Write-Host "   - Use high contrast for readability" -ForegroundColor White
Write-Host ""

Write-Host "2. Square format (400x400):" -ForegroundColor Yellow
Write-Host "   - Center the logo" -ForegroundColor White
Write-Host "   - Add padding if needed" -ForegroundColor White
Write-Host "   - Ensure logo is clearly visible at small sizes" -ForegroundColor White
Write-Host ""

Write-Host "3. Background considerations:" -ForegroundColor Yellow
Write-Host "   - Use transparent background or solid color" -ForegroundColor White
Write-Host "   - Ensure logo stands out on both light and dark themes" -ForegroundColor White
Write-Host "   - Test how it looks in Discord, Facebook, Twitter previews" -ForegroundColor White
Write-Host ""

Write-Host "After creating the images, place them in:" -ForegroundColor Cyan
Write-Host "$publicDir/" -ForegroundColor White
Write-Host ""
Write-Host "Then redeploy the frontend to see the changes!" -ForegroundColor Green

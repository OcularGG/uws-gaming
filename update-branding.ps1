#!/usr/bin/env pwsh
# UWS Gaming Branding Update Script - Updates all references from KrakenGaming to UWS Gaming

Write-Host "🎨 Updating branding from KrakenGaming to UWS Gaming..." -ForegroundColor Cyan

# Configuration
$replacements = @{
    # Basic branding
    "KrakenGaming" = "UWS Gaming"
    "Kraken Gaming" = "UWS Gaming"

    # Domains
    "krakengaming.org" = "uwsgaming.org"
    "preview.krakengaming.org" = "uwsgaming.org"
    "bugs.krakengaming.org" = "uwsgaming.org"

    # Package names
    "@krakengaming/" = "@uwsgaming/"

    # Database names
    "krakengaming_dev" = "uwsgaming_dev"
    "krakengaming_prod" = "uwsgaming_prod"

    # Email addresses
    "admin@krakengaming.org" = "admin@uwsgaming.org"

    # Project and site names (case sensitive, most specific first)
    "kraken-gaming" = "uws-gaming"
    "krakengaming" = "uwsgaming"
    "KRAKEN" = "UWS"
    "Kraken" = "UWS"
}

# Files to exclude from replacement
$excludePatterns = @(
    "*.git*",
    "*node_modules*",
    "*.next*",
    "*dist*",
    "*build*",
    "*backup*",
    "migrate-to-uws.ps1",
    "update-branding.ps1"
)

# Get all text files (excluding binaries and build artifacts)
$textExtensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.json", "*.md", "*.yml", "*.yaml", "*.css", "*.html", "*.txt", "*.env*", "*.ps1", "*.sh")

Write-Host "📁 Scanning for files to update..." -ForegroundColor Yellow

$allFiles = @()
foreach ($ext in $textExtensions) {
    $files = Get-ChildItem -Recurse -Include $ext | Where-Object {
        $file = $_
        $shouldExclude = $false
        foreach ($pattern in $excludePatterns) {
            if ($file.FullName -like "*$pattern*") {
                $shouldExclude = $true
                break
            }
        }
        -not $shouldExclude
    }
    $allFiles += $files
}

Write-Host "Found $($allFiles.Count) files to process" -ForegroundColor White

$updatedFiles = 0
$totalReplacements = 0

foreach ($file in $allFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $fileReplacements = 0

        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            if ($content -match [regex]::Escape($old)) {
                $content = $content -replace [regex]::Escape($old), $new
                $replaceMatches = [regex]::Matches($originalContent, [regex]::Escape($old))
                $fileReplacements += $replaceMatches.Count
            }
        }

        if ($fileReplacements -gt 0) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "  ✅ Updated: $($file.Name) ($fileReplacements replacements)" -ForegroundColor Green
            $updatedFiles++
            $totalReplacements += $fileReplacements
        }
    } catch {
        Write-Host "  ⚠️  Skipped: $($file.Name) (binary or locked)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Branding update complete!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Files updated: $updatedFiles" -ForegroundColor White
Write-Host "  Total replacements: $totalReplacements" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Review package.json files for any missed references" -ForegroundColor White
Write-Host "2. Update README.md with new project information" -ForegroundColor White
Write-Host "3. Check environment files (.env*) for any hardcoded values" -ForegroundColor White
Write-Host "4. Test the application locally" -ForegroundColor White

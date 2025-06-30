# Complete Database Credential Reset Process
# This script orchestrates the complete database credential reset

param(
    [bool]$BackupFirst = $true,
    [bool]$TestAfter = $true,
    [string]$ProjectId = "uws-gaming"
)

function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Color,
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    $colorMap = @{
        'Red' = 'Red'
        'Green' = 'Green'
        'Yellow' = 'Yellow'
        'Blue' = 'Blue'
        'Cyan' = 'Cyan'
        'Magenta' = 'Magenta'
        'White' = 'White'
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

Write-ColorOutput Cyan "🚀 Starting Complete Database Credential Reset Process..."
Write-ColorOutput Yellow "Project: $ProjectId"

# Step 1: Backup current credentials
if ($BackupFirst) {
    Write-ColorOutput Cyan "📦 Step 1: Backing up current credentials..."
    try {
        & ".\backup-database-credentials.ps1" -ProjectId $ProjectId
        Write-ColorOutput Green "✅ Backup completed successfully"
    } catch {
        Write-ColorOutput Red "❌ Backup failed: $($_.Exception.Message)"
        Write-ColorOutput Yellow "⚠️  Continuing with reset (backup recommended but not required)..."
    }
    Write-Host ""
}

# Step 2: Reset credentials
Write-ColorOutput Cyan "🔄 Step 2: Resetting database credentials..."
try {
    & ".\reset-database-credentials.ps1" -ProjectId $ProjectId
    Write-ColorOutput Green "✅ Credential reset completed successfully"
} catch {
    Write-ColorOutput Red "❌ Credential reset failed: $($_.Exception.Message)"
    exit 1
}
Write-Host ""

# Step 3: Test connections
if ($TestAfter) {
    Write-ColorOutput Cyan "🧪 Step 3: Testing database connections..."
    
    Write-ColorOutput Yellow "Testing local connection..."
    try {
        & ".\test-database-connection.ps1" -Local
        Write-ColorOutput Green "✅ Local connection test completed"
    } catch {
        Write-ColorOutput Red "❌ Local connection test failed: $($_.Exception.Message)"
    }
    
    Write-Host ""
    
    Write-ColorOutput Yellow "Testing production connection..."
    try {
        & ".\test-database-connection.ps1" -Production
        Write-ColorOutput Green "✅ Production connection test completed"
    } catch {
        Write-ColorOutput Red "❌ Production connection test failed: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-ColorOutput Green "🎉 Database credential reset process completed!"
Write-ColorOutput Cyan "📋 Next steps:"
Write-ColorOutput Yellow "  1. Verify both local and production connections work"
Write-ColorOutput Yellow "  2. Redeploy your Cloud Run services to pick up new secrets:"
Write-ColorOutput Yellow "     - gcloud run deploy krakengaming-frontend --region=us-central1"
Write-ColorOutput Yellow "     - gcloud run deploy krakengaming-backend --region=us-central1"
Write-ColorOutput Yellow "  3. Test your applications thoroughly"
Write-ColorOutput Yellow "  4. Run database migrations if needed"

Write-ColorOutput Green "✨ Your database credentials have been securely reset and configured!"

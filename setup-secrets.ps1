# Setup Google Cloud Secrets for# Database URL
$DATABASE_URL = Read-Host "Enter DATABASE_URL (PostgreSQL connection string)"
New-Secret "database-url" $DATABASE_URL

# Discord Bot Token
$DISCORD_TOKEN = Read-Host "Enter DISCORD_TOKEN"
New-Secret "discord-bot-token" $DISCORD_TOKEN

# Discord Client ID
$DISCORD_CLIENT_ID = Read-Host "Enter DISCORD_CLIENT_ID"
New-Secret "discord-client-id" $DISCORD_CLIENT_ID

# Discord Client Secret
$DISCORD_CLIENT_SECRET = Read-Host "Enter DISCORD_CLIENT_SECRET"
New-Secret "discord-client-secret" $DISCORD_CLIENT_SECRET

# NextAuth Secret
$NEXTAUTH_SECRET = Read-Host "Enter NEXTAUTH_SECRET (random 32+ character string)"
New-Secret "nextauth-secret" $NEXTAUTH_SECRET-Host "Setting up Google Cloud Secrets for KrakenGaming..." -ForegroundColor Green

$PROJECT_ID = "kraken-gaming"

# Function to create secret if it doesn't exist
function New-Secret {
    param($SecretName, $SecretValue)

    # Check if secret exists
    gcloud secrets describe $SecretName --project=$PROJECT_ID 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Secret $SecretName already exists, updating..." -ForegroundColor Yellow
        Write-Output $SecretValue | gcloud secrets versions add $SecretName --data-file=- --project=$PROJECT_ID
    } else {
        Write-Host "Creating secret $SecretName..." -ForegroundColor Yellow
        Write-Output $SecretValue | gcloud secrets create $SecretName --data-file=- --project=$PROJECT_ID
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Success: $SecretName" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed: $SecretName" -ForegroundColor Red
    }
}

# Set the project
gcloud config set project $PROJECT_ID

# Create the secrets (you'll need to replace these with actual values)
Write-Host "Please provide values for the following secrets:" -ForegroundColor Cyan

# Database URL
$DATABASE_URL = Read-Host "Enter DATABASE_URL (PostgreSQL connection string)"
Create-Secret "database-url" $DATABASE_URL

# Discord Bot Token
$DISCORD_TOKEN = Read-Host "Enter DISCORD_TOKEN"
Create-Secret "discord-bot-token" $DISCORD_TOKEN

# Discord Client ID
$DISCORD_CLIENT_ID = Read-Host "Enter DISCORD_CLIENT_ID"
Create-Secret "discord-client-id" $DISCORD_CLIENT_ID

# Discord Client Secret
$DISCORD_CLIENT_SECRET = Read-Host "Enter DISCORD_CLIENT_SECRET"
Create-Secret "discord-client-secret" $DISCORD_CLIENT_SECRET

# NextAuth Secret
$NEXTAUTH_SECRET = Read-Host "Enter NEXTAUTH_SECRET (random 32+ character string)"
Create-Secret "nextauth-secret" $NEXTAUTH_SECRET

Write-Host "🎉 All secrets have been created!" -ForegroundColor Green
Write-Host "You can now run the deployment script." -ForegroundColor Cyan

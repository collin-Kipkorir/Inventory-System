#!/usr/bin/env pwsh
# Setup Firebase credentials

Write-Host "=" * 70
Write-Host "Firebase Service Account Setup" -ForegroundColor Cyan
Write-Host "=" * 70

$backendDir = "$PSScriptRoot\backend"
$credFile = "$backendDir\firebase-service-account.json"

Write-Host @"

This script will help you set up Firebase credentials for the Pact Inventory backend.

REQUIREMENTS:
1. Service account JSON file from Firebase Console
2. Admin access to Firebase project 'betca-inventory'

STEPS:
1. Open: https://console.firebase.google.com
2. Select: betca-inventory project
3. Go to: Settings ⚙️ → Service Accounts
4. Click: Generate New Private Key
5. A JSON file will download
6. When prompted, paste the path to that file

"@

$jsonPath = Read-Host "Enter path to firebase-service-account.json (or paste file contents)"

if (Test-Path $jsonPath) {
    # It's a file path
    Write-Host "`n📁 Found file at: $jsonPath" -ForegroundColor Yellow
    
    # Validate JSON
    try {
        $json = Get-Content $jsonPath | ConvertFrom-Json
        Write-Host "✅ Valid JSON format" -ForegroundColor Green
        
        # Copy to backend folder
        Copy-Item $jsonPath $credFile -Force
        Write-Host "✅ Copied to: $credFile" -ForegroundColor Green
    } catch {
        Write-Host "❌ Invalid JSON: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    # Assume it's JSON content
    try {
        $json = $jsonPath | ConvertFrom-Json
        Write-Host "✅ Valid JSON format" -ForegroundColor Green
        
        # Save to file
        $jsonPath | Out-File $credFile -Force
        Write-Host "✅ Saved to: $credFile" -ForegroundColor Green
    } catch {
        Write-Host "❌ Invalid input: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Set environment variable
Write-Host "`n🔧 Setting environment variable..." -ForegroundColor Yellow
$env:GOOGLE_APPLICATION_CREDENTIALS = $credFile
Write-Host "✅ Set GOOGLE_APPLICATION_CREDENTIALS=$credFile" -ForegroundColor Green

Write-Host @"

✨ Setup complete!

Next steps:
1. Start the backend:
   cd backend
   npm run dev

2. You should see:
   ✨ Backend listening on http://localhost:4000
   📡 Firebase RTDB

3. Test the API:
   $backendDir\..\test-api.ps1

"@ -ForegroundColor Green

Write-Host "=" * 70

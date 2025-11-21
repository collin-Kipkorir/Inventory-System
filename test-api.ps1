#!/usr/bin/env pwsh
# Quick test script for Pact Inventory backend

Write-Host "=" * 60
Write-Host "Pact Inventory - API Test Script" -ForegroundColor Cyan
Write-Host "=" * 60

$backend = "http://localhost:4000"

# Test health endpoint
Write-Host "`n🔍 Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backend/api/health" -Method GET -ErrorAction Stop
    $content = $response.Content | ConvertFrom-Json
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "Response: $($content | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not running at $backend" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test GET companies (empty by default)
Write-Host "`n🔍 Testing GET /api/companies..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backend/api/companies" -Method GET -ErrorAction Stop
    $companies = $response.Content | ConvertFrom-Json
    Write-Host "✅ Companies endpoint works!" -ForegroundColor Green
    Write-Host "Response: $($companies | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST company
Write-Host "`n🔍 Testing POST /api/companies..." -ForegroundColor Yellow
try {
    $body = @{
        name = "Test Company"
        email = "test@example.com"
        phone = "555-1234"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backend/api/companies" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Created company successfully!" -ForegroundColor Green
    Write-Host "ID: $($result.id)" -ForegroundColor Gray
    Write-Host "Response: $($result | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "=" * 60
Write-Host "Testing complete!" -ForegroundColor Cyan
Write-Host "=" * 60

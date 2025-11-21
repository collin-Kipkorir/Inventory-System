# Quick test script for LPO creation API

Write-Host "Testing LPO Creation API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "1. Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method Get
    Write-Host "✓ Backend is running" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "✗ Backend is NOT running" -ForegroundColor Red
    Write-Host "Please start backend with: cd backend && npm run dev"
    exit 1
}
Write-Host ""

# Test 2: Get existing LPOs
Write-Host "2. Fetching existing LPOs..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/lpos" -Method Get
    $lpos = $response.Content | ConvertFrom-Json
    Write-Host "Found $($lpos.Count) LPOs" -ForegroundColor Green
    if ($lpos.Count -gt 0) {
        $lpos | ForEach-Object {
            Write-Host "  - LPO: $($_.lpoNumber) | Company: $($_.companyName)" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "✗ Failed to fetch LPOs: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create a test LPO
Write-Host "3. Creating test LPO..." -ForegroundColor Yellow
$testLPO = @{
    companyId = "test-company-$(Get-Random)"
    companyName = "Test Company $(Get-Date -Format 'HH:mm:ss')"
    items = @(@{
        productId = "p1"
        productName = "Product 1"
        quantity = 1
        unit = "pcs"
        unitPrice = 100
        total = 100
    })
    subtotal = 100
    vat = 16
    totalAmount = 116
    date = (Get-Date -Format "yyyy-MM-dd")
    status = "pending"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/lpos" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body $testLPO
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✓ LPO Created Successfully!" -ForegroundColor Green
    Write-Host "  LPO Number: $($result.lpoNumber)" -ForegroundColor Cyan
    Write-Host "  ID: $($result.id)" -ForegroundColor Cyan
    Write-Host "  Company: $($result.companyName)" -ForegroundColor Cyan
    Write-Host "  Total Amount: $($result.totalAmount)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed to create LPO: $_" -ForegroundColor Red
    Write-Host $_.Exception.Response.Content
}
Write-Host ""

# Test 4: Fetch LPOs again to see if number is stored
Write-Host "4. Fetching LPOs after creation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/lpos" -Method Get
    $lpos = $response.Content | ConvertFrom-Json
    Write-Host "✓ Found $($lpos.Count) LPOs" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "LPOs with Numbers:" -ForegroundColor Cyan
    $lpos | ForEach-Object {
        if ($_.lpoNumber) {
            Write-Host "  ✓ $($_.lpoNumber) - $($_.companyName) - KES $($_.totalAmount)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ NO NUMBER - $($_.companyName) - KES $($_.totalAmount)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ Failed to fetch LPOs: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test Complete!" -ForegroundColor Green

#!/bin/bash
# Quick test script for LPO creation

echo "Testing LPO Creation API..."
echo

# Test 1: Check if backend is running
echo "1. Testing backend health..."
curl -s http://localhost:4000/api/health
echo
echo

# Test 2: Get existing LPOs
echo "2. Fetching existing LPOs..."
curl -s http://localhost:4000/api/lpos | jq '.'
echo
echo

# Test 3: Create a test LPO
echo "3. Creating test LPO..."
curl -s -X POST http://localhost:4000/api/lpos \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "test-company",
    "companyName": "Test Company",
    "items": [{"productId": "p1", "productName": "Product 1", "quantity": 1, "unit": "pcs", "unitPrice": 100, "total": 100}],
    "subtotal": 100,
    "vat": 16,
    "totalAmount": 116,
    "date": "2025-11-14",
    "status": "pending"
  }' | jq '.'
echo
echo

# Test 4: Fetch LPOs again to see if number is stored
echo "4. Fetching LPOs after creation..."
curl -s http://localhost:4000/api/lpos | jq '.[] | {id, lpoNumber, companyName}'

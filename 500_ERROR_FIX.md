# 🆘 Fix: "500 Internal Server Error" on API Calls

## The Error
```
GET http://localhost:8080/api/companies 500 (Internal Server Error)
Error: API call failed: API error: 500
```

## Root Cause
**Backend is not running!**

When you see this error, it means:
- Frontend tried to call backend API
- Backend didn't respond (not running)
- Vite proxy couldn't reach port 4000
- Result: 500 error

## Quick Fix (30 seconds)

### Step 1: Open Terminal
Go to your project root:
```
d:\Typescrips Vscode Projects\sms-inventory\pact-inventory\
```

### Step 2: Start Backend FIRST
```powershell
cd backend
npm run dev
```

**Wait for these messages**:
```
📂 Found firebase-service-account.json
✨ Firebase initialized successfully
✨ Backend listening on http://localhost:4000
📡 Firebase RTDB
```

**Don't close this terminal!** Keep it open while using the app.

### Step 3: Open New Terminal
In VS Code: `Ctrl + Shift + backtick` or click + icon in terminal panel

### Step 4: Start Frontend
```powershell
npm run dev
```

**Wait for**:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:8080/
```

### Step 5: Try Again
- Go to http://localhost:8080
- Should work now! ✅

## Why This Happens

### Architecture
```
Browser (8080)
    ↓
Frontend (React)
    ↓
Vite Dev Server (tries to proxy /api)
    ↓
Backend (4000)
    ↓
Firebase

If backend not running:
    ↓ (tries to reach port 4000)
    ✗ (fails)
    ↓
Return 500 error to browser
```

## Verification

### Test Backend is Running
```powershell
curl http://localhost:4000/api/health
```

**Should return**: `{"ok":true}`

If not working:
1. Make sure you ran `npm run dev` in backend folder
2. Make sure backend terminal still shows "listening"
3. Check if port 4000 is blocked

### Port Already in Use?
```powershell
netstat -ano | findstr :4000
```

If something is running:
```powershell
taskkill /PID <PID> /F
npm run dev
```

## Common Mistakes

❌ **Starting frontend first**
```powershell
npm run dev  # WRONG - backend not running yet!
```

✅ **Start backend first**
```powershell
cd backend
npm run dev  # RIGHT - start backend first

# Then in new terminal
cd ..
npm run dev  # Then start frontend
```

❌ **Closing backend terminal**
```powershell
# Terminal 1: Backend
npm run dev
# (closes terminal)
# Now frontend gets 500 errors!
```

✅ **Keep backend terminal open**
```powershell
# Terminal 1: Backend
npm run dev
# (keep open forever - backend keeps running)

# Terminal 2: Frontend
npm run dev
# (keep open forever - frontend keeps running)
```

## Checklist

- [ ] Backend terminal is open
- [ ] Backend shows "listening on http://localhost:4000"
- [ ] Backend terminal NOT closed
- [ ] Frontend terminal is open
- [ ] Frontend shows "Local: http://localhost:8080"
- [ ] Browser shows http://localhost:8080
- [ ] No 500 errors in browser
- [ ] Can see data in the app

All checked? ✅ You're good to go!

## If Still Not Working

### 1. Clear Cache
```powershell
# Ctrl+Shift+Delete in browser
# Then go to http://localhost:8080
```

### 2. Hard Refresh
```
Ctrl + Shift + R
```

### 3. Check Logs
- Backend terminal: Look for error messages
- Browser console (F12): Look for error messages

### 4. Restart Everything
```powershell
# Terminal 1
Ctrl + C  # Stop backend

# Clear
npm run dev  # Start backend again

# Terminal 2
Ctrl + C  # Stop frontend

# Clear
npm run dev  # Start frontend again

# Browser: Hard refresh (Ctrl+Shift+R)
```

### 5. Still Broken?
Check these files for more help:
- `QUICK_START.md` - Detailed startup guide
- `LPO_NUMBER_FIX.md` - If specific to LPO numbers
- `ISSUE_FIXED.md` - If related to number generation

## Summary

| Issue | Fix |
|-------|-----|
| 500 error | Start backend: `cd backend && npm run dev` |
| Port in use | Kill process: `taskkill /PID <PID> /F` |
| Backend closed | Terminal 1 should stay open |
| Frontend won't load | Hard refresh: `Ctrl+Shift+R` |
| Both not running | Restart both in order: backend first, then frontend |

---

**The key: Backend must be running before you use the app!**

One terminal for backend, one terminal for frontend. Keep both open.

Done! 🎉

# Firebase Credentials Setup Guide

## Step 1: Get Service Account JSON from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the **`betca-inventory`** project
3. Click **⚙️ Settings** (gear icon) → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file will download automatically

## Step 2: Place Credentials in Backend Folder

1. Save the downloaded JSON file as:
   ```
   backend/firebase-service-account.json
   ```

2. The file should look like (don't share this publicly!):
   ```json
   {
     "type": "service_account",
     "project_id": "betca-inventory",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "firebase-adminsdk-xxx@betca-inventory.iam.gserviceaccount.com",
     ...
   }
   ```

## Step 3: Set Environment Variable

### Windows PowerShell:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "d:\Typescrips Vscode Projects\sms-inventory\pact-inventory\backend\firebase-service-account.json"
```

### Or add to backend/.env:
```env
GOOGLE_APPLICATION_CREDENTIALS=backend/firebase-service-account.json
```

## Step 4: Restart Backend

```powershell
cd backend
npm run dev
```

You should see:
```
✨ Backend listening on http://localhost:4000
📡 Firebase RTDB
```

## Testing

Once running, test the API:
- **Health check**: http://localhost:4000/api/health
- **Get companies**: http://localhost:4000/api/companies
- **Create company**: POST to http://localhost:4000/api/companies with JSON body

## What's Next?

- Frontend is running on http://localhost:8080
- Backend is running on http://localhost:4000
- `/api/*` requests are automatically proxied to the backend
- All data will be stored in Firebase Realtime Database

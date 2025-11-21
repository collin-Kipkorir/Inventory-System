# PWA Quick Start Guide

## What is PWA?
A **Progressive Web App (PWA)** lets users install your app directly from the browser, just like a native mobile app, but it works on desktop, tablet, and phone.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Build the App
```powershell
npm run build
```

### Step 3: Preview
```powershell
npm run preview
```

Open: **http://localhost:4173**

### Step 4: Install App
Look for the **"Install App"** button in the top-right corner and click it!

---

## 📱 Installation on Different Devices

### Windows/Mac/Linux Desktop
1. Open app in Chrome, Edge, or Safari
2. Click "Install App" button
3. App launches in standalone window
4. Creates shortcut on desktop

### iPhone/iPad
1. Open in Safari
2. Tap share button (↗️)
3. Tap "Add to Home Screen"
4. Name it and tap "Add"
5. Opens in fullscreen like native app

### Android Phone
1. Open in Chrome
2. Tap menu (⋮)
3. Tap "Install app"
4. Confirm
5. App appears on home screen

---

## ✨ Features Now Available

✅ **Install Like Native App**
- No app store needed
- Works offline
- 100 MB cached locally

✅ **Works Offline**
- View cached invoices
- Check dashboard
- Browse companies
- (Create new records when online)

✅ **Push Notifications** (optional)
- Payment reminders
- Invoice notifications
- Status updates

✅ **Automatic Updates**
- App auto-updates when online
- No manual update needed
- Always latest version

---

## 🔌 Offline Capabilities

### What Works Offline
- Dashboard (cached data)
- Invoices (view history)
- Companies (cached list)
- Products (cached data)
- Payments (view history)

### What Needs Internet
- Create invoices
- Create payments
- Create LPOs
- Upload files
- Changes sync when online

---

## 🛠️ Add to Your App Layout

Add this to your main layout (e.g., Header/Sidebar):

```tsx
import { PWAInstallButton } from '@/components/PWAInstallButton';

export function Header() {
  return (
    <header>
      <h1>Pact Inventory</h1>
      <PWAInstallButton /> {/* Add this line */}
    </header>
  );
}
```

---

## 🧪 Test Offline Mode

### Using Chrome DevTools
1. Press **F12** to open DevTools
2. Go to **Application** tab
3. Click **Service Workers** (left sidebar)
4. Check the **Offline** checkbox
5. Reload the page
6. App should still work! ✅

### Disable Offline Testing
1. Uncheck the **Offline** checkbox
2. Reload page
3. Back to normal mode

---

## 📊 Before & After

### Before PWA
- Must visit website in browser each time
- No offline access
- Full page reload needed
- Takes up browser tab
- Users forget about it

### After PWA
- ✅ Install like native app
- ✅ Works offline
- ✅ Instant startup
- ✅ Dedicated app window
- ✅ Home screen icon
- ✅ Share shortcut
- ✅ Pinned start menu

---

## 🎯 Next Steps

1. **Add Icons** (required for install)
   - Add `icon-192.png` to `/public/`
   - Add `icon-512.png` to `/public/`
   - Use online tool: https://www.pwabuilder.com/imageGenerator

2. **Add Install Button to Layout**
   - Import `PWAInstallButton` component
   - Add to header/navbar

3. **Test Installation**
   - Build app
   - Preview
   - Click install button
   - Verify app launches

4. **Deploy to Production**
   - App must be on HTTPS
   - Then PWA features fully enabled

---

## ⚠️ Requirements

### For Installation to Work
- ✅ App served over HTTPS (or localhost)
- ✅ `manifest.json` exists and valid
- ✅ Service Worker registered
- ✅ Supported browser (Chrome, Edge, Safari, Firefox)
- ✅ Icons exist in `/public/`

### Browser Support
| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ Yes | ✅ Yes |
| Edge | ✅ Yes | ✅ Yes |
| Safari | ✅ Yes | ✅ Yes |
| Firefox | ✅ Yes | ✅ Yes |

---

## 🆘 Troubleshooting

### Install Button Not Showing?
1. Make sure app is on HTTPS (or localhost)
2. Check manifest.json loads: Open DevTools → Network
3. Look for `manifest.json` - should be 200 OK

### App Won't Install?
1. Clear browser cache
2. Close all app windows
3. Try again
4. Check DevTools console for errors

### Offline Mode Not Working?
1. Open DevTools
2. Go to Application → Service Workers
3. Should show registered service worker
4. Check Cache Storage for cached data

---

## 📚 Learn More

- Full documentation: `PWA_IMPLEMENTATION.md`
- Service Worker docs: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Web App Manifest: https://web.dev/add-manifest/
- PWA Checklist: https://web.dev/pwa-checklist/

---

## 🎉 That's It!

You now have a fully functional PWA that:
- ✅ Installs like a native app
- ✅ Works offline
- ✅ Uses less data
- ✅ Updates automatically
- ✅ Works on all devices

**Ready to install? Click the "Install App" button!** 🚀

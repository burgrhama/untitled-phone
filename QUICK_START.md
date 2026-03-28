# Quick Start - 5 Minutes

## For Your GitHub Pages Setup

### Backend URL
Update `auth.js` line 2 with your Render backend URL:

```javascript
const API_BASE_URL = 'https://YOUR-BACKEND-URL.onrender.com';
```

### Example Flow

1. **User opens phone browser**
   - URL: `https://burgrhama.github.io/untitled-phone/`

2. **User sees login screen**
   - Frontend loads from GitHub Pages

3. **User enters email & password, clicks Sign Up**
   - Frontend sends to: `https://your-backend-url.onrender.com/api/signup`
   - Backend creates account in SQLite
   - Returns JWT token
   - Frontend saves token to localStorage

4. **User on different device logs in**
   - Frontend sends to same URL: `https://your-backend-url.onrender.com/api/login`
   - Backend checks SQLite database
   - Returns JWT token
   - App unlocks

5. **User creates album**
   - Album stored in IndexedDB (client-side, device-specific)
   - Can be accessed on same phone

---

## Architecture for Your Use Case

```
Desktop Browser              Mobile Browser
      ↓                            ↓
https://burgrhama.github.io/untitled-phone/
      ↓                            ↓
      └────────────┬───────────────┘
                   ↓
        Same Backend API
      (https://your-url.onrender.com)
                   ↓
             SQLite Database
         (Same user account!)
```

---

## What Gets Synced Across Devices

✓ **Email & Password** (in backend database)
✓ **Authentication** (JWT tokens)
✓ **User Account** (stays same across devices)

✗ **Albums** (stored locally on each device in IndexedDB)
✗ **Music Tracks** (local to device)

To sync albums, you'd need to add cloud storage (future feature).

---

## Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] `auth.js` updated with API_BASE_URL
- [ ] Frontend pushed to GitHub Pages
- [ ] GitHub Pages enabled in repo settings
- [ ] Open site and test signup/login

---

## Testing Commands (Local)

```bash
# Signup test
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","confirmPassword":"test123"}'

# Login test
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## After Deployment

Your users will be able to:
1. Sign up on any device
2. Login with same account on other devices
3. Manage music albums locally on each device

All accounts stored in Render database ✓

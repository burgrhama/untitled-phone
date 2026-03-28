# Setup Guide: GitHub Pages + Render Backend

## Overview
- **Frontend**: GitHub Pages (static site)
- **Backend**: Render (free Node.js hosting)
- **Database**: SQLite on Render

---

## Part 1: Deploy Backend to Render

### 1.1 Create a new GitHub repository for the backend

Push all files (except node_modules) to a GitHub repo:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/burgrhama/untitled-phone-api
git push -u origin main
```

**Push these files to GitHub:**
- `server.js`
- `package.json`
- `.gitignore`

**Don't push:**
- `node_modules/`
- `users.db`
- `index.html`, `auth.js`, etc. (keep in separate frontend repo)

### 1.2 Deploy to Render

1. Go to https://render.com
2. Sign up with GitHub account
3. Click **New +** → **Web Service**
4. Select your GitHub repo
5. Fill in these settings:
   - **Name**: `untitled-phone-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Region**: Choose closest to you
6. Click **Environment** tab, add variable:
   - Key: `SECRET_KEY`
   - Value: `your-secure-random-string-here` (any random string)
7. Click **Create Web Service**
8. Wait 5-10 minutes for deployment
9. Copy your service URL (e.g., `https://untitled-phone-api.onrender.com`)

### 1.3 Update Frontend with Backend URL

Edit `auth.js` line 2:
```javascript
const API_BASE_URL = 'https://untitled-phone-api.onrender.com';
```

Replace with your actual Render URL.

---

## Part 2: Deploy Frontend to GitHub Pages

### 2.1 Create frontend repository

Create a new repo: `untitled-phone`

Push frontend files:
- `index.html`
- `auth.js`
- `script.js`
- `service-worker.js`
- `manifest.json`
- `icon-192.png`
- `icon-512.png`

(Don't push `server.js` or `package.json`)

### 2.2 Enable GitHub Pages

1. Go to repo **Settings**
2. Click **Pages** (left sidebar)
3. Under "Build and deployment":
   - Source: `Deploy from a branch`
   - Branch: `main` / `root`
4. Click **Save**
5. Your site will be at: `https://burgrhama.github.io/untitled-phone/`

---

## Part 3: Test Everything

### Local Testing (Before deployment)

```bash
# Terminal 1: Start backend
cd /path/to/backend
node server.js

# Terminal 2: Open in browser
http://localhost:3000
```

### After Deployment

1. Open https://burgrhama.github.io/untitled-phone/
2. Signup with any email/password
3. Login on another device with same email/password

---

## Troubleshooting

### "Network error. Please try again"

**Issue**: Frontend can't reach backend API

**Fix**:
1. Check `auth.js` line 2 has correct `API_BASE_URL`
2. Open browser DevTools (F12) → Console
3. Try login and check error message
4. Verify Render service is running: https://render.com/dashboard
5. Check CORS is configured in `server.js`

### "Email already registered"

**Expected**: You signed up with that email before. Use different email or try login instead.

### Database errors on Render

**Note**: Render restarts services periodically, which resets SQLite database.

**For production**: Use PostgreSQL instead (Render provides free PostgreSQL):
- In Render dashboard, create PostgreSQL database
- Update `server.js` to use PostgreSQL (requires code changes)

---

## Architecture

```
User's Phone/Browser
      ↓
GitHub Pages (Frontend)
  https://burgrhama.github.io/untitled-phone/
      ↓ (HTTPS requests)
      ↓
Render Server (Backend)
  https://untitled-phone-api.onrender.com
      ↓
SQLite Database (users.db)
```

---

## File Organization

**Backend repo** (`untitled-phone-api`):
```
server.js
package.json
.gitignore
users.db (auto-created)
```

**Frontend repo** (`untitled-phone`):
```
index.html
auth.js (with API_BASE_URL)
script.js
service-worker.js
manifest.json
icon-192.png
icon-512.png
```

---

## Next Steps

- Add password reset functionality
- Use PostgreSQL instead of SQLite for persistence
- Add user profile management
- Deploy frontend to custom domain

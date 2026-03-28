# Deploy Everything to One Server

Your app is now a single Node.js server that serves both frontend and backend.

## Deploy to Render

### Step 1: Create GitHub Repo
```bash
cd path/to/your/app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/burgrhama/untitled-phone
git push -u origin main
```

**Push these files:**
- `server.js`
- `index.html`
- `package.json`
- `manifest.json`
- `icon-192.png`
- `icon-512.png`
- `service-worker.js`

**Don't push:**
- `node_modules/`
- `users.db`
- `*.md` files (optional)

### Step 2: Deploy to Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Select your GitHub repo
5. Fill in:
   ```
   Name: untitled-phone
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```
6. Click **Environment** and add:
   ```
   SECRET_KEY = your-random-secret-string-here
   ```
7. Click **Create Web Service**
8. Wait 5-10 minutes for deployment
9. Your app will be live at the Render URL (e.g., `https://untitled-phone-xyz.onrender.com`)

### Step 3: Test

1. Open your Render URL
2. Sign up with email + password
3. Open same URL on phone
4. Login with same email + password
5. Both devices have same account ✓

---

## How It Works

```
Browser (Phone)          Browser (Desktop)
        ↓                       ↓
        └──→ Render Server ←──┘
             ├─ Serves frontend (index.html)
             ├─ Serves API (/api/login, /api/signup)
             └─ SQLite database (users)
```

- **Frontend:** HTML + JavaScript (served from `/`)
- **Backend:** Express API (served from `/api/`)
- **Database:** SQLite (`users.db`)

Everything runs on one server. Same account works across devices ✓

---

## Local Testing

```bash
npm install
node server.js
# Open http://localhost:3000
```

---

## That's It!

No GitHub Pages, no separate backend server. Just one Render deployment.

Sign up on phone, login on desktop with same account ✓

# GitHub Repository Setup

## Repository 1: Backend (`untitled-phone-api`)

### Create on GitHub
1. Go to https://github.com/new
2. Repository name: `untitled-phone-api`
3. Description: "Backend API for Untitled Phone - Authentication & User Management"
4. Public or Private (your choice)
5. Click Create

### Push These Files
```bash
server.js
package.json
.gitignore
.env.example
README.md (from this repo)
```

### Don't Push
```bash
node_modules/
users.db
.env
```

### GitHub Settings
1. Go to repo **Settings**
2. Click **Deploy** → no special setup needed (Render pulls directly)
3. That's it!

### Deploy to Render
1. Go to https://render.com
2. Click New → Web Service
3. Connect GitHub
4. Select `untitled-phone-api` repo
5. Settings:
   ```
   Name: untitled-phone-api
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Region: (pick closest)
   ```
6. Environment Variables:
   ```
   SECRET_KEY: your-random-secret-string-here
   ```
7. Click Create Web Service
8. **Copy the URL** (e.g., `https://untitled-phone-api-xyz.onrender.com`)

---

## Repository 2: Frontend (`untitled-phone`)

### Create on GitHub
1. Go to https://github.com/new
2. Repository name: `untitled-phone`
3. Description: "Music player with authentication"
4. Public (required for GitHub Pages)
5. Click Create

### Push These Files
```bash
index.html
auth.js (MUST UPDATE with API URL first!)
script.js
service-worker.js
manifest.json
icon-192.png
icon-512.png
```

### Don't Push
```bash
server.js
package.json
node_modules/
users.db
.gitignore (if you want)
```

### IMPORTANT: Update auth.js Before Pushing
Edit line 2:
```javascript
const API_BASE_URL = 'https://your-render-url-here.onrender.com';
```

Replace with your actual Render URL from Step 1.

### GitHub Pages Setup
1. Go to repo **Settings**
2. Click **Pages** (left sidebar)
3. Under "Build and deployment":
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Click Save
5. Wait 1-2 minutes
6. Site is live at: `https://burgrhama.github.io/untitled-phone/`

---

## Push Commands

### Backend Setup
```bash
mkdir untitled-phone-api
cd untitled-phone-api

# Copy files
cp server.js .
cp package.json .
cp .gitignore .
cp .env.example .

# Initialize repo
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin https://github.com/burgrhama/untitled-phone-api.git
git push -u origin main
```

### Frontend Setup
```bash
cd untitled-phone

# Make sure auth.js is updated with API URL first!

git init
git add .
git commit -m "Add authentication system"
git branch -M main
git remote add origin https://github.com/burgrhama/untitled-phone.git
git push -u origin main
```

---

## After Both Deployed

1. ✓ Backend running on Render
2. ✓ Frontend live on GitHub Pages
3. ✓ Signup and login work cross-device

Test:
- Open https://burgrhama.github.io/untitled-phone/
- Sign up
- Open on phone with different browser
- Login with same email
- Both should show your account ✓

---

## Directory Structure

```
Your Local Machine:
├── untitled-phone-api/          ← Backend
│   ├── server.js
│   ├── package.json
│   └── .gitignore
│
└── untitled-phone/              ← Frontend
    ├── index.html
    ├── auth.js (with API URL)
    ├── script.js
    └── service-worker.js

GitHub:
├── burgrhama/untitled-phone-api  (deployed to Render)
└── burgrhama/untitled-phone      (deployed to GitHub Pages)
```

---

## Important Reminders

⚠️ **Update auth.js with API URL BEFORE pushing frontend**
- Line 2: `const API_BASE_URL = 'https://...onrender.com'`
- Without this, frontend won't connect to backend

⚠️ **Don't push sensitive files**
- `.env` file (has secrets)
- `users.db` (has passwords)
- `node_modules/` (auto-installed by Render)

⚠️ **Use two separate repos**
- Backend repo for Render deployment
- Frontend repo for GitHub Pages
- Don't mix them!

---

## Updating Later

### Update Backend
```bash
cd untitled-phone-api
# edit server.js
git add .
git commit -m "Update API"
git push
# Render auto-deploys! ✓
```

### Update Frontend
```bash
cd untitled-phone
# edit auth.js, index.html, etc.
git add .
git commit -m "Update UI"
git push
# GitHub Pages auto-updates! ✓
```

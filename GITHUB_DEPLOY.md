# Deploy to GitHub Pages + Render

## Step 1: Deploy Backend to Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Select your backend repo with `server.js`
5. Settings:
   ```
   Name: untitled-phone-api
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```
6. Add Environment Variable:
   ```
   KEY: SECRET_KEY
   VALUE: any-random-string-here
   ```
7. Click **Create Web Service**
8. Wait 5-10 minutes
9. **Copy your Render URL** (e.g., `https://untitled-phone-api-abc123.onrender.com`)

## Step 2: Update index.html

In `index.html`, find this line (around line 193):

```javascript
return 'https://untitled-phone-api.onrender.com' + endpoint;
```

Replace `untitled-phone-api.onrender.com` with your actual Render URL.

## Step 3: Deploy Frontend to GitHub Pages

Push `index.html` and other files to GitHub:

```bash
git add index.html manifest.json icon-*.png service-worker.js
git commit -m "Add login/signup system"
git push
```

Go to repo **Settings** → **Pages** → Set source to `main` branch

Your site will be at: `https://burgrhama.github.io/untitled-phone/`

## Step 4: Test

1. Open https://burgrhama.github.io/untitled-phone/
2. Sign up with email + password
3. Open same URL on phone
4. Login with same email + password
5. Both devices show same account ✓

---

## Files to Push to GitHub

- `index.html` (MUST update API URL first!)
- `manifest.json`
- `icon-192.png`
- `icon-512.png`
- `service-worker.js`

Don't push:
- `server.js` (backend only)
- `package.json` (backend only)
- `node_modules/`
- `users.db`

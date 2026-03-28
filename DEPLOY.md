# Deploy to GitHub Pages + Render

## Step 1: Deploy Backend to Render

1. Go to https://render.com
2. Sign up with GitHub
3. Create new Web Service
4. Connect your GitHub repo
5. Fill in:
   - **Name**: `untitled-phone-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Add variable `SECRET_KEY` = any random string (e.g., `abc123xyz`)
6. Click Deploy
7. Wait for deployment, copy the URL (e.g., `https://untitled-phone-api.onrender.com`)

## Step 2: Update Frontend

Update `auth.js` line 2:
```javascript
const API_BASE_URL = 'https://YOUR-RENDER-URL.onrender.com';
```

Replace `YOUR-RENDER-URL` with your actual Render URL.

## Step 3: Deploy Frontend to GitHub Pages

1. Push all files to GitHub
2. In repo Settings → Pages
3. Set Source to `main` branch, `/root` folder
4. GitHub will deploy to `https://burgrhama.github.io/untitled-phone/`

## Step 4: Enable CORS in Render

The backend already has CORS enabled. But if you get CORS errors, the server needs to accept requests from GitHub Pages.

Edit `server.js` if needed:
```javascript
app.use(cors({
  origin: 'https://burgrhama.github.io',
  credentials: true
}));
```

---

## Files to Push to GitHub

- `index.html`
- `auth.js`
- `script.js`
- `service-worker.js`
- `manifest.json`
- `icon-192.png`
- `icon-512.png`

(Don't push `server.js`, `package.json`, or `node_modules` - Render deploys those separately)

---

## Alternative: Deploy Backend to GitHub Actions

If you want to run backend from GitHub, you can use:
- **Railway**: https://railway.app
- **Heroku**: https://www.heroku.com (paid)
- **Fly.io**: https://fly.io

All have free tiers similar to Render.

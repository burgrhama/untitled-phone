# File Organization for Deployment

## Backend Repository (Deploy to Render)

**Repository**: `untitled-phone-api`  
**Push to GitHub**:
- `server.js` ✓
- `package.json` ✓
- `.gitignore` ✓
- `.env.example` ✓
- `setup.sh` ✓
- `README.md` (optional)

**Don't push**:
- `node_modules/` (auto-installed by Render)
- `users.db` (auto-created)
- `.env` (use Render dashboard for secrets)

**Render will**:
1. Read `package.json`
2. Run `npm install`
3. Start with `node server.js`
4. Use environment variables from dashboard

---

## Frontend Repository (Deploy to GitHub Pages)

**Repository**: `untitled-phone` (or current repo)  
**Push to GitHub**:
- `index.html` ✓
- `auth.js` ✓ (UPDATE with API_BASE_URL)
- `script.js` ✓
- `service-worker.js` ✓
- `manifest.json` ✓
- `icon-192.png` ✓
- `icon-512.png` ✓

**Don't push**:
- `server.js`
- `package.json`
- `node_modules/`
- `users.db`

**GitHub Pages will**:
1. Host static files
2. Serve at `https://burgrhama.github.io/untitled-phone/`

---

## Critical Update Before Deploying

Edit `auth.js` and change line 2:

```javascript
// BEFORE:
const API_BASE_URL = 'https://untitled-phone-api.onrender.com';

// AFTER (with YOUR URL):
const API_BASE_URL = 'https://your-actual-render-url.onrender.com';
```

Get your Render URL from: https://render.com/dashboard

---

## Deployment Order

1. Deploy backend to Render first (get URL)
2. Update `auth.js` with Render URL
3. Push frontend to GitHub
4. Enable GitHub Pages in repo settings
5. Test at `https://burgrhama.github.io/untitled-phone/`

---

## Two Repository Structure

```
burgrhama/untitled-phone-api          burgrhama/untitled-phone
├── server.js                         ├── index.html
├── package.json                      ├── auth.js
├── .gitignore                        ├── script.js
└── .env.example                      ├── service-worker.js
                                      ├── manifest.json
    ↓ Deploy to Render               └── ↓ Deploy to GitHub Pages
    
https://untitled-phone-api.onrender.com
    ↑
    Requests from
    
https://burgrhama.github.io/untitled-phone/
```

---

## Summary

✓ Backend: Node.js/Express + SQLite on Render  
✓ Frontend: Static HTML/JS on GitHub Pages  
✓ CORS: Configured to allow GitHub Pages domain  
✓ Database: Stores user accounts (persistent across devices)  
✓ Albums: Stored locally on each device (not synced)

# Deployment Commands

## Step 1: Prepare for Backend Deployment

Create a new GitHub repository: `untitled-phone-api`

```bash
# Create backend folder
mkdir untitled-phone-api
cd untitled-phone-api

# Copy backend files
cp server.js .
cp package.json .
cp .gitignore .
cp .env.example .

# Initialize git
git init
git add .
git commit -m "Initial backend commit"
git branch -M main

# Add remote
git remote add origin https://github.com/burgrhama/untitled-phone-api.git

# Push to GitHub
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

1. Go to **https://render.com**
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Select `untitled-phone-api` repository
5. Configure:
   ```
   Name: untitled-phone-api
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```
6. Go to **Environment** tab, add:
   ```
   KEY: SECRET_KEY
   VALUE: your-secure-random-string-12345
   ```
7. Click **Create Web Service**
8. **Wait 5-10 minutes** for deployment
9. Copy service URL from Render dashboard
   - Example: `https://untitled-phone-api-xyz123.onrender.com`

---

## Step 3: Update Frontend with Backend URL

Edit `auth.js` line 2:

```javascript
// Replace this:
const API_BASE_URL = 'https://untitled-phone-api.onrender.com';

// With your actual Render URL:
const API_BASE_URL = 'https://untitled-phone-api-xyz123.onrender.com';
```

---

## Step 4: Deploy Frontend to GitHub Pages

If not already a git repo:

```bash
cd /path/to/frontend

git init
git add .
git commit -m "Add login/signup system"
git branch -M main
git remote add origin https://github.com/burgrhama/untitled-phone.git
git push -u origin main
```

If already a git repo:

```bash
git add .
git commit -m "Update: add authentication system"
git push
```

---

## Step 5: Enable GitHub Pages

1. Go to your frontend repo on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes
7. Your site is live at: `https://burgrhama.github.io/untitled-phone/`

---

## Step 6: Test Everything

### Test 1: Signup
1. Open https://burgrhama.github.io/untitled-phone/
2. Click "Sign Up"
3. Enter email: `test@example.com`
4. Enter password: `password123`
5. Confirm password: `password123`
6. Click "Sign Up"

### Test 2: Login on Another Device
1. Open same URL on phone/different browser
2. Click "Sign In"
3. Enter same email: `test@example.com`
4. Enter same password: `password123`
5. Click "Sign In"
6. Both devices now have same account logged in ✓

### Test 3: Check Browser Console
1. Open https://burgrhama.github.io/untitled-phone/
2. Press F12 (open DevTools)
3. Go to **Console** tab
4. Try signup/login
5. You should see: `Signup API URL: https://your-backend-url.onrender.com/api/signup`
6. No errors = working correctly ✓

---

## Troubleshooting

### Issue: "Network error. Please try again"

**Check**:
1. Is Render service running? → https://render.com/dashboard
2. Is `API_BASE_URL` in auth.js correct?
3. Open DevTools Console (F12) - what error?

**Common fixes**:
- Check Render service logs for errors
- Verify `SECRET_KEY` is set in Render dashboard
- Confirm GitHub Pages URL is correct

### Issue: "Email already registered"

**Expected behavior** - you already signed up with that email. Use different email to test.

### Issue: Render shows "503 Service Unavailable"

**Solution**:
- Render free tier spins down after 15 min inactivity
- Service restarts on first request
- Wait 30 seconds, refresh page

---

## Continuous Deployment

After initial setup:

### Updating Backend
```bash
cd untitled-phone-api
# Make changes to server.js
git add .
git commit -m "Fix: xyz"
git push
# Render auto-deploys from GitHub!
```

### Updating Frontend
```bash
cd untitled-phone
# Make changes to auth.js, index.html, etc.
git add .
git commit -m "Feature: xyz"
git push
# GitHub Pages auto-deploys!
```

---

## Final Checklist

- [ ] Backend repo created on GitHub
- [ ] Backend deployed to Render
- [ ] Render URL obtained
- [ ] auth.js updated with Render URL
- [ ] Frontend pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Site loads at https://burgrhama.github.io/untitled-phone/
- [ ] Signup works
- [ ] Login works on different device with same account
- [ ] Console has no errors (F12)

✓ You're done!

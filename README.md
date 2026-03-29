# Untitled Phone - Login & Signup System

A music app with user authentication. Sign up on one device, login on another with the same account.

## Features

✓ User signup with email & password  
✓ Login authentication  
✓ Cross-device account access  
✓ Music album management (local)  
✓ Secure password hashing  
✓ JWT token sessions  
✓ Responsive dark UI  

## How It Works

**Backend** (Render): Stores user accounts & authentication  
**Frontend** (GitHub Pages): Music app interface  
**Database** (SQLite): User emails & hashed passwords  

Sign up on your phone → Login on your desktop with same credentials ✓

## Quick Setup (5 minutes)

### For Local Testing
```bash
npm install
node server.js
# Open http://localhost:3000
```

### For Production (GitHub Pages + Render)

See **DEPLOY_STEPS.md** for complete guide.

TL;DR:
1. Deploy backend to Render (get URL)
2. Update `auth.js` with Render URL
3. Deploy frontend to GitHub Pages
4. Open https://burgrhama.github.io/untitled-phone/
5. Test signup/login

## File Structure

**Backend Files**:
- `server.js` - Express API server
- `package.json` - Node dependencies

**Frontend Files**:
- `index.html` - Login/signup UI + app
- `auth.js` - Authentication logic
- `script.js` - Music player logic
- `service-worker.js` - Offline support

**Documentation**:
- `DEPLOY_STEPS.md` - Step-by-step deployment guide
- `QUICK_START.md` - 5-minute overview
- `FILE_ORGANIZATION.md` - What files go where

## API Endpoints

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/signup` | `{email, password, confirmPassword}` |
| POST | `/api/login` | `{email, password}` |
| GET | `/api/profile` | Header: `Authorization: Bearer <token>` |

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite
- **Auth**: JWT + bcrypt
- **Frontend**: Vanilla JavaScript
- **Hosting**: GitHub Pages (frontend) + Render (backend)

## Security

✓ Passwords hashed with bcrypt (10 rounds)  
✓ JWT tokens expire after 7 days  
✓ CORS configured for GitHub Pages  
✓ Input validation on all endpoints  

## Deployment

Two separate repositories:

1. **Backend** (`untitled-phone-api`)
   - Files: `server.js`, `package.json`
   - Host: Render
   - URL: `https://untitled-phone-api.onrender.com`

2. **Frontend** (`untitled-phone`)
   - Files: `index.html`, `auth.js`, `script.js`, etc.
   - Host: GitHub Pages
   - URL: `https://burgrhama.github.io/untitled-phone/`

See `DEPLOY_STEPS.md` for exact commands.

## Testing

### Local
```bash
npm install
node server.js
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","confirmPassword":"test123"}'
```

### After Deployment
1. Open app URL on phone
2. Sign up with email/password
3. Open app URL on desktop
4. Login with same email/password
5. Both devices show logged-in state ✓

## Troubleshooting

**"Network error" on login?**
- Check `auth.js` line 2 has correct API URL
- Open DevTools (F12) → Console for error details
- Verify Render service is running

**Signup says "Email already registered"?**
- Expected - use different email or login instead

**Want to reset?**
- Backend: Delete `users.db` file
- Frontend: Clear localStorage in DevTools

## Next Steps

- [ ] Deploy backend to Render
- [ ] Update frontend with API URL
- [ ] Deploy to GitHub Pages
- [ ] Test cross-device login
- [ ] Add password reset
- [ ] Use PostgreSQL for production
- [ ] Add cloud album sync

## License

MIT

## Support

See documentation files:
- `DEPLOY_STEPS.md` - How to deploy
- `QUICK_START.md` - Quick overview
- `FILE_ORGANIZATION.md` - Where files go
- `DEPLOYMENT_GUIDE.md` - Detailed guide

OvR

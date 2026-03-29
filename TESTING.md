# Cross-Device Audio Playback - Testing Guide

## What Changed

Your music app now has **3 audio storage solutions**:

1. **BASE64 in SQLite** (Default for Render free tier) ✅ Active
2. **AWS S3** (Optional, for production) - Ready if configured
3. **Service Worker Caching** (Automatic offline support) ✅ Active

## How It Works Now

### Upload Flow
1. User selects audio file on PC
2. Server converts to base64 (up to 25MB)
3. Stored directly in SQLite database
4. Syncs to all devices

### Playback Flow
1. Phone user logs in (same account as PC)
2. Clicks track to play
3. Client downloads audio from server
4. Browser caches it (even works offline next time)
5. Plays on phone

## Testing Steps

### Step 1: Fresh Account Test
```
Device 1 (PC):
- Go to https://untitled-phone.onrender.com
- Sign up: test@example.com / password123
- Create album: "Test Album"
- Add song: any MP3 file (< 25MB)

Device 2 (Phone/Tablet):
- Same URL in browser or install as PWA
- Sign in: test@example.com / password123
- Check if album appears (sync check)
- Click track to play (should download + play)
- Close app, reopen, click same track (should play instantly from cache)
```

### Step 2: Check Storage Mode
**Open browser dev console** (F12) and run:
```javascript
// Check server storage status
fetch('/api/debug/uploads')
  .then(r => r.json())
  .then(data => console.log(data))
```

Should show:
```json
{
  "storageMode": "BASE64",
  "count": 0,
  "uploadDir": "/path/to/uploads"
}
```

Or with S3 configured:
```json
{
  "storageMode": "S3",
  "count": 0,
  "uploadDir": "/path/to/uploads"
}
```

### Step 3: Monitor Network Requests
**In Chrome DevTools → Network tab** while playing:
1. Click track
2. You should see a request to the upload URL
3. Response should be audio blob (not error)

### Step 4: Test Cache
1. Play track once (should download + cache)
2. Go offline (DevTools → Network → Offline)
3. Play same track again (should work from cache)
4. Go online again

### Step 5: Test Large Files
- Try uploading 15-20MB file
- Should still work (base64 supports up to 25MB)
- Check browser Dev Tools → Storage → LocalStorage to see base64 usage

## Troubleshooting

### Issue: Upload succeeds but phone can't play
**Solution:**
- Check browser console for errors (F12 → Console)
- Try clearing browser cache: DevTools → Storage → Clear site data
- Check if track URL is valid (should start with `data:audio`)
- Verify phone is logged in with same account

### Issue: "Playback failed" message
**Solution:**
- Check if file was actually uploaded (look at album)
- Try smaller file first (base64 works best < 10MB)
- Check server logs: Render dashboard → Logs
- Try from different browser/device

### Issue: Offline playback not working
**Solution:**
- Play track once while online (forces download + cache)
- Clear site data and cache might have cleared your offline storage
- Check Service Worker status: DevTools → Application → Service Workers
- Should show "active and running"

### Issue: Render deployment seems outdated
**Solution:**
- Go to Render Dashboard → your service
- Click "Manual Deploy" → "Deploy latest commit"
- Wait 2-3 minutes for redeployment
- Hard refresh: Ctrl+Shift+Delete (chrome) or Cmd+Shift+Delete (mac)

## Performance Tips

### For Best Experience
- **First play**: Shows "⟳ downloading" while fetching
- **Second play**: Instant (uses cache)
- **Offline**: Works automatically if cached

### Optimization
- Audio files are automatically cached by service worker
- Browser cache is separate from browser storage
- Service worker cache persists for ~30 days (browser dependent)

## File Size Limits

| Storage | Limit | Notes |
|---------|-------|-------|
| BASE64 (Default) | 25MB/file | Stored in SQLite, unlimited albums |
| S3 | Unlimited | ~$0.023 per GB/month |
| Browser Cache | 500MB+ | Auto-managed by browser |
| Browser Storage | 10-50MB | Varies by device |

## Upgrading to S3

If base64 isn't enough:

1. **Create AWS S3 account** (see `S3_SETUP.md`)
2. **Set Render env vars**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
3. **Redeploy** on Render
4. **Test** - new uploads will use S3, old base64 tracks still work

## Next Steps

- [ ] Test upload from PC
- [ ] Test playback on phone
- [ ] Test offline mode
- [ ] Test cross-device sync
- [ ] (Optional) Set up S3 for production

## Support

If something doesn't work:

1. Check Render logs: Dashboard → Logs
2. Check browser console: F12 → Console tab
3. Clear cache: DevTools → Storage → Clear site data
4. Try fresh browser window (incognito mode)
5. Try different device/network

# Background Audio Playback - Quick Test

## What's New
Your music app now continues playing when:
- 📱 Phone screen locks
- 🔄 You switch to another app  
- 🔇 App is backgrounded
- 🔐 Lock screen is visible

## Test on iOS

```
1. Open app in Safari (or installed PWA)
2. Start playing a track
3. Wait for audio to load
4. LOCK SCREEN (press power button)
5. Verify: Audio continues playing ✓
6. LOCK SCREEN CONTROLS: Swipe down from top
7. Should see: Track name, artist, play/pause button
8. Try: Tap pause/play from lock screen
9. Unlock phone - audio should still be playing
10. Switch to another app (e.g., Messages)
11. Verify: Audio continues playing ✓
12. Return to app - full UI visible
```

## Test on Android

```
1. Open app in Chrome (or installed PWA)
2. Start playing a track
3. PRESS HOME - app goes background
4. Verify: Audio continues playing ✓
5. CHECK NOTIFICATION: Swipe down from top
6. Should see: Playback notification with track info
7. Try: Tap pause from notification
8. LOCK SCREEN: Press power button
9. Verify: Audio continues, lock screen controls visible ✓
10. Press notification play/pause while locked
11. Return to app - music still playing
12. Close app via task switcher
13. REOPEN APP: Audio state may be preserved
```

## What Controls Should Show

### iOS Lock Screen
```
[Lock Screen]
━━━━━━━━━━━━━━━
🎵 Song Title
   pirated untitled
   [⏮ ⏸ ⏭]
━━━━━━━━━━━━━━━
```

### Android Lock Screen / Notification
```
[Notification]
━━━━━━━━━━━━━━━━━━━
♫ Song Title
  Artist: pirated untitled
  [⏮] [⏸] [⏭] [✕]
━━━━━━━━━━━━━━━━━━━
```

## Troubleshooting

### Audio stops when backgrounded
**iOS:**
- Ensure you're using Safari 14.5+ or PWA
- Hard refresh: Settings → Safari → Clear History and Website Data
- Try installing as PWA (add to home screen)
- Check DevTools → Console for errors

**Android:**
- Update Chrome to latest version
- Check Settings → Apps → Chrome → Permissions → Media
- Try PWA installation (add to home screen)
- Check DevTools → Console (F12)

### Lock screen controls don't appear
1. Play a track
2. Wait 2-3 seconds
3. Lock screen
4. Wait another 2 seconds
5. Swipe down/up to reveal controls

If still not showing:
- F12 → Console: Check for errors
- Reload page
- Try different browser

### Audio volume too low or high in background
- Use system volume buttons while app backgrounded
- Or adjust in lock screen/notification controls

### App crashes when backgrounded
1. Check browser console (F12 → Console)
2. Note exact error message
3. Clear browser cache: DevTools → Storage → Clear site data
4. Reload and try again

## Performance Check

**While playing in background, check:**

iOS:
- Battery usage: Normal (2-3% drain increase)
- Memory: App icon in app switcher shows normal memory
- CPU: Device doesn't get warm

Android:
- Battery: Check in Settings → Battery
- Notification is persistent
- System doesn't complain about background activity

## Success Checklist

- [ ] Audio plays normally in app
- [ ] Audio continues when screen locks
- [ ] Audio continues when switching apps
- [ ] Lock screen shows track info
- [ ] Lock screen play/pause works
- [ ] Audio volume buttons work
- [ ] Can reopen app without restarting playback
- [ ] No crashes when backgrounded

## Browser Console Logs

While testing, open DevTools (F12) and check Console tab for:

✅ Good log:
```
Background audio handler initialized
App backgrounded, audio continues
```

❌ Bad log:
```
Error: Media Session API not supported
Playback error: Failed to resume context
```

If you see error logs:
1. Note the exact error
2. Clear browser cache
3. Hard reload
4. Try different browser

## Next Steps

1. **Test with real phone** (not just browser devtools)
2. **Test multiple tracks** - does audio switch correctly?
3. **Test offline** - download one track, go airplane mode, try playing
4. **Test long playback** - keep playing for 30+ minutes, does it stay stable?
5. **Test rapid app switching** - quickly switch between apps 10+ times

## Performance Metrics

Target:
- Startup time: < 500ms
- Background audio delay: < 100ms
- Memory overhead: < 5MB
- Battery drain: 2-3% above baseline
- CPU usage: < 1%

Check with:
```
DevTools → Performance → Record
- Start recording
- Play track, background app, switch apps
- Stop recording
- Check: FPS should be stable (no dropping)
```

## Report Issues

If you find problems:
1. Note OS and browser version
2. Describe exact steps to reproduce
3. Check browser console for errors
4. Try different browser to isolate

This helps identify if it's app-specific or browser-specific issue.

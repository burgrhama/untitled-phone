import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update initialization to be more robust
old_init = '<script>if(window.BackgroundAudio) BackgroundAudio.init(document.getElementById("audioPlayer")); BackgroundAudio?.setupIOSAudioHandling();</script>'
new_init = '''<script>
// Initialize background audio with retry logic
function initBackgroundAudio() {
  if (window.BackgroundAudio && document.getElementById("audioPlayer")) {
    BackgroundAudio.init(document.getElementById("audioPlayer"));
    BackgroundAudio.setupIOSAudioHandling();
    console.log('Background audio initialized');
  } else {
    setTimeout(initBackgroundAudio, 100);
  }
}
document.addEventListener('DOMContentLoaded', initBackgroundAudio);
if (document.readyState !== 'loading') initBackgroundAudio();
</script>'''

if old_init in content:
    content = content.replace(old_init, new_init)
    print("Updated initialization")

# Also add a global function to force playback
if 'window.BackgroundAudio.forcePlayback' not in content:
    # Find where global functions are exposed
    if 'window.goHome = goHome;' in content:
        old_expose = 'window.goHome = goHome;'
        new_expose = '''window.goHome = goHome;
window.forcePlayback = () => BackgroundAudio?.forcePlayback();'''
        content = content.replace(old_expose, new_expose)
        print("Added forcePlayback to global scope")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated index.html for persistent background audio")

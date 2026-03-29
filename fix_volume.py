with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add explicit volume initialization after audio element
if 'document.getElementById("audioPlayer")' in content:
    # Find where we init background audio
    old_init = '''document.addEventListener('DOMContentLoaded', initBackgroundAudio);
if (document.readyState !== 'loading') initBackgroundAudio();'''
    
    new_init = '''document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById("audioPlayer");
  if (audio) {
    audio.volume = 1; // Ensure volume is maxed
    audio.muted = false; // Ensure not muted
  }
  initBackgroundAudio();
});
if (document.readyState !== 'loading') {
  const audio = document.getElementById("audioPlayer");
  if (audio) {
    audio.volume = 1;
    audio.muted = false;
  }
  initBackgroundAudio();
}'''
    
    if old_init in content:
        content = content.replace(old_init, new_init)
        print("Added volume initialization")
    else:
        print("Could not find init pattern")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added audio volume and muted state fixes")

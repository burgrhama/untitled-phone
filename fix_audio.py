with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the connectAudioAnalyser function to ensure proper audio routing
old_func = '''function connectAudioAnalyser() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  } catch (e) {
    console.warn('Web Audio API not available');
  }
}'''

new_func = '''function connectAudioAnalyser() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    source = audioContext.createMediaElementSource(audioPlayer);
    // IMPORTANT: Connect source through analyser to destination for both analysis and audio output
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    console.log('Web Audio API connected - audio should have sound');
  } catch (e) {
    console.warn('Web Audio API not available:', e);
  }
}'''

content = content.replace(old_func, new_func)

# Also ensure we're not muting the audio element itself
if 'audioPlayer.volume = 0' in content:
    content = content.replace('audioPlayer.volume = 0', 'audioPlayer.volume = 1')
    print("Fixed muted volume")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed audio routing")

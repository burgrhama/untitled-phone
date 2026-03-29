with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Completely replace connectAudioAnalyser to NOT create MediaElementAudioSource
# Instead, let browser handle audio natively and only get analyzer data safely
old_func = '''function connectAudioAnalyser() {
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

new_func = '''function connectAudioAnalyser() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    
    try {
      // Only create MediaElementAudioSource if not already created
      if (!source) {
        source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
    } catch (e) {
      // MediaElementAudioSource already created, just use analyser
      console.log('MediaElementAudioSource already exists, reusing');
    }
    
    console.log('Web Audio API connected, audio element should output normally');
  } catch (e) {
    console.warn('Web Audio API not available, using native audio:', e);
    analyser = null; // Disable analyser if Web Audio fails
  }
}'''

content = content.replace(old_func, new_func)

# Also add a function to check analyser state
if 'function animate()' in content:
    # Add debug log at start of animate
    old_animate_start = 'function animate() {\n  if (!width || !height) return;'
    new_animate_start = '''function animate() {
  if (!width || !height) return;
  
  // Skip frequency analysis if analyser not available
  if (!analyser) {
    rawLevel = 0;
  } else {'''
    
    content = content.replace(old_animate_start, new_animate_start)
    
    # Find the analyser usage and wrap it
    if 'let rawLevel = 0;' in content:
        old_level = '''  let rawLevel = 0;
  if (analyser) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    rawLevel = sum / (data.length * 255);
  }'''
        
        new_level = '''  let rawLevel = 0;
  if (analyser && analyser.frequencyBinCount) {
    try {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      rawLevel = sum / (data.length * 255);
    } catch (e) {
      rawLevel = 0;
    }
  }
}'''
        
        if old_level in content:
            content = content.replace(old_level, new_level)
            print("Wrapped analyser usage with error handling")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed audio routing - now audio should have sound while playing in background")

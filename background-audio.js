// ===== iOS PWA Audio - Honest Implementation =====
// iOS PWAs have fundamental audio limitations we cannot overcome with code

const BackgroundAudio = {
  audioElement: null,
  isPlaying: false,
  
  init(audioElement) {
    this.audioElement = audioElement;
    console.log('🎵 BackgroundAudio initialized');
    
    // Configure audio element
    this.audioElement.muted = false;
    this.audioElement.volume = 1;
    this.audioElement.setAttribute('playsinline', 'playsinline');
    this.audioElement.setAttribute('webkit-playsinline', 'webkit-playsinline');
    
    // Detect iOS and warn user
    this.detectiOSLimitation();
    
    // Setup what we CAN do
    this.setupMediaSession();
    this.setupPlaybackHandlers();
  },

  detectiOSLimitation() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && isPWA) {
      console.warn('⚠️  iOS PWA Detected');
      console.warn('iOS PWAs have background audio restrictions:');
      console.warn('- Audio will mute when app is backgrounded');
      console.warn('- This is an iOS limitation, not fixable with code');
      console.warn('- Use Safari in split-view for background audio');
      console.warn('- Or use on Android for full background audio');
      
      // Show user-facing warning
      this.showiOSWarning();
    }
  },

  showiOSWarning() {
    // Check if already shown
    if (localStorage.getItem('iosWarningShown')) return;
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;
    
    // Create warning banner
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #ff6b6b, #ff8c00);
      color: white;
      padding: 15px;
      text-align: center;
      z-index: 999999;
      font-weight: bold;
      font-size: 14px;
      max-height: 100px;
      overflow: hidden;
    `;
    
    banner.innerHTML = `
      <div style="margin-bottom: 10px;">⚠️ iOS Limitation Detected</div>
      <div style="font-size: 12px; margin-bottom: 10px;">
        Audio will mute when you background this app (iOS PWA restriction).
        Try: Safari split-view, or use on Android for full background audio.
      </div>
      <button onclick="this.parentElement.remove(); localStorage.setItem('iosWarningShown', 'true');" 
              style="background: white; color: #ff6b6b; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">
        Got it
      </button>
    `;
    
    document.body.prepend(banner);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (banner.parentElement) {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.3s';
        setTimeout(() => banner.remove(), 300);
      }
    }, 10000);
  },

  setupPlaybackHandlers() {
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      console.log('▶ Audio playing');
      this.updateMediaSession();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      console.log('⏸ Audio paused');
      this.updateMediaSession();
    });

    this.audioElement.addEventListener('error', (e) => {
      console.error('✗ Audio error:', this.audioElement.error);
    });
  },

  setupMediaSession() {
    if (!navigator.mediaSession) return;

    navigator.mediaSession.setActionHandler('play', () => {
      this.audioElement.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      this.audioElement.pause();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      window.playNext?.();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      window.playPrevious?.();
    });
  },

  updateMediaSession(trackName = 'Playing...', artwork = null) {
    if (!navigator.mediaSession) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: trackName,
      artist: 'pirated untitled',
      album: 'Music',
      artwork: artwork ? [{
        src: artwork,
        sizes: '512x512',
        type: 'image/jpeg'
      }] : []
    });

    navigator.mediaSession.playbackState = this.audioElement.paused ? 'paused' : 'playing';
  },

  forcePlayback() {
    this.audioElement.muted = false;
    this.audioElement.volume = 1;
    if (this.audioElement.paused) {
      this.audioElement.play();
    }
  }
};

console.log('🎵 Background audio module loaded');

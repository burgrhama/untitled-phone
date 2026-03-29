// ===== BACKGROUND AUDIO FOR PWA =====
// Simple, effective background audio that works when app is installed
// In browser tabs: audio mutes when backgrounded (browser security)
// In PWA: audio continues in background (OS allows it)

const BackgroundAudio = {
  audioElement: null,
  isPlaying: false,
  
  init(audioElement) {
    this.audioElement = audioElement;
    console.log('🎵 BackgroundAudio initialized');
    
    // Ensure audio element is properly configured
    this.audioElement.muted = false;
    this.audioElement.volume = 1;
    
    // Setup media session for lock screen controls
    this.setupMediaSession();
    
    // Track play/pause state
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateMediaSession();
    });
    
    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateMediaSession();
    });
    
    // Important: Detect if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone === true;
    
    console.log(`Running as PWA: ${isPWA ? 'YES' : 'NO'}`);
    
    if (!isPWA) {
      console.warn('⚠️  Running in browser tab');
      console.warn('💡 Install as PWA for background audio: iOS = Share → Add to Home Screen | Android = Menu → Install App');
    }
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

  // Ensure volume stays up
  forcePlayback() {
    this.audioElement.muted = false;
    this.audioElement.volume = 1;
    if (this.audioElement.paused) {
      this.audioElement.play();
    }
  }
};

console.log('🎵 Background audio module loaded');

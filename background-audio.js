// ===== iOS PWA BACKGROUND AUDIO FIX =====
// Specifically handles iOS (iPhone/iPad) audio limitations

const BackgroundAudio = {
  audioElement: null,
  isPlaying: false,
  audioContext: null,
  
  init(audioElement) {
    this.audioElement = audioElement;
    console.log('🎵 BackgroundAudio initializing for iOS...');
    
    // Critical iOS settings
    this.setupIOSAudio();
    this.setupMediaSession();
    this.setupPlaybackHandlers();
    
    console.log('✓ iOS audio configured');
  },

  setupIOSAudio() {
    // Ensure audio element has all iOS-specific attributes
    this.audioElement.muted = false;
    this.audioElement.volume = 1;
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';
    
    // iOS specific: playsinline is critical
    this.audioElement.setAttribute('playsinline', 'playsinline');
    this.audioElement.setAttribute('webkit-playsinline', 'webkit-playsinline');
    
    // iOS requires user interaction first
    const enableAudio = () => {
      console.log('📱 User interaction detected, enabling audio...');
      this.createAudioContext();
      document.removeEventListener('touchend', enableAudio);
      document.removeEventListener('click', enableAudio);
    };
    
    document.addEventListener('touchend', enableAudio);
    document.addEventListener('click', enableAudio);
  },

  createAudioContext() {
    if (this.audioContext) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // iOS: Need to connect media element to context for background audio
      const source = this.audioContext.createMediaElementAudioSource(this.audioElement);
      source.connect(this.audioContext.destination);
      
      console.log('✓ Audio context created and connected');
      
      // Keep context alive
      this.keepContextAlive();
      
    } catch (e) {
      console.error('✗ Audio context failed:', e);
    }
  },

  keepContextAlive() {
    if (!this.audioContext) return;
    
    // Resume context every 100ms to prevent iOS suspension
    setInterval(() => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(e => {
          console.log('Context resume failed (normal)', e.message);
        });
      }
    }, 100);
  },

  setupPlaybackHandlers() {
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      console.log('▶ Playing');
      
      // iOS: Resume context on play
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Create context if needed
      if (!this.audioContext) {
        this.createAudioContext();
      }
      
      this.updateMediaSession();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      console.log('⏸ Paused');
      this.updateMediaSession();
    });

    this.audioElement.addEventListener('error', (e) => {
      console.error('✗ Audio error:', this.audioElement.error);
    });
  },

  setupMediaSession() {
    if (!navigator.mediaSession) return;

    navigator.mediaSession.setActionHandler('play', () => {
      console.log('🎧 Lock screen: play');
      this.audioElement.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      console.log('🎧 Lock screen: pause');
      this.audioElement.pause();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      console.log('🎧 Lock screen: next');
      window.playNext?.();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      console.log('🎧 Lock screen: previous');
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
    console.log('🔊 Force playback');
    
    this.audioElement.muted = false;
    this.audioElement.volume = 1;
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    if (this.audioElement.paused) {
      this.audioElement.play();
    }
  }
};

console.log('🍎 iOS Background Audio Module Loaded');

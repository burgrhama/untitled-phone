// ===== COMPREHENSIVE BACKGROUND AUDIO HANDLER =====
// Handles every possible audio scenario and failure case

const BackgroundAudio = {
  audioElement: null,
  audioContext: null,
  analyser: null,
  source: null,
  gain: null,
  isPlaying: false,
  playCheckInterval: null,
  connectionAttempts: 0,
  maxConnectionAttempts: 5,
  
  init(audioElement) {
    console.log('🎵 [BackgroundAudio] Initializing...');
    this.audioElement = audioElement;
    
    if (!audioElement) {
      console.error('✗ No audio element provided');
      return;
    }

    // Ensure audio element settings
    this.ensureAudioElementSettings();
    
    // Setup listeners
    this.setupPlaybackHandlers();
    this.setupVisibilityHandlers();
    this.setupMediaSession();
    this.preventPauseOnBlur();
    
    // Create Web Audio context (lazy load on first play)
    this.setupLazyAudioContext();
    
    console.log('✓ [BackgroundAudio] Initialization complete');
  },

  // Ensure audio element is properly configured
  ensureAudioElementSettings() {
    console.log('🔧 [BackgroundAudio] Configuring audio element...');
    
    this.audioElement.muted = false;
    this.audioElement.volume = 1;
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';
    
    // Remove any CSS that might mute
    this.audioElement.style.muted = 'false';
    
    console.log(`✓ Audio element: volume=${this.audioElement.volume}, muted=${this.audioElement.muted}`);
  },

  // Create Web Audio context only when needed
  setupLazyAudioContext() {
    console.log('📦 [BackgroundAudio] Web Audio setup deferred until first play');
    
    this.audioElement.addEventListener('play', () => {
      if (!this.audioContext) {
        this.createAudioContext();
      }
    }, { once: true });
  },

  // Create and configure Web Audio context
  createAudioContext() {
    console.log('🔧 [BackgroundAudio] Creating Web Audio context...');
    
    if (this.audioContext) {
      console.log('ℹ Audio context already exists');
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('✗ Web Audio API not supported');
        return;
      }

      this.audioContext = new AudioContext();
      console.log(`✓ Audio context created: ${this.audioContext.state}`);
      console.log(`  - Sample Rate: ${this.audioContext.sampleRate}Hz`);
      console.log(`  - Max channels: ${this.audioContext.destination.maxChannelCount}`);

      // Auto-resume on user interaction
      this.setupContextAutoResume();
      
      // Try to connect immediately
      this.connectMediaElement();

    } catch (e) {
      console.error(`✗ Failed to create audio context: ${e.message}`);
    }
  },

  // Auto-resume audio context on user interaction
  setupContextAutoResume() {
    const resume = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('▶ [BackgroundAudio] Resuming suspended audio context...');
        this.audioContext.resume()
          .then(() => console.log('✓ Audio context resumed'))
          .catch(e => console.error(`✗ Resume failed: ${e}`));
      }
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
    };

    document.addEventListener('click', resume);
    document.addEventListener('touchstart', resume);
  },

  // Connect media element to Web Audio with fallback
  connectMediaElement() {
    if (!this.audioContext) {
      console.log('ℹ No audio context yet');
      return;
    }

    if (this.source) {
      console.log('ℹ Already connected to Web Audio');
      return;
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.warn('✗ Max connection attempts reached, giving up');
      return;
    }

    try {
      console.log(`🔗 [BackgroundAudio] Connecting media element (attempt ${this.connectionAttempts + 1})...`);
      
      this.source = this.audioContext.createMediaElementAudioSource(this.audioElement);
      
      // Create gain node for volume control
      this.gain = this.audioContext.createGain();
      this.gain.gain.value = 1;
      
      // Create analyser for visualizations
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      // Connect: source → gain → analyser → destination
      this.source.connect(this.gain);
      this.gain.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      console.log('✓ Media element connected to Web Audio');
      console.log('  Chain: source → gain → analyser → destination');
      this.connectionAttempts = 0; // Reset on success

    } catch (e) {
      console.error(`✗ Connection failed (attempt ${this.connectionAttempts + 1}): ${e.message}`);
      this.connectionAttempts++;
      
      // Retry after delay
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        setTimeout(() => this.connectMediaElement(), 1000);
      }
    }
  },

  // Track playback state
  setupPlaybackHandlers() {
    console.log('📝 [BackgroundAudio] Setting up playback handlers...');

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      console.log('▶ Audio started playing');
      
      // Ensure Web Audio is connected
      if (!this.source && this.audioContext) {
        console.log('🔗 Connecting media element on play...');
        this.connectMediaElement();
      }
      
      this.ensurePlayback();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      console.log('⏸ Audio paused');
      if (this.playCheckInterval) {
        clearInterval(this.playCheckInterval);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      console.log('⏹ Audio ended');
      if (this.playCheckInterval) {
        clearInterval(this.playCheckInterval);
      }
    });

    this.audioElement.addEventListener('error', (e) => {
      console.error(`✗ Audio error: ${this.audioElement.error?.message}`);
      this.isPlaying = false;
    });

    this.audioElement.addEventListener('loadstart', () => console.log('📥 Loading...'));
    this.audioElement.addEventListener('canplay', () => console.log('✓ Can play'));
    this.audioElement.addEventListener('playing', () => console.log('▶ Playing'));
  },

  // CRITICAL: Prevent browser from muting backgrounded tabs
  preventPauseOnBlur() {
    console.log('🔊 [BackgroundAudio] Setting up tab blur handlers...');

    window.addEventListener('blur', () => {
      console.log('📵 [TAB BLUR] Window lost focus');
      
      // Resume audio context
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('  → Resuming audio context...');
        this.audioContext.resume().catch(e => console.error(`  ✗ Resume failed: ${e}`));
      }
      
      // Also ensure audio element keeps playing
      if (this.isPlaying && this.audioElement.paused) {
        console.log('  → Resuming audio element...');
        this.audioElement.play().catch(e => console.error(`  ✗ Play failed: ${e}`));
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📵 [PAGE HIDDEN] Tab is no longer visible');
        
        // Resume context
        if (this.audioContext && this.audioContext.state === 'suspended') {
          console.log('  → Resuming audio context...');
          this.audioContext.resume().catch(e => {});
        }
        
        // Keep checking every 500ms
        this.ensurePlayback();
        
      } else {
        console.log('📱 [PAGE VISIBLE] Tab is visible again');
        
        // Resume if paused
        if (this.isPlaying && this.audioElement.paused) {
          console.log('  → Resuming audio...');
          this.audioElement.play().catch(e => console.error(`  ✗ Play failed: ${e}`));
        }
      }
    });
  },

  // Aggressively ensure playback continues
  ensurePlayback() {
    if (this.playCheckInterval) {
      clearInterval(this.playCheckInterval);
    }

    // Check every 300ms (more frequent than before)
    this.playCheckInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(this.playCheckInterval);
        return;
      }

      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(e => {});
      }

      // If should be playing but paused, resume
      if (this.audioElement.paused && this.isPlaying) {
        console.log('🔊 [ENSURE] Audio paused, resuming...');
        this.audioElement.play().catch(e => console.error(`✗ Resume failed: ${e}`));
      }

      // Ensure volume is still up
      if (this.audioElement.muted) {
        console.log('🔊 [ENSURE] Audio was muted, unmuting...');
        this.audioElement.muted = false;
      }

      if (this.audioElement.volume === 0) {
        console.log('🔊 [ENSURE] Volume is 0, setting to 1...');
        this.audioElement.volume = 1;
      }

    }, 300); // Check every 300ms

    // Cleanup on end
    const onEnded = () => {
      if (this.playCheckInterval) {
        clearInterval(this.playCheckInterval);
      }
      this.audioElement.removeEventListener('ended', onEnded);
    };
    this.audioElement.addEventListener('ended', onEnded);
  },

  // Media Session API for lock screen
  setupMediaSession() {
    if (!navigator.mediaSession) {
      console.log('ℹ Media Session API not available');
      return;
    }

    console.log('🎵 [BackgroundAudio] Setting up Media Session...');

    navigator.mediaSession.setActionHandler('play', () => {
      console.log('📲 Lock screen: Play');
      this.audioElement.play().catch(e => console.error(`Play failed: ${e}`));
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      console.log('📲 Lock screen: Pause');
      this.audioElement.pause();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      console.log('📲 Lock screen: Next');
      window.playNext?.();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      console.log('📲 Lock screen: Previous');
      window.playPrevious?.();
    });

    navigator.mediaSession.setActionHandler('seek', (event) => {
      if (event.seekTime !== undefined) {
        console.log(`📲 Lock screen: Seek to ${event.seekTime.toFixed(2)}s`);
        this.audioElement.currentTime = event.seekTime;
      }
    });
  },

  // Handle visibility changes
  setupVisibilityHandlers() {
    document.addEventListener('visibilitychange', () => {
      const state = document.hidden ? '📵 HIDDEN' : '📱 VISIBLE';
      console.log(`[VISIBILITY] ${state}`);
    });
  },

  // Update lock screen metadata
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

    const state = this.audioElement.paused ? 'paused' : 'playing';
    navigator.mediaSession.playbackState = state;
  },

  // Get frequency data for visualizations
  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    
    try {
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(data);
      return data;
    } catch (e) {
      return new Uint8Array(0);
    }
  },

  // Force playback (nuclear option)
  forcePlayback() {
    console.log('🔊 [FORCE PLAYBACK] Forcing audio to play...');
    
    if (!this.isPlaying) {
      console.log('✗ Not in playing state');
      return;
    }

    // Resume context
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('✓ Context resumed');
      }).catch(e => console.error(`✗ Resume failed: ${e}`));
    }

    // Ensure element settings
    this.audioElement.muted = false;
    this.audioElement.volume = 1;

    // Force play
    if (this.audioElement.paused) {
      this.audioElement.play().then(() => {
        console.log('✓ Playback forced');
      }).catch(e => console.error(`✗ Play failed: ${e}`));
    }
  }
};

console.log('🎵 Background Audio Module Loaded');

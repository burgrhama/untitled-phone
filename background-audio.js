// ===== BACKGROUND AUDIO WITH PROPER WEB AUDIO ROUTING =====
// Creates a parallel audio stream for background playback
// Keeps audio playing when tab loses focus

const BackgroundAudio = {
  audioElement: null,
  audioContext: null,
  analyser: null,
  source: null,
  isPlaying: false,
  playCheckInterval: null,
  
  init(audioElement) {
    this.audioElement = audioElement;
    this.setupAudioContext();
    this.setupPlaybackHandlers();
    this.setupVisibilityHandlers();
    this.setupMediaSession();
    this.preventPauseOnBlur();
    console.log('🎵 Background audio initialized with Web Audio routing');
  },

  // Create Web Audio context ONCE and keep it alive
  setupAudioContext() {
    if (this.audioContext) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Auto-resume on any user interaction
      const resumeAudio = () => {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().then(() => {
            console.log('✓ Audio context resumed');
          }).catch(e => console.error('Resume failed:', e));
        }
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('touchstart', resumeAudio);
      };
      
      document.addEventListener('click', resumeAudio);
      document.addEventListener('touchstart', resumeAudio);
      
      console.log('✓ Web Audio context created');
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  },

  // Connect audio element to Web Audio for background playback
  connectMediaElement() {
    if (!this.audioContext || this.source) return;
    
    try {
      this.source = this.audioContext.createMediaElementAudioSource(this.audioElement);
      
      // Create analyser for particle effects (optional)
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // Route: source → analyser → destination
      // This allows BOTH visualization AND audio output
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      console.log('✓ Audio element connected to Web Audio destination');
      return true;
    } catch (e) {
      console.error('Failed to connect media element:', e);
      return false;
    }
  },

  // Track playback state
  setupPlaybackHandlers() {
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      console.log('▶ Audio started playing');
      
      // Ensure audio context is running
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Connect media element on first play
      if (!this.source) {
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
      console.error('✗ Audio error:', e.error);
      this.isPlaying = false;
    });
  },

  // CRITICAL: Prevent browser from muting backgrounded tabs
  preventPauseOnBlur() {
    // Resume audio context on blur to prevent muting
    window.addEventListener('blur', () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(e => console.error('Resume on blur failed:', e));
      }
      
      // Also ensure audio element keeps playing
      if (this.isPlaying && this.audioElement.paused) {
        console.log('📵 Tab blurred, resuming audio');
        this.audioElement.play().catch(e => console.error('Play on blur failed:', e));
      }
    });

    // Also handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📵 App backgrounded');
        // Keep audio context alive
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(e => {});
        }
      } else {
        console.log('📱 App foregrounded');
        // Resume if paused
        if (this.isPlaying && this.audioElement.paused) {
          this.audioElement.play().catch(e => console.error('Play on foreground failed:', e));
        }
      }
    });
  },

  // Periodically ensure playback continues
  ensurePlayback() {
    if (this.playCheckInterval) {
      clearInterval(this.playCheckInterval);
    }

    this.playCheckInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(this.playCheckInterval);
        return;
      }

      // Resume audio context if it got suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(e => {});
      }

      // If should be playing but isn't, resume
      if (this.audioElement.paused && this.isPlaying) {
        console.log('🔊 Audio paused unexpectedly, resuming');
        this.audioElement.play().catch(e => {
          console.error('Resume failed:', e);
        });
      }
    }, 500); // Check every 500ms for responsiveness

    // Clear interval when audio ends
    const onEnded = () => {
      if (this.playCheckInterval) {
        clearInterval(this.playCheckInterval);
      }
      this.audioElement.removeEventListener('ended', onEnded);
    };
    this.audioElement.addEventListener('ended', onEnded);
  },

  // Media Session API for lock screen controls
  setupMediaSession() {
    if (!navigator.mediaSession) {
      console.log('Media Session API not available');
      return;
    }

    navigator.mediaSession.setActionHandler('play', () => {
      this.audioElement.play().catch(e => console.error('Play failed:', e));
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

    navigator.mediaSession.setActionHandler('seek', (event) => {
      if (event.seekTime !== undefined) {
        this.audioElement.currentTime = event.seekTime;
      }
    });

    console.log('✓ Media Session API initialized');
  },

  // Handle visibility changes
  setupVisibilityHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (this.isPlaying) {
        if (document.hidden) {
          console.log('📱 App backgrounded, maintaining audio');
        } else {
          console.log('📱 App foregrounded');
        }
      }
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

  // Get frequency data for particles (optional visualization)
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

  // Force playback (manual override)
  forcePlayback() {
    if (!this.isPlaying) {
      console.log('Not currently playing, cannot force');
      return;
    }

    if (this.audioElement.paused) {
      console.log('🔊 Forcing audio to play');
      this.audioElement.play().catch(e => {
        console.error('Force play failed:', e);
      });
    }

    // Resume audio context
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(e => {});
    }
  }
};

console.log('🎵 Background audio module with Web Audio routing loaded');

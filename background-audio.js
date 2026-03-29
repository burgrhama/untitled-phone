// ===== PERSISTENT BACKGROUND AUDIO PLAYBACK =====
// Keeps audio playing even when browser tab loses focus
// Uses Web Audio API to maintain playback state independently

const BackgroundAudio = {
  audioElement: null,
  audioContext: null,
  analyser: null,
  source: null,
  isPlaying: false,
  playbackStartTime: 0,
  pausedTime: 0,
  wakeLock: null,
  
  init(audioElement) {
    this.audioElement = audioElement;
    this.setupAudioContext();
    this.setupPlaybackHandlers();
    this.setupVisibilityHandlers();
    this.setupMediaSession();
    this.preventPauseOnBlur();
    this.setupWakeLock();
    console.log('Persistent background audio initialized');
  },

  // Initialize Web Audio API for independent playback control
  setupAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      
      // Resume context on first user interaction
      if (this.audioContext.state === 'suspended') {
        document.addEventListener('click', () => {
          this.audioContext?.resume();
        }, { once: true });
      }
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  },

  // Connect audio element to Web Audio API
  setupAudioSource() {
    if (!this.audioContext || this.source) return;
    
    try {
      this.source = this.audioContext.createMediaElementAudioSource(this.audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      console.log('Audio source connected to Web Audio API');
    } catch (e) {
      console.log('Audio source already connected');
    }
  },

  // Intercept play/pause to maintain state independently
  setupPlaybackHandlers() {
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.playbackStartTime = Date.now() - (this.audioElement.currentTime * 1000);
      this.ensurePlayback();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.pausedTime = this.audioElement.currentTime;
    });

    // Resume audio context when audio starts
    this.audioElement.addEventListener('play', () => {
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume().catch(e => console.error('Resume failed:', e));
      }
      this.setupAudioSource();
    });
  },

  // Prevent browser from pausing when tab loses focus
  preventPauseOnBlur() {
    window.addEventListener('blur', () => {
      console.log('Window blurred, isPlaying:', this.isPlaying, 'audio paused:', this.audioElement.paused);
      if (this.isPlaying && this.audioElement.paused) {
        console.log('Tab blurred, resuming audio');
        this.audioElement.play().catch(e => console.error('Play on blur failed:', e));
      }
    });

    // Also prevent pause when document becomes hidden
    document.addEventListener('visibilitychange', () => {
      console.log('Visibility change, hidden:', document.hidden, 'isPlaying:', this.isPlaying, 'audio paused:', this.audioElement.paused);
      if (document.hidden && this.isPlaying && this.audioElement.paused) {
        console.log('Document hidden, resuming audio');
        setTimeout(() => {
          this.audioElement.play().catch(e => console.error('Play on visibility hidden failed:', e));
        }, 100);
      } else if (!document.hidden && this.isPlaying && this.audioElement.paused) {
        console.log('Document visible, ensuring audio plays');
        this.audioElement.play().catch(e => console.error('Play on visibility visible failed:', e));
      }
    });
  },

  // Setup Wake Lock to prevent screen from turning off during playback
  setupWakeLock() {
    if ('wakeLock' in navigator) {
      this.audioElement.addEventListener('play', async () => {
        try {
          this.wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake lock acquired');
        } catch (e) {
          console.warn('Wake lock not available:', e);
        }
      });

      this.audioElement.addEventListener('pause', async () => {
        if (this.wakeLock) {
          try {
            await this.wakeLock.release();
            this.wakeLock = null;
            console.log('Wake lock released');
          } catch (e) {
            console.error('Wake lock release failed:', e);
          }
        }
      });

      // Re-acquire wake lock if document becomes visible again
      document.addEventListener('visibilitychange', async () => {
        if (!document.hidden && this.isPlaying && !this.wakeLock) {
          try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake lock re-acquired');
          } catch (e) {
            console.warn('Wake lock re-acquire failed:', e);
          }
        }
      });
    } else {
      console.log('Wake Lock API not supported');
    }
  },

  // Ensure playback continues even if browser pauses
  ensurePlayback() {
    if (!this.isPlaying) return;

    // Check every 500ms if audio should be playing but isn't
    const checkInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(checkInterval);
        return;
      }

      // If audio should be playing but browser paused it, resume
      if (this.audioElement.paused && this.isPlaying && !document.hidden) {
        console.log('Audio paused unexpectedly, resuming');
        this.audioElement.play().catch(e => console.error('Resume failed:', e));
      }

      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume().catch(e => {});
      }
    }, 500);

    // Clear interval when audio ends
    const onEnded = () => {
      clearInterval(checkInterval);
      this.audioElement.removeEventListener('ended', onEnded);
    };
    this.audioElement.addEventListener('ended', onEnded);
  },

  // Media Session API for lock screen controls
  setupMediaSession() {
    if (!navigator.mediaSession) return;

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
  },

  // Handle visibility changes
  setupVisibilityHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (this.isPlaying) {
        if (document.hidden) {
          console.log('App backgrounded, maintaining playback');
        } else {
          console.log('App foregrounded, resuming if paused');
          if (this.audioElement.paused) {
            this.audioElement.play().catch(e => console.error('Play failed:', e));
          }
        }
      }
    });

    // Also monitor page visibility through lifecycle events
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('audioPlayingState', JSON.stringify({
        isPlaying: this.isPlaying,
        currentTime: this.audioElement.currentTime,
        trackIndex: window.currentTrackIndex
      }));
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

  // iOS specific: Keep context alive during suspension
  setupIOSAudioHandling() {
    // Resume audio context every 100ms if it's suspended
    const resumeInterval = setInterval(() => {
      if (this.isPlaying && this.audioContext?.state === 'suspended') {
        this.audioContext.resume().catch(e => {});
      }
    }, 100);

    // Stop checking when audio ends
    this.audioElement.addEventListener('ended', () => {
      clearInterval(resumeInterval);
    });
  },

  // Force playback to continue (aggressive)
  forcePlayback() {
    if (!this.isPlaying) return;

    if (this.audioElement.paused) {
      this.audioElement.play().catch(e => {
        console.error('Force play failed:', e);
        // Try again with slight delay
        setTimeout(() => this.audioElement.play().catch(() => {}), 100);
      });
    }

    // Resume audio context
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(e => {});
    }
  }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundAudio;
}

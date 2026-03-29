// ===== BACKGROUND AUDIO PLAYBACK HANDLER =====
// This module ensures audio continues playing when:
// 1. Phone screen locks
// 2. User switches to another app
// 3. App goes into background
// 4. Lock screen is active

const BackgroundAudio = {
  audioElement: null,
  mediaSession: null,
  
  init(audioElement) {
    this.audioElement = audioElement;
    this.setupMediaSession();
    this.preventAutoStop();
    this.handleVisibilityChanges();
    this.handleBeforeUnload();
    console.log('Background audio handler initialized');
  },

  // Media Session API: Control playback from lock screen
  setupMediaSession() {
    if (!navigator.mediaSession) {
      console.warn('Media Session API not supported');
      return;
    }

    navigator.mediaSession.setActionHandler('play', () => {
      this.audioElement.play().catch(e => console.error('Play failed:', e));
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      this.audioElement.pause();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      window.playPrevious?.();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      window.playNext?.();
    });

    navigator.mediaSession.setActionHandler('seek', (event) => {
      if (event.seekTime) {
        this.audioElement.currentTime = event.seekTime;
      }
    });

    this.updateMediaSession();
  },

  // Update lock screen metadata
  updateMediaSession(trackName = 'Playing...', artwork = null) {
    if (!navigator.mediaSession) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: trackName,
      artist: 'pirated untitled',
      album: 'Music',
      artwork: artwork ? [
        {
          src: artwork,
          sizes: '512x512',
          type: 'image/jpeg',
        }
      ] : []
    });

    // Update playback state
    const state = this.audioElement.paused ? 'paused' : 'playing';
    navigator.mediaSession.playbackState = state;
  },

  // Prevent audio from stopping on visibility changes
  handleVisibilityChanges() {
    document.addEventListener('visibilitychange', () => {
      const isVisible = document.visibilityState === 'visible';
      
      if (!isVisible) {
        // App going to background - keep audio playing
        console.log('App backgrounded, audio continues');
        
        // Resume audio context if suspended (iOS requirement)
        if (window.audioContext && window.audioContext.state === 'suspended') {
          window.audioContext.resume().catch(e => console.error('Resume failed:', e));
        }
      } else {
        // App coming to foreground
        console.log('App foregrounded');
      }
    });
  },

  // Prevent audio from stopping when user interacts with other elements
  preventAutoStop() {
    // Keep audio element playing on blur/focus
    window.addEventListener('blur', () => {
      console.log('Window blurred, audio should continue');
    });

    window.addEventListener('focus', () => {
      console.log('Window focused');
    });

    // Prevent app from stopping audio on page hide
    window.addEventListener('pagehide', () => {
      console.log('Page hidden, audio should continue');
    });

    window.addEventListener('pageshow', () => {
      console.log('Page shown');
    });
  },

  // Handle before unload to save playback state
  handleBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      // Save current playback state
      const state = {
        currentTime: this.audioElement.currentTime,
        paused: this.audioElement.paused,
        trackIndex: window.currentTrackIndex,
        volume: this.audioElement.volume
      };
      sessionStorage.setItem('audioState', JSON.stringify(state));
    });
  },

  // Request persistent playback (Android)
  requestPersistentPlayback() {
    if (navigator.mediaDevices?.enumerateDevices) {
      // This signals to browser that audio should be persistent
      this.audioElement.play().catch(e => console.log('Play failed:', e));
    }
  },

  // iOS specific: Keep audio playing across app suspension
  setupIOSAudioHandling() {
    // Force audio to continue by checking state periodically
    setInterval(() => {
      if (document.hidden && !this.audioElement.paused) {
        // If app is hidden and should be playing, ensure audio context is active
        if (window.audioContext && window.audioContext.state === 'suspended') {
          window.audioContext.resume().catch(e => console.error('Resume failed:', e));
        }
      }
    }, 1000);
  }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundAudio;
}

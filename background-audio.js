// ===== PERSISTENT BACKGROUND AUDIO PLAYBACK =====
// Keeps audio playing even when browser tab loses focus
// Uses simple blur/visibility detection without interfering with audio routing

const BackgroundAudio = {
  audioElement: null,
  isPlaying: false,
  playCheckInterval: null,
  
  init(audioElement) {
    this.audioElement = audioElement;
    this.setupPlaybackHandlers();
    this.setupVisibilityHandlers();
    this.setupMediaSession();
    this.preventPauseOnBlur();
    console.log('Persistent background audio initialized');
  },

  // Track playback state
  setupPlaybackHandlers() {
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      console.log('Audio started playing');
      this.ensurePlayback();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      console.log('Audio paused');
      if (this.playCheckInterval) {
        clearInterval(this.playCheckInterval);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      console.log('Audio ended');
      if (this.playCheckInterval) {
        clearInterval(this.playCheckInterval);
      }
    });
  },

  // Prevent browser from pausing when tab loses focus
  preventPauseOnBlur() {
    window.addEventListener('blur', () => {
      if (this.isPlaying && this.audioElement.paused) {
        console.log('Tab blurred, resuming audio');
        this.audioElement.play().catch(e => console.error('Play on blur failed:', e));
      }
    });

    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Document hidden');
      } else if (this.isPlaying && this.audioElement.paused) {
        console.log('Document visible, resuming if paused');
        this.audioElement.play().catch(e => console.error('Play on visibility failed:', e));
      }
    });
  },

  // Periodically check if audio should be playing
  ensurePlayback() {
    if (this.playCheckInterval) {
      clearInterval(this.playCheckInterval);
    }

    this.playCheckInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(this.playCheckInterval);
        return;
      }

      // If should be playing but isn't, resume
      if (this.audioElement.paused && this.isPlaying) {
        console.log('Audio paused unexpectedly, resuming');
        this.audioElement.play().catch(e => {
          console.error('Resume failed:', e);
        });
      }
    }, 1000); // Check every 1 second

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

    console.log('Media Session API initialized');
  },

  // Handle visibility changes
  setupVisibilityHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (this.isPlaying) {
        if (document.hidden) {
          console.log('App backgrounded, maintaining playback');
        } else {
          console.log('App foregrounded');
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

  // Force playback (manual override)
  forcePlayback() {
    if (!this.isPlaying) {
      console.log('Not currently playing, cannot force');
      return;
    }

    if (this.audioElement.paused) {
      console.log('Forcing audio to play');
      this.audioElement.play().catch(e => {
        console.error('Force play failed:', e);
      });
    }
  }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundAudio;
}

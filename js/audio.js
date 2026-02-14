/**
 * Valentine's Card - Audio Module
 * ES Module for background music playback with toggle control
 */

// Audio configuration
const AUDIO_CONFIG = {
  src: 'audio/song.mp3', // User replaces with their audio file
  loop: true,
  volume: 0.7
};

// Create Audio element
const audio = new Audio();
audio.src = AUDIO_CONFIG.src;
audio.loop = AUDIO_CONFIG.loop;
audio.volume = AUDIO_CONFIG.volume;

/**
 * Toggle audio playback
 * @returns {boolean} Current playing state (true = playing, false = paused)
 */
export function toggleAudio() {
  if (audio.paused) {
    audio.play().then(() => {
      console.log('Audio playing');
    }).catch(err => {
      console.warn('Audio play failed:', err.name);
    });
    return true;
  } else {
    audio.pause();
    console.log('Audio paused');
    return false;
  }
}

/**
 * Start audio playback (called on app:started event)
 */
function startAudio() {
  audio.play().then(() => {
    console.log('Audio playing');
  }).catch(err => {
    console.warn('Audio playback failed:', err.name);
    // This is expected if no audio file exists yet
  });
}

// Listen for app:started event to begin playback
document.addEventListener('app:started', startAudio);

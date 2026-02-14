/**
 * Valentine's Card - Message Module
 * ES Module for message reveal with confetti celebration
 */

import { toggleAudio } from './audio.js';

// DOM references
const revealBtn = document.getElementById('reveal-btn');
const message = document.getElementById('message');
const audioToggle = document.getElementById('audio-toggle');

/**
 * Fire Valentine-themed confetti burst
 * Uses heart emoji shapes with pink/red colors
 */
function valentineConfetti() {
  // Valentine colors
  const colors = ['#ff69b4', '#ff1493', '#dc143c', '#ff85a1', '#ffc0cb'];

  // Heart shape using emoji
  const scalar = 2;
  const heart = confetti.shapeFromText({ text: '❤️', scalar });

  const defaults = {
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
    shapes: [heart, 'circle'],
    scalar: 1.5
  };

  // Fire 3 bursts with staggered timing for dramatic effect
  confetti({ ...defaults, particleCount: 50 });
  setTimeout(() => confetti({ ...defaults, particleCount: 30 }), 100);
  setTimeout(() => confetti({ ...defaults, particleCount: 20 }), 200);
}

/**
 * Reveal the personal message and trigger celebration
 */
function revealMessage() {
  // Show message with animation
  message.hidden = false;
  message.classList.add('revealed');

  // Fire confetti celebration
  valentineConfetti();

  // Hide reveal button
  revealBtn.hidden = true;
}

/**
 * Handle audio toggle button click
 * Updates button state and icon based on audio playing state
 */
function handleAudioToggle() {
  const isPlaying = toggleAudio();
  const icon = audioToggle.querySelector('.audio-icon');

  // Update aria-pressed to reflect current state
  audioToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');

  // Update icon
  icon.textContent = isPlaying ? '🔊' : '🔇';
}

// Set up event listeners
if (revealBtn) {
  revealBtn.addEventListener('click', revealMessage);
}

if (audioToggle) {
  audioToggle.addEventListener('click', handleAudioToggle);
}

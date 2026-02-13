/**
 * Hearts Animation Module
 * Spawns floating heart elements for ambient decoration
 */

const HEART_COUNT = 6;

/**
 * Create heart elements and append to container
 * Hearts animate continuously via CSS - this just spawns the DOM elements
 */
function createHearts() {
  const container = document.getElementById('hearts-container');
  if (!container) return;

  for (let i = 0; i < HEART_COUNT; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    container.appendChild(heart);
  }
}

// Initialize immediately - hearts run on start screen too
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createHearts);
} else {
  createHearts();
}

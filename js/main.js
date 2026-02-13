/**
 * Valentine's Card - Main Entry Point
 * ES Module for click-to-start interaction
 */

// Application state
const state = {
  started: false
};

/**
 * Initialize the application
 * Sets up click handler for start button
 */
function init() {
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const mainContent = document.getElementById('main-content');

  startButton.addEventListener('click', () => {
    // Guard against double-clicks
    if (state.started) return;

    state.started = true;

    // Transition screens
    startScreen.classList.add('hidden');
    mainContent.classList.remove('hidden');

    // Dispatch custom event for Phase 3 audio handling
    document.dispatchEvent(new CustomEvent('app:started'));

    console.log('App started - user gesture captured');
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export state for potential use by other modules
export { state };

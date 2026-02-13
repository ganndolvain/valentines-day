/**
 * Gallery Module
 * Handles polaroid reveal animation and lightbox interaction
 */

const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox?.querySelector('.lightbox-image');
const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
const gallery = document.querySelector('.gallery');

/**
 * Open lightbox with photo
 * @param {string} src - Image source URL
 * @param {string} alt - Image alt text
 * @param {string} caption - Caption text
 */
function openLightbox(src, alt, caption) {
  if (!lightbox || !lightboxImg) return;

  lightboxImg.src = src;
  lightboxImg.alt = alt;
  if (lightboxCaption) {
    lightboxCaption.textContent = caption || '';
  }
  lightbox.showModal();
}

/**
 * Initialize gallery interactions
 */
function initGallery() {
  // Lightbox: close on backdrop click
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.close();
    }
  });

  // Polaroid click handlers
  document.querySelectorAll('.polaroid').forEach(polaroid => {
    polaroid.addEventListener('click', () => {
      const img = polaroid.querySelector('img');
      const caption = polaroid.querySelector('figcaption')?.textContent;
      if (img) {
        openLightbox(img.src, img.alt, caption);
      }
    });

    // Keyboard accessibility
    polaroid.setAttribute('tabindex', '0');
    polaroid.setAttribute('role', 'button');
    polaroid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        polaroid.click();
      }
    });
  });
}

/**
 * Trigger reveal animation
 */
function revealGallery() {
  if (gallery) {
    gallery.classList.add('revealed');
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGallery);
} else {
  initGallery();
}

// Reveal gallery when app starts (listen for custom event from main.js)
document.addEventListener('app:started', revealGallery);

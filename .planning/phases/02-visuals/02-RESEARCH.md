# Phase 2: Visuals - Research

**Researched:** 2026-02-13
**Domain:** CSS animations (floating hearts) and polaroid-style photo layouts with lightbox
**Confidence:** HIGH

## Summary

Phase 2 implements two distinct visual features: continuously floating hearts animation and polaroid-style scattered photos with lightbox interaction. Both features can be built with pure CSS animations and vanilla JavaScript, staying consistent with the project's no-framework approach established in Phase 1.

For hearts animation, the standard approach uses CSS `@keyframes` with `transform: translate()` for GPU-accelerated performance, combined with SVG mask-image for the heart shape. Multiple heart elements with staggered `animation-delay` values create an organic, continuous floating effect.

For polaroid photos, the established pattern uses CSS `transform: rotate()` with `:nth-child()` selectors to create varied scattered angles. The lightbox can be built using the native HTML `<dialog>` element with `showModal()`, providing built-in accessibility (focus trapping, Escape to close) without external dependencies.

**Primary recommendation:** Use pure CSS animations for hearts (GPU-accelerated transforms), CSS transforms with nth-child for polaroid scatter, native `<dialog>` element for lightbox, and staggered `animation-delay` for sequential photo reveal.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS `@keyframes` | N/A | Heart float animation | Native, GPU-accelerated, no dependencies |
| CSS `transform` | N/A | Movement and rotation | GPU-composited, performant on mobile |
| HTML `<dialog>` | N/A | Lightbox modal | Native element with built-in accessibility |
| CSS `mask-image` | N/A | Heart shape from SVG | No image files needed, scalable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Google Fonts (Caveat or Patrick Hand) | N/A | Handwritten caption text | Polaroid caption styling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<dialog>` | GLightbox (11KB) | More features (swipe, zoom) but adds dependency |
| Native `<dialog>` | basicLightbox | Very light but still a dependency |
| CSS mask-image | Unicode emoji | Less control over styling and size |
| CSS animations | GSAP | More powerful but overkill for simple float |

**Installation:**
```html
<!-- Google Fonts for handwritten caption text -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap" rel="stylesheet">
```

No npm packages required - all features use native browser APIs.

## Architecture Patterns

### Recommended Project Structure
```
project-root/
├── index.html          # Add hearts container, photo gallery, dialog
├── css/
│   └── style.css       # Add hearts animation, polaroid styles, lightbox
├── js/
│   ├── main.js         # Existing entry point
│   ├── hearts.js       # Heart animation initialization
│   └── gallery.js      # Photo gallery and lightbox logic
└── images/
    └── photos/         # Polaroid images (5-7 photos)
```

### Pattern 1: GPU-Accelerated Float Animation
**What:** Hearts float upward using `transform: translateY()` instead of `top`/`bottom`
**When to use:** Any continuous animation that needs 60fps on mobile
**Example:**
```css
/* Source: Smashing Magazine GPU Animation, MDN transform */
.heart {
  position: absolute;
  will-change: transform, opacity;
  animation: float-up 8s infinite ease-in-out;
}

@keyframes float-up {
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0;
  }
}
```

### Pattern 2: Polaroid Scattered Layout with nth-child
**What:** Varied rotations using CSS selectors, no JavaScript randomization needed
**When to use:** Fixed number of items with organic scattered appearance
**Example:**
```css
/* Source: ZURB CSS3 Polaroids */
.polaroid {
  transform: rotate(-2deg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.polaroid:nth-child(even) {
  transform: rotate(2deg);
}

.polaroid:nth-child(3n) {
  transform: rotate(-4deg);
}

.polaroid:nth-child(5n) {
  transform: rotate(5deg);
}

.polaroid:hover {
  transform: scale(1.05) rotate(0deg);
  z-index: 10;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
```

### Pattern 3: Native Dialog Lightbox
**What:** Using `<dialog>` element for modal with built-in accessibility
**When to use:** Any modal/lightbox that needs focus management and Escape key handling
**Example:**
```javascript
/* Source: Polypane Dialog Lightbox Tutorial */
const dialog = document.querySelector('dialog.lightbox');
const img = dialog.querySelector('img');

function openLightbox(photoSrc, photoAlt) {
  img.src = photoSrc;
  img.alt = photoAlt;
  dialog.showModal(); // Handles focus trapping, Escape key
}

// Close on backdrop click
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});
```

### Pattern 4: Staggered Animation with CSS Custom Properties
**What:** Sequential reveal using inline CSS variables for delay calculation
**When to use:** Animating a known number of items in sequence
**Example:**
```html
<!-- Source: Cloud Four Staggered Animations -->
<div class="polaroid" style="--i: 0">...</div>
<div class="polaroid" style="--i: 1">...</div>
<div class="polaroid" style="--i: 2">...</div>
```
```css
.polaroid {
  animation: deal-card 0.6s ease-out forwards;
  animation-delay: calc(var(--i) * 0.8s);
  opacity: 0;
}

@keyframes deal-card {
  from {
    opacity: 0;
    transform: translateY(-50px) rotate(0deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(var(--rotation)) scale(1);
  }
}
```

### Anti-Patterns to Avoid
- **Animating `top`/`left`/`bottom`:** Causes layout recalculation, janky on mobile. Use `transform: translate()` instead.
- **Overusing `will-change`:** Applying to many elements wastes GPU memory. Only use on animated elements.
- **JavaScript-driven continuous animations:** `setInterval` for movement is less efficient than CSS `@keyframes`.
- **Custom modal without focus management:** Native `<dialog>` handles this automatically; DIY modals often miss accessibility.
- **Random values on every page load:** Can look chaotic. Use deterministic nth-child patterns for consistent scatter.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Heart shape | CSS pseudo-elements (::before, ::after rotated squares) | SVG with mask-image | Cleaner code, easier to style colors |
| Modal focus trapping | Manual focusable element tracking | Native `<dialog>` showModal() | Built-in, accessible, handles edge cases |
| Escape key to close | Manual keydown listener | Native `<dialog>` | Automatic with showModal() |
| Smooth animation timing | Manual JavaScript timing | CSS `cubic-bezier()` or `ease-in-out` | Browser-optimized, declarative |
| Staggered delays for N items | JavaScript loops setting inline styles | CSS `--i` variable + calc() | Cleaner, no JS needed for known counts |

**Key insight:** The `<dialog>` element eliminates the need for custom lightbox libraries. It provides focus trapping, Escape-to-close, and backdrop click handling natively since full browser support in 2022.

## Common Pitfalls

### Pitfall 1: Animation Jank on Mobile
**What goes wrong:** Hearts stutter or animations drop frames on mobile devices
**Why it happens:** Animating non-composited properties (top, left, width, height) triggers layout recalculation
**How to avoid:** Only animate `transform` and `opacity` - these are GPU-composited
**Warning signs:** Smooth on desktop, choppy on phone; DevTools shows high "Layout" time

### Pitfall 2: Hearts Blocking Interaction
**What goes wrong:** Users can't click polaroids because hearts are in the way
**Why it happens:** Heart container covers clickable elements
**How to avoid:** Use `pointer-events: none` on hearts container, ensure proper z-index layering
**Warning signs:** Clicks don't register on photos, hover states don't trigger

### Pitfall 3: Dialog Not Closing on Backdrop Click
**What goes wrong:** User clicks outside lightbox image but nothing happens
**Why it happens:** Click event target is the dialog content, not the dialog itself
**How to avoid:** Check `event.target === dialog` before calling `close()`
**Warning signs:** Have to click X button or press Escape to close

### Pitfall 4: Photos Load Before Animation
**What goes wrong:** Photos visible before "dealt" animation plays, then animate in place
**Why it happens:** Images are visible by default, animation only runs once
**How to avoid:** Set initial `opacity: 0` and use `animation-fill-mode: forwards`
**Warning signs:** Brief flash of all photos before staggered animation

### Pitfall 5: Ignoring prefers-reduced-motion
**What goes wrong:** Users with vestibular disorders experience discomfort
**Why it happens:** Not respecting accessibility preference for reduced motion
**How to avoid:** Wrap animations in `@media (prefers-reduced-motion: no-preference)` or provide static fallback
**Warning signs:** No alternative for users who disable system animations

### Pitfall 6: Lightbox Image Sizing
**What goes wrong:** Small images blown up look pixelated; large images overflow viewport
**Why it happens:** Fixed dimensions or no max-width constraints
**How to avoid:** Use `max-width: 90vw; max-height: 90vh; object-fit: contain` on lightbox image
**Warning signs:** Images cropped, pixelated, or causing horizontal scroll

## Code Examples

Verified patterns from official sources:

### Complete Heart Animation CSS
```css
/* Source: thisdevbrain.com floating hearts, modified for GPU performance */
.hearts-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.heart {
  position: absolute;
  bottom: -50px;
  width: var(--size, 30px);
  height: var(--size, 30px);
  background-color: var(--color, #ff69b4);
  opacity: 0;
  /* SVG heart mask from Font Awesome */
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z'/%3E%3C/svg%3E");
  mask-size: contain;
  -webkit-mask-size: contain;
  animation: float-heart 8s infinite ease-in-out;
}

@keyframes float-heart {
  0% {
    transform: translateY(0) translateX(0) scale(0.5);
    opacity: 0;
  }
  5% {
    opacity: 0.7;
  }
  50% {
    transform: translateY(-50vh) translateX(20px);
  }
  95% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-110vh) translateX(-10px) scale(1);
    opacity: 0;
  }
}

/* Staggered hearts with varied properties */
.heart:nth-child(1) { left: 10%; --size: 20px; --color: #ff69b4; animation-delay: 0s; animation-duration: 7s; }
.heart:nth-child(2) { left: 30%; --size: 35px; --color: #ff1493; animation-delay: 1.5s; animation-duration: 9s; }
.heart:nth-child(3) { left: 50%; --size: 25px; --color: #ff69b4; animation-delay: 3s; animation-duration: 8s; }
.heart:nth-child(4) { left: 70%; --size: 40px; --color: #dc143c; animation-delay: 2s; animation-duration: 10s; }
.heart:nth-child(5) { left: 85%; --size: 22px; --color: #ff69b4; animation-delay: 4s; animation-duration: 7.5s; }
.heart:nth-child(6) { left: 20%; --size: 30px; --color: #ff1493; animation-delay: 5s; animation-duration: 8.5s; }

/* Accessibility: respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .heart {
    animation: none;
    opacity: 0.5;
    bottom: auto;
    top: 10%;
  }
}
```

### Complete Polaroid CSS
```css
/* Source: ZURB CSS3 Polaroids, Line25 Tutorial */
.gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  position: relative;
}

.polaroid {
  background: #fff;
  padding: 0.75rem 0.75rem 2.5rem;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.1),
    0 4px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* Base rotation */
  transform: rotate(-2deg);
  /* Initial state for deal animation */
  opacity: 0;
  animation: deal-polaroid 0.5s ease-out forwards;
}

.polaroid img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  display: block;
}

.polaroid figcaption {
  font-family: 'Caveat', cursive;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 0.5rem;
  color: #333;
}

/* Scattered rotations */
.polaroid:nth-child(even) { transform: rotate(3deg); }
.polaroid:nth-child(3n) { transform: rotate(-4deg); }
.polaroid:nth-child(4n) { transform: rotate(5deg); }
.polaroid:nth-child(5n) { transform: rotate(-1deg); }

/* Hover lift effect */
.polaroid:hover,
.polaroid:focus {
  transform: scale(1.05) rotate(0deg);
  box-shadow:
    0 8px 16px rgba(0,0,0,0.15),
    0 16px 32px rgba(0,0,0,0.1);
  z-index: 10;
}

/* Staggered deal animation */
.polaroid:nth-child(1) { animation-delay: 0s; }
.polaroid:nth-child(2) { animation-delay: 0.7s; }
.polaroid:nth-child(3) { animation-delay: 1.4s; }
.polaroid:nth-child(4) { animation-delay: 2.1s; }
.polaroid:nth-child(5) { animation-delay: 2.8s; }
.polaroid:nth-child(6) { animation-delay: 3.5s; }
.polaroid:nth-child(7) { animation-delay: 4.2s; }

@keyframes deal-polaroid {
  from {
    opacity: 0;
    transform: translateY(-30px) rotate(0deg) scale(0.9);
  }
  to {
    opacity: 1;
    /* Final rotation handled by nth-child rules */
  }
}

/* Mobile responsive */
@media (max-width: 600px) {
  .polaroid img {
    width: 120px;
    height: 120px;
  }

  .polaroid {
    padding: 0.5rem 0.5rem 2rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .polaroid {
    animation: none;
    opacity: 1;
    transition: none;
  }
}
```

### Native Dialog Lightbox
```html
<!-- Source: Polypane Dialog Lightbox -->
<dialog class="lightbox" aria-label="Photo viewer">
  <form method="dialog">
    <button type="submit" class="lightbox-close" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </form>
  <img src="" alt="" class="lightbox-image">
  <p class="lightbox-caption"></p>
</dialog>
```

```css
/* Source: Polypane, MDN dialog */
.lightbox {
  border: none;
  border-radius: 8px;
  padding: 0;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  box-shadow: 0 10px 50px rgba(0,0,0,0.3);
}

.lightbox::backdrop {
  background: rgba(0, 0, 0, 0.8);
}

.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
}

.lightbox-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.lightbox-caption {
  font-family: 'Caveat', cursive;
  text-align: center;
  padding: 0.5rem 1rem;
  margin: 0;
}

/* Animation */
@media (prefers-reduced-motion: no-preference) {
  .lightbox[open] {
    animation: lightbox-show 0.25s ease-out;
  }

  @keyframes lightbox-show {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
}

/* Prevent page scroll when open */
:root:has(.lightbox[open]) {
  overflow: hidden;
}
```

```javascript
// Source: Polypane Dialog Lightbox, MDN dialog
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-image');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');

function openLightbox(src, alt, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxCaption.textContent = caption || '';
  lightbox.showModal();
}

// Close on backdrop click
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.close();
  }
});

// Polaroid click handlers
document.querySelectorAll('.polaroid').forEach(polaroid => {
  polaroid.addEventListener('click', () => {
    const img = polaroid.querySelector('img');
    const caption = polaroid.querySelector('figcaption')?.textContent;
    openLightbox(img.src, img.alt, caption);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom modal with div overlay | Native `<dialog>` element | 2022 (full support) | Built-in accessibility, less code |
| jQuery lightbox plugins | Vanilla JS + dialog | 2020+ | No dependencies |
| JavaScript animation (setInterval) | CSS @keyframes | 2015+ | Better performance, GPU-accelerated |
| Vendor prefixes everywhere | Unprefixed CSS | 2020+ | Only mask-image still needs -webkit- |
| :has() unsupported | :has() fully supported | 2023+ | Can style parent based on child state |

**Deprecated/outdated:**
- **Fancybox (jQuery):** jQuery dependency unnecessary in 2026
- **Manually trapping focus in modals:** `<dialog>` handles this
- **-moz-transform prefix:** No longer needed (since Firefox 16)
- **Multiple animation libraries (Animate.css):** CSS @keyframes is sufficient for simple effects

## Open Questions

Things that couldn't be fully resolved:

1. **Exact photo dimensions**
   - What we know: Need 5-7 photos, polaroid style works best with square-ish images
   - What's unclear: What actual photos will be used, their aspect ratios
   - Recommendation: Use `object-fit: cover` to handle any aspect ratio; optimize images to ~400x400px for quality/performance balance

2. **Mobile lightbox touch gestures**
   - What we know: Native dialog doesn't support swipe-to-close
   - What's unclear: Whether swipe gestures are needed or if tap-to-close is sufficient
   - Recommendation: Start with tap-to-close (click backdrop); add swipe if user testing reveals need. Could add GLightbox later if needed.

3. **Heart density tuning**
   - What we know: 5-10 hearts on screen at a time per context doc
   - What's unclear: Exact timing for visual balance with 6-8 hearts
   - Recommendation: Start with 6 hearts, staggered delays, tune animation-duration for desired density

## Sources

### Primary (HIGH confidence)
- [MDN CSS transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) - GPU-accelerated animation properties
- [MDN dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) - Native modal implementation
- [Polypane Dialog Lightbox](https://polypane.app/blog/building-a-lightbox-with-the-dialog-element/) - Complete dialog lightbox tutorial
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) - Accessibility media query

### Secondary (MEDIUM confidence)
- [ZURB CSS3 Polaroids](https://zurb.com/playground/css3-polaroids) - Polaroid styling with nth-child rotation
- [CSS-Tricks Staggered Animation](https://css-tricks.com/different-approaches-for-creating-a-staggered-animation/) - Sequential animation techniques
- [Smashing Magazine GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) - Transform performance guidance
- [thisdevbrain Floating Hearts](https://thisdevbrain.com/css-floating-hearts-animation/) - Heart animation implementation

### Tertiary (LOW confidence)
- [Google Fonts](https://fonts.google.com/?category=Handwriting) - Handwritten font options (Caveat, Patrick Hand)
- [GLightbox](https://github.com/biati-digital/glightbox) - Alternative if native dialog insufficient

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native browser features (CSS animations, dialog element) are well-documented
- Architecture: HIGH - Patterns verified from multiple authoritative sources
- Pitfalls: HIGH - Common issues well-documented in performance guides and accessibility specs

**Research date:** 2026-02-13
**Valid until:** 90 days (stable CSS and HTML features, unlikely to change)

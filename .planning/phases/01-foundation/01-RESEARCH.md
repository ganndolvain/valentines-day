# Phase 1: Foundation - Research

**Researched:** 2026-02-13
**Domain:** Mobile-responsive web page with click-to-start interaction
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational structure for a Valentine's card web application: a mobile-responsive HTML/CSS/JS page with a click-to-start interaction that prepares the page for audio playback in later phases.

The standard approach is straightforward: vanilla HTML5, CSS3 with mobile-first responsive design, and vanilla JavaScript using ES modules. The critical technical requirement is the click-to-start pattern mandated by browser autoplay policies - browsers require a user gesture (click/tap) before allowing audio playback, so this phase must establish that interaction even though audio comes in Phase 3.

Key recommendations: Use the viewport meta tag with `width=device-width, initial-scale=1`, implement mobile-first CSS with media queries, use CSS `touch-action: manipulation` for responsive touch handling, and create a clear click-to-start UI that transitions to a "ready" state.

**Primary recommendation:** Build a simple static site structure (index.html, style.css, main.js) with mobile-first responsive CSS and a prominent click-to-start button that changes page state on interaction.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla HTML5 | N/A | Page structure | No framework needed for simple single-page site |
| Vanilla CSS3 | N/A | Styling and responsive layout | Modern CSS is fully capable without preprocessors |
| Vanilla JavaScript | ES2022+ | Interactivity and state management | Browser-native, no build step required |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Google Fonts | N/A | Typography | If custom fonts desired |
| normalize.css | 8.0.1 | CSS reset | Optional - for consistent cross-browser defaults |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla CSS | Tailwind CSS | More utility classes but requires build step - overkill for small project |
| Vanilla JS | Alpine.js | Lightweight reactivity but adds dependency - unnecessary for simple state |
| No framework | React/Vue | Component model but massive overhead for single page |

**Installation:**
```html
<!-- No npm install needed - use CDN or local files -->
<link rel="stylesheet" href="css/style.css">
<script type="module" src="js/main.js"></script>
```

## Architecture Patterns

### Recommended Project Structure
```
project-root/
├── index.html          # Single page entry point
├── css/
│   └── style.css       # All styles (mobile-first)
├── js/
│   └── main.js         # Entry point, state management
├── images/             # Photos and assets (Phase 2+)
└── audio/              # Music files (Phase 3)
```

### Pattern 1: Click-to-Start State Machine
**What:** A simple state machine that tracks whether user has interacted
**When to use:** When gating functionality behind user gesture (audio, animations)
**Example:**
```javascript
// Source: MDN Web Audio API Best Practices
const state = {
  started: false
};

const startButton = document.querySelector('#start-button');
const startScreen = document.querySelector('#start-screen');
const mainContent = document.querySelector('#main-content');

startButton.addEventListener('click', () => {
  state.started = true;
  startScreen.classList.add('hidden');
  mainContent.classList.remove('hidden');
  // AudioContext can now be created/resumed in Phase 3
});
```

### Pattern 2: Mobile-First Responsive CSS
**What:** Base styles for mobile, media queries add desktop enhancements
**When to use:** All responsive layouts
**Example:**
```css
/* Source: MDN Responsive Web Design */
/* Mobile-first: base styles are mobile */
.container {
  padding: 1rem;
  max-width: 100%;
}

.card {
  width: 100%;
}

/* Tablet and up */
@media screen and (min-width: 600px) {
  .container {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }
}

/* Desktop */
@media screen and (min-width: 1024px) {
  .container {
    max-width: 800px;
  }
}
```

### Pattern 3: Touch-Optimized Interactions
**What:** CSS that eliminates 300ms tap delay and prevents accidental zooms
**When to use:** All mobile-interactive elements
**Example:**
```css
/* Source: MDN touch-action */
button, .interactive {
  touch-action: manipulation; /* Removes double-tap delay */
  -webkit-tap-highlight-color: transparent; /* iOS highlight removal */
}

/* Prevent iOS auto-zoom on inputs */
input, textarea, select {
  font-size: 16px;
}
```

### Anti-Patterns to Avoid
- **Desktop-first CSS:** Designing for desktop then hiding/shrinking for mobile wastes bandwidth and creates poor mobile UX
- **Fixed pixel widths:** Using `width: 500px` instead of responsive units breaks on small screens
- **Ignoring touch targets:** Buttons smaller than 48x48px are hard to tap accurately
- **Using visibility:hidden for responsive hiding:** Still loads resources; use `display: none` or don't render at all

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS reset | Custom reset styles | normalize.css or browser defaults | Subtle cross-browser differences are tricky |
| Viewport handling | Manual device detection | Viewport meta tag | Browsers handle this automatically |
| Touch delay removal | JavaScript touch event workarounds | CSS `touch-action: manipulation` | Native CSS is faster and more reliable |
| Audio autoplay detection | Try-catch around play() | AudioContext state check | Official API for this purpose |

**Key insight:** Modern browsers and CSS handle most mobile complexity natively. The days of needing FastClick.js or complex touch event handlers are over.

## Common Pitfalls

### Pitfall 1: Missing Viewport Meta Tag
**What goes wrong:** Page renders at desktop width (980px on iOS Safari) then shrinks, media queries don't trigger
**Why it happens:** Forgetting the meta tag or using incorrect syntax
**How to avoid:** Always include `<meta name="viewport" content="width=device-width, initial-scale=1">` in `<head>`
**Warning signs:** Page looks zoomed out on mobile, text is tiny, media queries seem ignored

### Pitfall 2: Click Handler Not Registering User Gesture
**What goes wrong:** Audio still blocked in Phase 3 despite having a start button
**Why it happens:** User gesture must be "trusted" - some event types don't count
**How to avoid:** Use `click` event (not `touchend`, `mouseenter`, etc.) on a visible, interactive element
**Warning signs:** AudioContext stays in "suspended" state after interaction

### Pitfall 3: iOS Safari Auto-Zoom on Form Inputs
**What goes wrong:** Page zooms in when user taps an input field
**Why it happens:** Safari zooms inputs with font-size below 16px
**How to avoid:** Set `font-size: 16px` minimum on all form elements
**Warning signs:** Unexpected zoom when interacting with inputs (not critical for Phase 1 but good to know)

### Pitfall 4: Tap Targets Too Small
**What goes wrong:** Users accidentally tap wrong elements, frustrating UX
**Why it happens:** Desktop-sized buttons (32px) are too small for finger taps
**How to avoid:** Minimum 48x48px touch targets with 8px spacing between them
**Warning signs:** Users complaining about "fat finger" errors, Google Lighthouse warnings

### Pitfall 5: Horizontal Scroll on Mobile
**What goes wrong:** Page scrolls horizontally, feels broken
**Why it happens:** Fixed-width elements wider than viewport, images without max-width
**How to avoid:** Use `max-width: 100%` on images, avoid fixed widths, test at 320px width
**Warning signs:** Horizontal scrollbar visible, content cut off on edges

## Code Examples

Verified patterns from official sources:

### Complete HTML5 Foundation
```html
<!-- Source: MDN, W3Schools viewport documentation -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ff69b4"> <!-- Mobile browser chrome color -->
  <title>Valentine's Card</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Start Screen -->
  <div id="start-screen" class="screen">
    <button id="start-button" class="start-btn">
      Click to Start
    </button>
  </div>

  <!-- Main Content (hidden until started) -->
  <main id="main-content" class="screen hidden">
    <!-- Phase 2+ content goes here -->
  </main>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

### Mobile-First CSS Foundation
```css
/* Source: MDN Responsive Web Design */
/* Reset and base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 100%; /* Respects user preferences - equals 16px default */
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
}

/* Utility classes */
.hidden {
  display: none;
}

.screen {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Start button - touch optimized */
.start-btn {
  min-width: 200px;
  min-height: 48px; /* Touch target minimum */
  padding: 1rem 2rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 8px;
  background: #ff69b4;
  color: white;
  cursor: pointer;
  touch-action: manipulation; /* Remove 300ms delay */
  -webkit-tap-highlight-color: transparent;
}

.start-btn:hover, .start-btn:focus {
  background: #ff1493;
  outline: 2px solid #ff1493;
  outline-offset: 2px;
}

.start-btn:active {
  transform: scale(0.98);
}

/* Responsive images (for Phase 2+) */
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### JavaScript Click-to-Start Handler
```javascript
// Source: Chrome Autoplay Policy, MDN Web Audio Best Practices
// main.js - ES module

const state = {
  started: false
};

function init() {
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const mainContent = document.getElementById('main-content');

  startButton.addEventListener('click', () => {
    if (state.started) return; // Prevent double-clicks

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

export { state };
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FastClick.js for tap delay | CSS `touch-action: manipulation` | 2019+ (iOS 9.3+) | No JS library needed |
| `100vh` for full height | `100dvh` (dynamic viewport height) | 2022+ | Accounts for mobile browser chrome |
| Pixel breakpoints | Content-based breakpoints | 2020+ | More resilient to new device sizes |
| Media queries only | Container queries available | 2023+ | Component-based responsive design |
| `user-scalable=no` | Let users zoom | Ongoing | Accessibility requirement |

**Deprecated/outdated:**
- **FastClick.js:** No longer needed - `touch-action: manipulation` is native CSS
- **viewport user-scalable=no:** Bad for accessibility - don't disable zoom
- **-webkit-overflow-scrolling:** No longer needed in modern iOS

## Open Questions

Things that couldn't be fully resolved:

1. **Exact touch target spacing for this design**
   - What we know: Minimum 48x48px targets with 8px spacing is the guideline
   - What's unclear: Specific spacing for the start button in context of overall design
   - Recommendation: Start with centered button, adjust in implementation if needed

2. **Animation preferences for start transition**
   - What we know: CSS transitions are performant
   - What's unclear: Whether to fade, slide, or instant transition between screens
   - Recommendation: Start simple (instant), add polish if time permits

## Sources

### Primary (HIGH confidence)
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay) - User gesture requirements, AudioContext patterns
- [MDN Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) - Viewport meta tag, media queries, mobile-first
- [MDN Web Audio API Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) - AudioContext state handling
- [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) - Touch optimization CSS

### Secondary (MEDIUM confidence)
- [Responsive Web Design Best Practices 2026](https://pxlpeak.com/blog/web-design/responsive-design-best-practices) - Modern CSS techniques
- [CSS Units Guide 2025-2026](https://www.frontendtools.tech/blog/css-units-responsive-design-2025) - dvh units, modern responsive units
- [Vanilla JavaScript in 2026](https://certificates.dev/blog/vanilla-javascript-in-2026-why-you-still-cant-ignore-it) - No-framework approach validation

### Tertiary (LOW confidence)
- Various UI/UX pitfall articles - General mobile design guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Vanilla HTML/CSS/JS is well-documented, no ambiguity
- Architecture: HIGH - Simple static site structure, official responsive patterns
- Pitfalls: HIGH - Browser policies and CSS behavior are well-documented by MDN/Chrome

**Research date:** 2026-02-13
**Valid until:** 90 days (stable web platform technologies)

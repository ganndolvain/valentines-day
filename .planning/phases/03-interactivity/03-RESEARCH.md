# Phase 3: Interactivity - Research

**Researched:** 2026-02-13
**Domain:** Web Audio, Confetti Effects, Interactive Reveal
**Confidence:** HIGH

## Summary

Phase 3 implements three interactive features: background music playback, a confetti/glitter explosion effect, and a personal message reveal. The project already has the click-to-start UX with custom `app:started` event (Phase 1), making audio autoplay handling straightforward.

The key technical challenges are:
1. Playing audio after user gesture (browser autoplay policies)
2. Adding canvas-confetti via CDN (no build tools)
3. Creating a reveal interaction that triggers confetti

**Primary recommendation:** Use HTML5 Audio API triggered by the existing `app:started` event, canvas-confetti via CDN with heart-themed configuration, and a simple button-triggered message reveal with CSS animation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| HTML5 Audio API | Native | Background music playback | Built-in, no dependencies, works everywhere |
| canvas-confetti | 1.9.4 | Confetti/glitter explosion | Best-in-class, tiny (4KB), prior decision |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | - | No supporting libraries needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HTML5 Audio | Howler.js | More features, but adds 10KB+ for features we don't need |
| canvas-confetti | js-confetti | Similar, but canvas-confetti has more customization |
| CSS reveals | Animate.css | Nice presets, but overkill for one animation |

**Installation:**
```html
<!-- CDN - no npm needed for vanilla JS project -->
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>
```

## Architecture Patterns

### Recommended Project Structure
```
js/
├── main.js          # Click-to-start, app:started event (exists)
├── audio.js         # NEW: Audio controller module
├── message.js       # NEW: Message reveal + confetti trigger
├── gallery.js       # Polaroid gallery (exists)
└── hearts.js        # Hearts animation (exists)
```

### Pattern 1: Audio Controller Module
**What:** Encapsulate audio playback with play/pause toggle
**When to use:** Any background music feature
**Example:**
```javascript
// Source: MDN HTMLAudioElement + Audio autoplay best practices
const audio = new Audio('audio/song.mp3');
audio.loop = true;

// Listen for user gesture (already have app:started event)
document.addEventListener('app:started', () => {
  audio.play().catch(err => {
    console.warn('Audio play failed:', err);
  });
});

// Toggle function for play/pause button
function toggleAudio() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
  return !audio.paused; // Return current playing state
}
```

### Pattern 2: Confetti Burst on Event
**What:** Fire confetti when user triggers reveal
**When to use:** Celebration moments, reveals, achievements
**Example:**
```javascript
// Source: canvas-confetti GitHub + kirilv.com/canvas-confetti
function celebrationBurst() {
  // Heart emoji confetti for Valentine theme
  const scalar = 2;
  const heart = confetti.shapeFromText({ text: '❤️', scalar });

  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0.5,
    decay: 0.94,
    startVelocity: 20,
    shapes: [heart],
    scalar,
    origin: { y: 0.6 }
  };

  // Multiple bursts for dramatic effect
  confetti({ ...defaults, particleCount: 30 });
  setTimeout(() => confetti({ ...defaults, particleCount: 20 }), 100);
  setTimeout(() => confetti({ ...defaults, particleCount: 10 }), 200);
}
```

### Pattern 3: Message Reveal with CSS
**What:** Hidden message becomes visible on click
**When to use:** Surprise reveals, progressive disclosure
**Example:**
```javascript
// Source: Go Make Things - show/hide with vanilla JS
const revealBtn = document.getElementById('reveal-btn');
const message = document.getElementById('message');

revealBtn.addEventListener('click', () => {
  message.hidden = false;
  message.classList.add('revealed');
  celebrationBurst(); // Trigger confetti
  revealBtn.hidden = true; // Hide button after use
});
```

### Anti-Patterns to Avoid
- **Autoplay audio on page load:** Will be blocked by all modern browsers
- **Creating Audio element before user gesture:** Audio context may be suspended
- **Using setInterval for confetti:** Use setTimeout with specific delays instead
- **Changing aria-label on toggle buttons:** Use aria-pressed instead for toggle state

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti/particle effects | Canvas particle system | canvas-confetti | Performance, shapes, cleanup handled |
| Audio playback with controls | Custom audio implementation | HTML5 Audio API | Events, buffering, codec support built-in |
| Cross-browser audio | Polyfills, fallbacks | HTML5 Audio (modern browsers) | 98%+ browser support for MP3 |

**Key insight:** The HTML5 Audio API handles all the complexity of audio playback - buffering, seeking, events, codecs. canvas-confetti handles particle physics, canvas management, cleanup. These are solved problems.

## Common Pitfalls

### Pitfall 1: Audio Autoplay Blocked
**What goes wrong:** `audio.play()` returns rejected Promise, no sound plays
**Why it happens:** Browser autoplay policies require user gesture first
**How to avoid:** Only call `play()` after user click - use the existing `app:started` event
**Warning signs:** Console error "NotAllowedError: play() failed because the user didn't interact"

### Pitfall 2: Audio Element Created Too Early
**What goes wrong:** Audio context suspended, even after user gesture
**Why it happens:** Some browsers require Audio element created in same call stack as gesture
**How to avoid:** Create Audio element in the event handler, OR use `audio.load()` then `play()`
**Warning signs:** Audio object exists but `play()` still fails after click

### Pitfall 3: Confetti Fires But Nothing Visible
**What goes wrong:** `confetti()` executes but no particles appear
**Why it happens:** Origin position wrong (particles spawn off-screen), or z-index issue
**How to avoid:** Check `origin.x` and `origin.y` (0-1 range), ensure canvas z-index is above content
**Warning signs:** No errors in console, but no visual effect

### Pitfall 4: Toggle Button Accessibility Issues
**What goes wrong:** Screen readers don't announce button state changes
**Why it happens:** Using aria-label toggle instead of aria-pressed
**How to avoid:** Use `aria-pressed="true/false"` for toggle buttons, keep label constant
**Warning signs:** VoiceOver/NVDA don't announce "pressed" state

### Pitfall 5: Message Revealed But Confetti Timing Wrong
**What goes wrong:** Confetti fires before/after message is visible
**Why it happens:** CSS animation timing not synchronized with JS
**How to avoid:** Fire confetti immediately on click, CSS animation handles visual timing
**Warning signs:** Confetti appears out of sync with message appearance

## Code Examples

Verified patterns from official sources:

### HTML5 Audio Setup
```javascript
// Source: MDN HTMLAudioElement
const audio = new Audio();
audio.src = 'audio/elvis-cant-help-falling-in-love.mp3';
audio.loop = true;
audio.volume = 0.7; // 70% volume, not jarring

// Only play after user gesture
document.addEventListener('app:started', async () => {
  try {
    await audio.play();
    console.log('Audio playing');
  } catch (err) {
    console.warn('Audio playback failed:', err.name);
    // Fallback: show manual play button
  }
});
```

### Audio Toggle Button
```javascript
// Source: MDN ARIA button role, W3C APG Button Pattern
const audioBtn = document.getElementById('audio-toggle');

audioBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    audioBtn.setAttribute('aria-pressed', 'true');
  } else {
    audio.pause();
    audioBtn.setAttribute('aria-pressed', 'false');
  }
});
```

### canvas-confetti Valentine Theme
```javascript
// Source: github.com/catdad/canvas-confetti, kirilv.com/canvas-confetti
function valentineConfetti() {
  // Valentine colors
  const colors = ['#ff69b4', '#ff1493', '#dc143c', '#ff85a1', '#ffc0cb'];

  // Heart shapes using emoji
  const scalar = 2;
  const heart = confetti.shapeFromText({ text: '❤️', scalar });

  // Burst effect
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
    shapes: [heart, 'circle'],
    scalar: 1.5
  });
}
```

### Message Reveal CSS
```css
/* Source: Standard CSS animation pattern */
.message {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.message.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Alternative: @keyframes for more control */
@keyframes message-reveal {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.message.revealed {
  animation: message-reveal 0.6s ease-out forwards;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Autoplay audio | Click-to-play required | 2018 (Chrome 66) | Must use user gesture |
| ScriptProcessorNode | AudioWorklet | 2020 | Not relevant for simple playback |
| Flash audio | HTML5 Audio | 2017 (Flash EOL) | HTML5 Audio is the standard |

**Deprecated/outdated:**
- Flash-based audio: Dead since 2020
- Older autoplay policies: All modern browsers now block autoplay
- `-webkit-` prefixes for Audio: No longer needed

## Open Questions

Things that couldn't be fully resolved:

1. **MP3 loop gap**
   - What we know: MP3 has a spec bug adding silence at track boundaries
   - What's unclear: Whether this matters for a 3-minute song looping
   - Recommendation: Use MP3 anyway - the gap is minimal and OGG fallback adds complexity

2. **Exact audio file licensing**
   - What we know: "Can't Help Falling in Love" is copyrighted
   - What's unclear: Whether a personal, non-commercial use requires license
   - Recommendation: For personal Valentine's card shared via private link, proceed; don't publish publicly

## Sources

### Primary (HIGH confidence)
- [MDN - HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement) - Audio API reference
- [MDN - Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) - Browser policies
- [GitHub - canvas-confetti](https://github.com/catdad/canvas-confetti) - Library documentation
- [kirilv.com/canvas-confetti](https://www.kirilv.com/canvas-confetti/) - Interactive demo with code

### Secondary (MEDIUM confidence)
- [Chrome Blog - Autoplay Policy](https://developer.chrome.com/blog/autoplay) - Chrome-specific details
- [W3C APG - Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) - Accessibility guidance
- [MDN - ARIA aria-pressed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed) - Toggle button state

### Tertiary (LOW confidence)
- Various blog posts on audio/confetti implementations (patterns verified with official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - HTML5 Audio and canvas-confetti are well-documented, widely used
- Architecture: HIGH - Patterns verified with MDN and official library docs
- Pitfalls: HIGH - Autoplay issues are extremely well-documented

**Research date:** 2026-02-13
**Valid until:** 30 days (stable domain, no fast-moving changes)

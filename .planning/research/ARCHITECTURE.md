# Architecture Patterns: Interactive Valentine's Card

**Domain:** Interactive animated web greeting card
**Researched:** 2026-02-13
**Confidence:** HIGH (well-established patterns, multiple authoritative sources)

## Recommended Architecture

The Valentine's card is best structured as a **layered animation system** with a central **state coordinator**. This is a lightweight version of the patterns used in browser-based games and interactive experiences.

```
+----------------------------------------------------------+
|                     PRESENTATION LAYER                    |
|  +-------------+  +-------------+  +----------------+    |
|  | Background  |  | Photo Grid  |  | Message Reveal |    |
|  | Layer       |  | Layer       |  | Layer          |    |
|  | (hearts)    |  | (polaroids) |  | (click-to-show)|    |
|  +-------------+  +-------------+  +----------------+    |
|                                                          |
|  +-------------+  +-------------+                        |
|  | Effects     |  | Audio       |                        |
|  | Layer       |  | Controls    |                        |
|  | (confetti)  |  | Layer       |                        |
|  +-------------+  +-------------+                        |
+----------------------------------------------------------+
                           |
                           v
+----------------------------------------------------------+
|                    STATE COORDINATOR                      |
|  +--------------------------------------------------+    |
|  | App State: { started, audioPlaying, revealed }   |    |
|  +--------------------------------------------------+    |
|  | Transitions: idle -> started -> revealed         |    |
+----------------------------------------------------------+
                           |
                           v
+----------------------------------------------------------+
|                    ANIMATION ENGINE                       |
|  +--------------------------------------------------+    |
|  | Single requestAnimationFrame loop                |    |
|  | Updates all animated components per frame        |    |
|  +--------------------------------------------------+    |
+----------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Technology |
|-----------|---------------|-------------------|------------|
| **State Coordinator** | Tracks app state (idle/started/revealed), emits events on transitions | All components subscribe to state changes | Vanilla JS (Proxy or Pub/Sub) |
| **Background Layer** | Renders floating hearts animation | Animation Engine for frame updates | CSS animations OR Canvas |
| **Photo Grid Layer** | Displays polaroid-style photos with entrance animations | State Coordinator (show on start) | HTML/CSS (transforms) |
| **Message Reveal Layer** | Click-to-reveal love message with animation | State Coordinator (trigger reveal) | CSS transitions |
| **Effects Layer** | Confetti/glitter bomb on reveal | State Coordinator (trigger on reveal) | Canvas (canvas-confetti) |
| **Audio Controls Layer** | Play/pause background music, volume | State Coordinator (play on start) | Web Audio API |
| **Animation Engine** | Single RAF loop coordinating all animations | All animated layers | requestAnimationFrame |

### Data Flow

```
User Click (Start)
       |
       v
State Coordinator: idle -> started
       |
       +---> Audio Controls: play()
       |           (requires user gesture - this is why we start on click)
       |
       +---> Background Layer: start hearts animation
       |
       +---> Photo Grid: trigger entrance animations
       |
       v
User Click (Reveal)
       |
       v
State Coordinator: started -> revealed
       |
       +---> Message Reveal: fade in/animate message
       |
       +---> Effects Layer: trigger confetti burst
       |
       v
     (Done)
```

**Key insight:** The user click that starts the experience also satisfies browser autoplay policies for audio. This is not a workaround - it's the intended design pattern.

## Patterns to Follow

### Pattern 1: Single Animation Loop

**What:** Use ONE `requestAnimationFrame` loop that updates ALL animated elements, rather than multiple independent loops.

**Why:** The browser can optimize a single loop better. Multiple RAF calls in the same frame share a timestamp. Coordinated updates prevent visual tearing.

**Example:**
```javascript
// Good: Single loop managing multiple effects
const animationState = {
  hearts: [],
  confetti: null,
  lastTime: 0
};

function animate(timestamp) {
  const deltaTime = timestamp - animationState.lastTime;
  animationState.lastTime = timestamp;

  // Update all animated systems
  updateHearts(deltaTime);
  if (animationState.confetti) {
    updateConfetti(deltaTime);
  }

  requestAnimationFrame(animate);
}

// Start once
requestAnimationFrame(animate);
```

**Source:** [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)

### Pattern 2: State-Driven Transitions

**What:** Use a simple state machine to control which components are active and what animations play.

**Why:** Prevents race conditions, makes the "flow" of the experience explicit, simplifies debugging.

**Example:**
```javascript
const AppState = {
  IDLE: 'idle',       // Initial load, waiting for user
  STARTED: 'started', // User clicked, music playing, animations running
  REVEALED: 'revealed' // Message shown, confetti triggered
};

let currentState = AppState.IDLE;

function transition(newState) {
  const oldState = currentState;
  currentState = newState;

  // Emit event for all listeners
  document.dispatchEvent(new CustomEvent('stateChange', {
    detail: { from: oldState, to: newState }
  }));
}

// Components subscribe
document.addEventListener('stateChange', (e) => {
  if (e.detail.to === AppState.STARTED) {
    audioController.play();
    heartsAnimation.start();
  }
});
```

**Source:** [Patterns.dev](https://www.patterns.dev/), [CSS-Tricks State Management](https://css-tricks.com/build-a-state-management-system-with-vanilla-javascript/)

### Pattern 3: Layered Stacking Contexts

**What:** Use explicit stacking contexts (via `isolation: isolate` or `z-index` with `position`) to create predictable layers.

**Why:** Prevents z-index conflicts between animations, ensures confetti always appears above content, makes layer ordering explicit.

**Example:**
```css
/* Layer system */
.layer-background {
  position: fixed;
  z-index: 1;
  isolation: isolate;
}

.layer-content {
  position: relative;
  z-index: 10;
  isolation: isolate;
}

.layer-effects {
  position: fixed;
  z-index: 100;
  pointer-events: none; /* Allow clicks through to content */
  isolation: isolate;
}
```

**Source:** [MDN Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context), [Josh Comeau's Stacking Contexts](https://www.joshwcomeau.com/css/stacking-contexts/)

### Pattern 4: Audio Gated by User Interaction

**What:** Audio playback is initialized in the same event handler as the user's first click.

**Why:** Browser autoplay policies require user gesture. Chrome, Safari, and Firefox all block audio that wasn't initiated by user action.

**Example:**
```javascript
// The "start experience" button handler
startButton.addEventListener('click', () => {
  // This works because we're in a user gesture context
  audioElement.play().catch(err => {
    console.warn('Audio blocked:', err);
    // Graceful degradation - experience works without audio
  });

  transition(AppState.STARTED);
});
```

**Source:** [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay), [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay)

### Pattern 5: CSS Animations for Simple Effects, Canvas for Particle Systems

**What:** Use CSS for floating hearts (transform, opacity). Use Canvas for confetti burst (many particles, short duration).

**Why:** CSS animations are GPU-accelerated and easy to implement. Canvas is better for hundreds of particles that need physics-like behavior.

**Floating Hearts (CSS):**
```css
@keyframes float-up {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.heart {
  animation: float-up 8s ease-in-out infinite;
  animation-delay: var(--delay); /* Set via JS or CSS custom properties */
}
```

**Confetti (Canvas via library):**
```javascript
import confetti from 'canvas-confetti';

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    disableForReducedMotion: true // Accessibility!
  });
}
```

**Source:** [CSS-Tricks Animation Comparison](https://css-tricks.com/comparison-animation-technologies/), [canvas-confetti](https://github.com/catdad/canvas-confetti)

## Anti-Patterns to Avoid

### Anti-Pattern 1: Multiple Independent Animation Loops

**What:** Creating separate `requestAnimationFrame` or `setInterval` calls for each animated element.

**Why bad:** Harder to coordinate, wastes CPU cycles, can cause visual tearing, harder to pause/resume.

**Instead:** Single animation loop that updates all systems.

### Anti-Pattern 2: Attempting Autoplay Without User Gesture

**What:** Trying to play audio on page load, or using workarounds to bypass autoplay policies.

**Why bad:** Will fail silently on most browsers. Some "workarounds" (like playing muted then unmuting) are unreliable and browser-specific.

**Instead:** Design the experience to start with a user click. Frame it as "Click to Begin" or "Open Your Valentine."

### Anti-Pattern 3: Z-Index Wars

**What:** Adding increasingly large z-index values to "fix" layering issues.

**Why bad:** Creates maintenance nightmare, breaks when new elements are added, indicates misunderstanding of stacking contexts.

**Instead:** Use explicit stacking contexts with `isolation: isolate` and a clear layer hierarchy.

### Anti-Pattern 4: Inline Animation Styles

**What:** Setting animation properties directly in JavaScript on each frame.

**Why bad:** Forces layout recalculation, bypasses GPU acceleration, poor performance.

**Instead:** Use CSS transforms and opacity (GPU-accelerated), toggle classes to trigger CSS animations.

### Anti-Pattern 5: Blocking the Main Thread with Heavy Calculations

**What:** Doing particle physics calculations or image processing synchronously in the animation loop.

**Why bad:** Causes jank, dropped frames, unresponsive UI.

**Instead:** Use `canvas-confetti` with `useWorker: true` option, keep per-frame work minimal.

## Build Order (Dependencies)

Based on component dependencies, build in this order:

```
Phase 1: Foundation
  |-- HTML structure with layer divs
  |-- CSS layer system (stacking contexts)
  |-- State coordinator (simple pub/sub)

Phase 2: Core Animations
  |-- Background hearts (CSS animations)
  |-- Animation loop setup (if using canvas for hearts)

Phase 3: Content
  |-- Photo grid layout
  |-- Photo entrance animations
  |-- Message reveal component

Phase 4: Audio
  |-- Audio element setup
  |-- Play/pause controls
  |-- User interaction gating

Phase 5: Effects
  |-- Confetti integration (canvas-confetti)
  |-- Trigger on reveal state

Phase 6: Polish
  |-- Responsive design
  |-- Reduced motion support
  |-- Loading states
```

**Rationale:**
1. **Foundation first** - Layer system and state coordinator are used by everything else
2. **Background early** - Creates visual interest while building other features
3. **Content next** - The photos and message are the core emotional payload
4. **Audio after content** - Depends on user interaction flow being established
5. **Effects last** - Confetti is enhancement, not core functionality
6. **Polish at end** - Accessibility and responsiveness are easier to add to working code

## Technology Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Hearts animation | CSS animations | Simple motion, GPU-accelerated, no library needed |
| Confetti | canvas-confetti library | Battle-tested, 3KB gzipped, worker support, accessibility built-in |
| State management | Vanilla JS events | Only 3 states, no need for library overhead |
| Audio | HTML5 Audio element | Simple use case, good browser support |
| Photos | CSS Grid + transforms | Layout and animation in one, no JS needed |

## Accessibility Considerations

| Concern | Approach |
|---------|----------|
| Reduced motion | Check `prefers-reduced-motion`, disable confetti, simplify CSS animations |
| Screen readers | Proper semantic HTML, aria-labels on interactive elements |
| Keyboard navigation | Ensure start/reveal buttons are focusable and work with Enter key |
| Color contrast | Ensure message text is readable against animated background |

## Performance Budget

For a smooth 60fps experience:

| Metric | Target | Approach |
|--------|--------|----------|
| First paint | < 1s | Minimal critical CSS, defer non-essential |
| Hearts count | 10-20 | More causes frame drops on mobile |
| Confetti particles | 100-200 | Library handles this well |
| Audio file | < 2MB | Compress to 128kbps MP3 |
| Total page weight | < 5MB | Images are main concern |

## Sources

- [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) - Animation loop patterns
- [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) - Audio autoplay policies
- [MDN Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context) - Layer management
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay) - Browser-specific requirements
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) - Confetti library documentation
- [CSS-Tricks Animation Comparison](https://css-tricks.com/comparison-animation-technologies/) - CSS vs Canvas decision
- [Patterns.dev](https://www.patterns.dev/) - JavaScript design patterns
- [Josh Comeau's Stacking Contexts](https://www.joshwcomeau.com/css/stacking-contexts/) - Z-index management
- [CSS-Tricks State Management](https://css-tricks.com/build-a-state-management-system-with-vanilla-javascript/) - Vanilla JS state patterns

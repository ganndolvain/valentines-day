# Domain Pitfalls: Interactive Valentine's Card

**Domain:** Interactive animated web greeting card
**Researched:** 2026-02-13
**Confidence:** HIGH (verified with official documentation and multiple sources)

---

## Critical Pitfalls

Mistakes that cause broken user experiences or require significant rework.

---

### Pitfall 1: Assuming Audio Will Autoplay

**What goes wrong:** Background music (Elvis song) fails to play when the page loads. The user sees a Valentine's card in silence, completely undermining the emotional impact.

**Why it happens:** All modern browsers block audio autoplay without user interaction. Chrome, Safari, Firefox, and Edge all enforce this policy. Developers test in their own browser where they've previously interacted with localhost, so it works locally but fails for new visitors.

**Consequences:**
- Silent card experience (defeats the purpose)
- Console errors about autoplay being blocked
- Confused users who don't know they need to click something
- Worse: music starts unexpectedly later when user interacts, startling them

**Prevention:**
1. **Design interaction-first:** The page must require a click before audio plays. Make this a feature, not a workaround (e.g., "Click to Open" envelope, play button).
2. **Always check the play() promise:** Never assume audio started successfully.
```javascript
const audio = document.querySelector('audio');
audio.play().then(() => {
  // Success - update UI to show playing state
}).catch(() => {
  // Blocked - show prominent play button
  showPlayButton();
});
```
3. **For Web Audio API:** Create AudioContext only after user gesture, or call `context.resume()` on first click.
4. **Test in incognito:** New visitors have no prior engagement with your domain.

**Detection (warning signs):**
- Works on your machine but not on friend's phone
- Console shows "NotAllowedError: play() failed because the user didn't interact with the document first"
- AudioContext state is "suspended" instead of "running"

**Phase to address:** Phase 1 (Foundation) - Audio interaction pattern must be established before building anything else.

**Sources:**
- [Chrome Autoplay Policy (Official)](https://developer.chrome.com/blog/autoplay) - HIGH confidence
- [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide) - HIGH confidence

---

### Pitfall 2: Animation Performance Killing Mobile Experience

**What goes wrong:** Floating hearts, glitter particles, and photo animations cause jank (stuttering), battery drain, and unresponsive touch interactions on mobile devices.

**Why it happens:**
- Animating `top`, `left`, `width`, `height` triggers layout recalculation every frame
- Too many particles (100+ confetti pieces) overwhelm mobile GPUs
- CSS `will-change` on many elements consumes excessive GPU memory
- requestAnimationFrame loops not optimized for frame budget

**Consequences:**
- Card feels "cheap" and broken on the recipient's phone
- Battery drains rapidly during viewing
- Touch interactions lag or miss
- Device heats up noticeably

**Prevention:**
1. **Only animate transform and opacity:** These properties are GPU-composited and don't trigger layout.
```css
/* BAD - triggers layout every frame */
.heart { top: 0; animation: float-bad 3s infinite; }
@keyframes float-bad { to { top: 100vh; } }

/* GOOD - GPU-composited */
.heart { transform: translateY(0); animation: float-good 3s infinite; }
@keyframes float-good { to { transform: translateY(100vh); } }
```
2. **Limit particle count:** Cap at 30-50 particles on mobile, 100-150 on desktop.
3. **Use canvas-confetti with useWorker: true:** Offloads particle calculations to web worker.
4. **Keep burst animations short:** 2-3 seconds maximum for intensive effects.
5. **Profile on throttled CPU:** Chrome DevTools > Performance > 4x CPU slowdown.

**Detection (warning signs):**
- FPS drops below 30 in DevTools Performance panel
- "Forced reflow" warnings in console
- Layers panel shows dozens of compositing layers
- Device runs hot during testing

**Phase to address:** Phase 2 (Core Animations) - Must establish performance patterns before building all animation features.

**Sources:**
- [Smashing Magazine: CSS GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) - MEDIUM confidence
- [MDN: CSS/JS Animation Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance) - HIGH confidence
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) - HIGH confidence

---

### Pitfall 3: iOS Safari Audio Quirks

**What goes wrong:** Audio works perfectly on Chrome/Android but fails silently, plays delayed, or behaves erratically on iOS Safari.

**Why it happens:** iOS Safari has unique, stricter, and sometimes buggy audio handling:
- Web Audio API respects the device's silent mode switch (mute switch kills audio)
- AudioContext must be created/resumed inside a direct user gesture handler (not async)
- Background tab audio may stop on iOS 15+
- Each iOS version introduces new edge cases

**Consequences:**
- "It works on my Android" but recipient has iPhone
- Audio starts then mysteriously stops
- Audio is delayed or glitchy
- Some iOS versions work, others don't

**Prevention:**
1. **Use HTML5 `<audio>` element for music:** More consistent than Web Audio API for simple playback. HTML `<audio>` plays even when device is muted; Web Audio respects mute.
2. **Create AudioContext inside click handler synchronously:**
```javascript
// BAD - async breaks iOS
button.addEventListener('click', async () => {
  await someAsyncThing();
  const ctx = new AudioContext(); // May fail on iOS
});

// GOOD - synchronous in gesture
button.addEventListener('click', () => {
  const ctx = new AudioContext(); // Works on iOS
  ctx.resume();
  // Then do async stuff
});
```
3. **Test on actual iOS device:** Simulators don't replicate audio quirks.
4. **Provide visual feedback:** Show audio state clearly so users know if mute switch is blocking sound.

**Detection (warning signs):**
- Works in Safari desktop but not iOS Safari
- AudioContext.state stuck on "suspended" despite interaction
- Audio plays on first visit but not subsequent visits

**Phase to address:** Phase 1 (Foundation) - Audio architecture must account for iOS from the start.

**Sources:**
- [Adactio: Web Audio API weirdness on iOS](https://adactio.com/journal/17709) - MEDIUM confidence
- [Apple Developer Docs: Playing Sounds](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/PlayingandSynthesizingSounds/PlayingandSynthesizingSounds.html) - HIGH confidence
- [howler.js iOS issues](https://github.com/goldfire/howler.js/issues/1220) - MEDIUM confidence

---

### Pitfall 4: Touch Event Double-Firing

**What goes wrong:** The click-to-reveal message or confetti trigger fires twice on mobile - once on touchstart, once on click. Toggles toggle back immediately, confetti fires twice.

**Why it happens:** Mobile browsers fire both touch events (touchstart/touchend) AND mouse events (click) for backward compatibility. The 300ms delay for detecting double-tap zoom means both events reach your handler.

**Consequences:**
- Message reveals then immediately hides
- Confetti burst fires twice, looks buggy
- Like/heart buttons register double interactions
- Inconsistent behavior between devices

**Prevention:**
1. **Use only 'click' event for interactive elements:** Modern mobile browsers fire 'click' for taps. Don't also listen to touchstart.
```javascript
// BAD - fires twice on mobile
element.addEventListener('touchstart', handleInteraction);
element.addEventListener('click', handleInteraction);

// GOOD - works on all devices
element.addEventListener('click', handleInteraction);
```
2. **If you must use touch events, prevent default:**
```javascript
element.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleInteraction();
}, { passive: false });
```
3. **Add CSS touch-action: manipulation:** Removes 300ms delay on modern browsers.
```css
.interactive-element {
  touch-action: manipulation;
}
```

**Detection (warning signs):**
- Toggle states flicker on mobile
- Console logs show handler firing twice
- Works on desktop, weird on phone

**Phase to address:** Phase 3 (Interactivity) - Before implementing click-to-reveal or any interactive features.

**Sources:**
- [GeeksforGeeks: touchstart and click](https://www.geeksforgeeks.org/how-to-bind-touchstart-and-click-events-but-not-respond-to-both/) - MEDIUM confidence
- [CSS-Tricks: Mobile Double-Tap Issue](https://css-tricks.com/annoying-mobile-double-tap-link-issue/) - MEDIUM confidence

---

## Moderate Pitfalls

Mistakes that cause polish issues, technical debt, or user confusion.

---

### Pitfall 5: Memory Leaks from Animation Loops

**What goes wrong:** requestAnimationFrame loops continue running even after they should stop, consuming memory and CPU. On single-page-like experiences where user might leave tab open, this causes browser slowdown over time.

**Why it happens:**
- Animation callback calls requestAnimationFrame without tracking the frame ID
- No cleanup when animation should end
- Multiple animation loops started without canceling previous ones

**Prevention:**
1. **Always store and cancel frame IDs:**
```javascript
let frameId = null;

function animate() {
  // animation logic
  frameId = requestAnimationFrame(animate);
}

function stopAnimation() {
  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}
```
2. **Cancel on visibility change:** Stop animations when tab is hidden.
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAnimation();
  else startAnimation();
});
```
3. **For burst effects (confetti), ensure they self-terminate:** canvas-confetti handles this automatically.

**Detection (warning signs):**
- Memory usage grows over time in DevTools
- CPU stays elevated after animations should have stopped
- Multiple "animate" functions in performance profile

**Phase to address:** Phase 2 (Core Animations) - Build cleanup into animation architecture from start.

**Sources:**
- [David Walsh: Reducing Memory Leaks in Animations](https://davidwalsh.name/reducing-memory-leaks-working-animations) - MEDIUM confidence

---

### Pitfall 6: Lazy Loading the Hero Image

**What goes wrong:** The main visual element (polaroid photos, background image) loads slowly because it has `loading="lazy"`, hurting Largest Contentful Paint (LCP) score and making the card look broken while loading.

**Why it happens:**
- Using blanket lazy-loading on all images
- CMS or framework auto-adding loading="lazy"
- Not distinguishing above-fold from below-fold images

**Consequences:**
- User sees blank space where photos should be
- LCP metric regresses by 15%+
- Card feels slow and unpolished

**Prevention:**
1. **Mark hero images as eager:**
```html
<img src="polaroid.jpg" loading="eager" fetchpriority="high">
```
2. **Only lazy-load below-fold images** (likely none for a single-screen Valentine's card).
3. **Preload critical images in `<head>`:**
```html
<link rel="preload" as="image" href="polaroid.jpg">
```

**Detection (warning signs):**
- PageSpeed Insights warns "Largest Contentful Paint image was lazily loaded"
- Images visibly pop in after page appears loaded

**Phase to address:** Phase 4 (Photos & Polish) - When adding polaroid images.

**Sources:**
- [web.dev: LCP Lazy Loading](https://web.dev/articles/lcp-lazy-loading) - HIGH confidence
- [MDN Blog: Fix Image LCP](https://developer.mozilla.org/en-US/blog/fix-image-lcp/) - HIGH confidence

---

### Pitfall 7: Ignoring prefers-reduced-motion

**What goes wrong:** Users with vestibular disorders experience dizziness, nausea, or headaches from floating hearts, parallax effects, and confetti explosions.

**Why it happens:** Developers don't know about or forget to check the prefers-reduced-motion media query. Animation is "working" so it ships without accessibility consideration.

**Consequences:**
- Accessibility violation (WCAG 2.1 SC 2.3.3)
- Physically harms some users
- Legal risk in some jurisdictions

**Prevention:**
1. **Check for preference and provide alternatives:**
```css
/* Default: reduced motion (safer) */
.heart {
  opacity: 0.7;
}

/* Only animate for users who haven't requested reduced motion */
@media (prefers-reduced-motion: no-preference) {
  .heart {
    animation: float 3s ease-in-out infinite;
  }
}
```
2. **Don't eliminate all animation - replace with safer alternatives:**
   - Replace movement with fades
   - Replace parallax with static positioning
   - Replace confetti burst with gentle color pulse
3. **For canvas-confetti, use disableForReducedMotion: true**

**Detection (warning signs):**
- No media queries for prefers-reduced-motion in CSS
- Animations run regardless of system settings
- No consideration in JavaScript animation code

**Phase to address:** Phase 2 (Core Animations) - Bake into animation system from start, not bolted on later.

**Sources:**
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - HIGH confidence
- [W3C WAI: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) - HIGH confidence
- [Smashing Magazine: Reduced Motion Sensitivities](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/) - MEDIUM confidence

---

### Pitfall 8: Over-Animating Everything

**What goes wrong:** Every element bounces, floats, sparkles, and transitions. The recipient's attention is scattered; they focus on the motion rather than the message. The card feels overwhelming rather than romantic.

**Why it happens:** Excitement about animation capabilities leads to decorating every element. "More = better" mentality. No restraint in design.

**Consequences:**
- Emotional message gets lost in visual noise
- Card feels cheap/garish rather than heartfelt
- Performance suffers from simultaneous animations
- User leaves before reading the message

**Prevention:**
1. **Identify ONE hero interaction:** The reveal of the personal message. Everything else supports that moment.
2. **Animation budget:** Limit to 3-4 animated elements at any given time.
3. **Timing guidelines:**
   - Micro-interactions: 200-500ms
   - Transitions: 300-500ms
   - Ambient animations: subtle, slow
4. **Test with fresh eyes:** Show someone who hasn't seen it. Do they read the message or watch the animations?

**Detection (warning signs):**
- Testers say "cool animations" but can't recall the message
- Performance tab shows constant activity
- You keep adding "one more thing"

**Phase to address:** Design phase / Phase 2 - Establish animation hierarchy before implementing.

**Sources:**
- [Shadow Digital: Website Animations 2026](https://www.shadowdigital.cc/resources/do-you-need-website-animations) - MEDIUM confidence
- [PixelFreeStudio: Animation Mistakes](https://blog.pixelfreestudio.com/web-interface-animation-mistakes-to-avoid/) - MEDIUM confidence

---

## Minor Pitfalls

Annoyances that are fixable but worth avoiding.

---

### Pitfall 9: Audio File Too Large for Static Hosting

**What goes wrong:** The MP3 of "Can't Help Falling in Love" is 5-8MB, causing slow initial load or hitting GitHub Pages file limits.

**Prevention:**
- Compress audio to 128kbps (sufficient for background music): ~3MB for a 3-minute song
- Consider using only a clip (30-60 seconds) rather than full song
- Host audio on a CDN if file is large (Cloudinary, etc.)
- GitHub Pages: individual files must be under 100MB, total site under 1GB (unlikely to hit, but be aware)

**Phase to address:** Phase 1 (Foundation) - Audio file preparation.

**Sources:**
- [GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) - HIGH confidence

---

### Pitfall 10: CSS Transitions on Page Load

**What goes wrong:** Elements animate from their initial state when the page loads, causing a jarring "everything slides in" effect that wasn't intentional.

**Prevention:**
1. Add a "no-transition" class on body, remove after page load:
```css
.no-transition * {
  transition: none !important;
}
```
```javascript
window.addEventListener('load', () => {
  document.body.classList.remove('no-transition');
});
```
2. Or use animation-delay to ensure load is complete before transitions begin.

**Phase to address:** Phase 4 (Polish) - Final polish pass.

---

### Pitfall 11: Forgetting Mobile Viewport

**What goes wrong:** Card looks perfect on desktop but content is cut off or overflows on mobile. Hearts float off-screen. Photos overlap the message.

**Prevention:**
1. **Set viewport meta tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
2. **Use viewport units (vh, vw, dvh) for container sizing**
3. **Test on actual phones**, not just responsive mode
4. **Account for browser chrome:** Use `dvh` (dynamic viewport height) instead of `vh` to handle mobile browser URL bars

**Phase to address:** Phase 1 (Foundation) - Base layout must be mobile-first.

---

## Phase-Specific Warnings Summary

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| Phase 1 | Audio setup | Autoplay blocked | Design click-to-start interaction first |
| Phase 1 | Audio setup | iOS Safari quirks | Test on real iOS device, use HTML5 audio |
| Phase 1 | Layout | Mobile viewport | Use dvh, test on real devices |
| Phase 2 | Heart animation | Performance on mobile | Only animate transform/opacity |
| Phase 2 | Particle effects | Mobile GPU overload | Cap at 50 particles, use web worker |
| Phase 2 | All animations | Accessibility | Check prefers-reduced-motion from start |
| Phase 3 | Click interactions | Double-firing | Use only click event, not touch+click |
| Phase 3 | Message reveal | Over-animation | One hero moment, everything else supports it |
| Phase 4 | Photo loading | Slow LCP | loading="eager", fetchpriority="high" |
| Phase 4 | Polish | Memory leaks | Audit animation cleanup |

---

## Pre-Flight Checklist

Before sharing the card URL:

- [ ] Test with audio muted on device (iOS silent switch)
- [ ] Test in incognito/private browsing (no prior engagement)
- [ ] Test on actual iPhone AND Android phone
- [ ] Check Performance tab: steady 60fps during animations
- [ ] Check Memory tab: no growth over 30 seconds
- [ ] Test with prefers-reduced-motion enabled in OS settings
- [ ] PageSpeed Insights: no lazy-loading LCP warning
- [ ] All interactions work with both mouse and touch
- [ ] Audio plays ONLY after deliberate user interaction
- [ ] The personal message is clearly readable and not overshadowed by animations

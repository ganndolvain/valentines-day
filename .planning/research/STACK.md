# Stack Research: Interactive Valentine's Card

## Recommended Stack

### Core (HIGH confidence)
- **HTML5/CSS3/Vanilla JS** — No framework needed for a single-page card
- **CSS Animations** — For hearts, fades, transforms (native, performant)
- **canvas-confetti v1.9+** — Best-in-class confetti/glitter library, tiny footprint

### Why NOT
- **React/Vue/Svelte** — Overkill for static card, adds bundle size
- **GSAP** — Powerful but unnecessary for this scope
- **Three.js** — Way too heavy for 2D effects

### Audio
- **HTML5 `<audio>` element** — Simple, works everywhere
- Must be triggered by user click (browser policy)

### Hosting
- **GitHub Pages / Netlify / Vercel** — Free, instant deploy, HTTPS included

### File Structure
```
/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── photos/
│   └── music.mp3
```

## Confidence: HIGH
This is a well-trodden path. Vanilla stack is the right choice for a personal card.

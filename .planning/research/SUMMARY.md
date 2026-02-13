# Research Summary: Valentine's Card

## Stack
**HTML/CSS/JS + canvas-confetti** — No framework needed. Static hosting on GitHub Pages/Netlify.

## Table Stakes
- Mobile responsive (most will view on phone)
- Click to start (browser requires this for audio)
- Music plays
- Message visible
- Photos display
- Works on all modern browsers

## Differentiators
- Smooth animations (hearts, glitter)
- Click-to-reveal anticipation
- Polaroid photo style
- Personal touch (their song, their photos)

## Critical Pitfalls
1. **Audio autoplay blocked** — MUST have click-to-start button
2. **iOS Safari quirks** — Test on real device
3. **Performance on mobile** — Use CSS transforms only, limit particles to ~50
4. **Touch double-firing** — Use click events only, not touch+click

## Build Order
1. Foundation (HTML structure, responsive layout)
2. Visual design (colors, typography, hearts)
3. Photos (polaroid styling, scattered layout)
4. Interactivity (click-to-reveal, confetti)
5. Audio (music player, controls)
6. Polish (accessibility, testing)

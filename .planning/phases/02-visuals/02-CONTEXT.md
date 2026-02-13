# Phase 2: Visuals - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Beautiful hearts animation and polaroid-style photo display. Hearts float continuously as ambient decoration. Photos appear as scattered polaroids after click-to-start. Creating/editing photos and the message reveal are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Hearts Animation
- Float upward from bottom to top, like bubbles or balloons
- Sparse density (5-10 hearts on screen at a time) — elegant and minimal
- Red and pink color mix for variety
- Varied sizes (small, medium, large) for depth and visual interest
- Hearts animate continuously, even before click-to-start

### Polaroid Layout
- Scattered naturally at random angles and positions, like tossed on a table
- 5-7 photos total — small collection with variety
- Classic white border with thick frame and space for caption
- Captions underneath each photo with handwritten-style text

### Photo Interaction
- Clickable to enlarge in lightbox view
- Single photo view — click shows photo large, click away to close and return to main page
- User can then click another photo to view it
- Subtle lift effect on hover — photo rises slightly with shadow, hints it's clickable

### Visual Timing
- Hearts: Always running, even on the initial click-to-start screen
- Photos: Sequenced reveal after click-to-start
- Photos appear one by one at medium pace (0.7-1s between each)
- Animation style: "Dealt" onto the table like someone tossing polaroids one at a time, landing at their scattered angles with natural toss feel

### Claude's Discretion
- Mobile lightbox behavior optimization
- Exact heart float speed and transparency
- Shadow styling for polaroids
- Lightbox close button/overlay design

</decisions>

<specifics>
## Specific Ideas

- "I like the idea of them feeling like someone tossing polaroids on a table one at a time dealing them out"
- Photos should land at their final scattered positions naturally
- User wants to zoom into a photo, back to main page with the nice note, then can zoom into another

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-visuals*
*Context gathered: 2026-02-13*

# Zero Stock Photos & Entity-Aware Live Web News Photography

This plan overhauls the image pipeline by completely removing all Unsplash stock photos from the application and implementing an entity-aware, automated internet photo search engine. When a news story has no image, the system automatically identifies the key figure, subject, or location (e.g., Donald Trump, Vladimir Putin, F-16, Taif Airport) and instantly injects the single best verified news photograph directly into the studio canvas.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1 clarification:
> - **Zero Candidate Grid**: As explicitly instructed, the app will **NOT** display a 12-candidate picker. Instead, it will automatically pick and apply the single best matching photo directly to the studio canvas.
> - **Search Loading State**: When an image is still being resolved from the web, the canvas displays a sleek, dark textured intelligence backdrop with a subtle live search pulse indicator.
> - **Entity-Aware Precision**: Automatic search extracts named figures and subjects (e.g., news about Trump automatically fetches a verified Donald Trump news photograph).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Purges every Unsplash stock URL from `server.ts`, `App.tsx`, `SquareEditor.tsx`, `storage.ts`, `osintClassifier.ts`, and `osintEngine.ts`.
  2. Implements a zero-stock policy: newly created canvas cards start with a dark textured aesthetic until a real news photo is attached.
  3. Upgrades the backend photo resolver (`fetchInternetNewsPhoto` in `server.ts`) with named-entity extraction (world leaders, combatants, weapon models, airports, cities).
  4. Automatically resolves and injects the top matching real photograph into the canvas in under 1 second.
- **Target Persona**: Conflict news desk editors at `@Stark-News-x` who require genuine, real-world photojournalism without stock photo cliches.
- **Key Value**: 100% authentic news photography, zero generic stock images, and zero manual searching friction.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Story Selection in Radar**:
   - User clicks any story in the feed (RSS, X dispatch, Telegram intel).
   - If the story has a verified publisher photo, it loads instantly.
   - If the story has no photo, the canvas immediately transitions to a high-contrast dark textured terminal with a quiet status tag: `[SEARCHING WEB INTEL...]`.
2. **Instant Auto-Injection**:
   - The backend searches Bing News & DuckDuckGo for the detected entity and event.
   - The single best high-resolution web photograph is returned and seamlessly injected into `editorConfig.background.imageUrl`.
   - The radar feed card updates its thumbnail simultaneously.
3. **Canvas Controls**:
   - In `SquareEditor.tsx` (Background Photo panel), the status displays:
     - `✓ Verified Web Photo` or `✓ Publisher Original`.
   - A quiet `🔍 Re-Search Web Photo` button is available if the user updates the headline and wants a fresh photo.

### Visual Identity & Theme
- **Empty & Loading Canvas**: Deep carbon dark background (`#0a0a0c`) with a subtle radial gradient and tactical grid texture, eliminating generic Unsplash photos.
- **Micro-Interactions**: Smooth fade-in transition when the internet photo arrives; zero jarring layout shifts.
- **Typography**: Tabular numerals and monospace attribution badges (`text-[10px] font-mono`).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Single Best Photo Auto-Injection vs. 12-Photo Gallery Grid
- **Chosen Approach**: Automatically evaluate and select the highest-confidence press photograph from Bing and Wikimedia and apply it immediately to the canvas, as confirmed by the user.
- **Why**: Editors publish breaking news in seconds; forcing them to choose from a 12-item grid adds unnecessary friction.
- **Alternatives Considered**: 12-candidate modal (rejected per user's explicit preference).

### Decision 2: Complete Purge of Unsplash Stock URLs
- **Chosen Approach**: Remove all Unsplash image links across `server.ts`, `osintClassifier.ts`, `osintEngine.ts`, and `storage.ts`. Default state is an authentic dark textured military terminal background.
- **Why**: Ensures no stock photos can ever leak into published graphics or radar cards.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Story Selected in Radar                  │
│       (X Tweet / RSS Wire / Telegram / Search Result)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [Has Publisher Photo?]                [No Photo Found]
            │                                     │
            ▼                                     ▼
   Apply directly to Canvas           Canvas shows Dark Textured
                                      Backdrop + Search Indicator
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────┐
│               Server: /api/resolve-image                    │
│  1. Extract Core Entities (e.g. Trump, Putin, Taif, F-16)   │
│  2. Query Bing News Images + DuckDuckGo Image Engine        │
│  3. Filter out icons, svgs, logos, tracking pixels          │
│  4. Select Single Best High-Resolution Press Photograph     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Automatic Canvas Background Injection           │
│  - Sets canvas background.imageUrl = resolvedPhoto          │
│  - Updates selectedStory & feed thumbnail state             │
│  - Displays "✓ Verified Web Photo" status badge             │
└─────────────────────────────────────────────────────────────┘
```

### Components to Update
1. `server.ts`:
   - Delete `FALLBACK_IMAGES` Unsplash records.
   - Upgrade `fetchInternetNewsPhoto` with entity recognition (leaders, military assets, facilities).
   - Ensure `cachedStories` background pre-fetch automatically populates internet photos.
2. `src/utils/storage.ts`:
   - Replace default Unsplash image URLs with empty string (`''`) so canvas defaults to dark textured aesthetic.
3. `src/utils/osintClassifier.ts` & `src/utils/osintEngine.ts`:
   - Remove all Unsplash URLs; use dark textured radar coordinates.
4. `src/components/SquareEditor.tsx`:
   - Remove all references to `images.unsplash.com`.
   - Render textured canvas with loading indicator when an image is being resolved.
   - Display `✓ Verified Web Photo` attribution.
5. `src/App.tsx`:
   - Ensure clean auto-injection pipeline for selected stories.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:5173)
npm run dev -- --host  # Expose on local network for iPhone testing
npm run build        # Production build → dist/
npm run preview      # Preview the built dist/ locally
```

To deploy: push to `main` on GitHub (`sarahjorgie/buzbirds`), then either drag `dist/` onto Netlify or trigger a Netlify auto-deploy. No test suite exists.

## Architecture

**BuzBirds** is a React 18 + Vite + Tailwind CSS v3 PWA for identifying Southern African birds. It has no backend — all data comes from public APIs at runtime.

### Data flow

`App.jsx` is the orchestrator. On load it fetches paginated species from iNaturalist (`/v1/observations/species_counts`, up to 10 pages × 200 results) for a given `placeId` + `taxonId`. The result is stored as `species[]` (source of truth) and `deck[]` (display order, may be shuffled). A derived `visibleDeck` filters out known birds when `hideKnown` is true.

Each `FlashCard` then lazy-fetches its own extra data **only when needed**:
- **Photos**: fetched eagerly on card mount via `fetchTaxonPhotos` (`/v1/taxa/{id}`)
- **GBIF taxonomy, province presence, bird call**: fetched on first flip

All four fetches use **separate `useEffect` hooks** (critical — a single combined effect caused a cancellation race condition where resolving GBIF re-triggered the effect and cancelled the in-flight province fetch).

### State & persistence

`useProgress` hook (`src/hooks/useProgress.js`) owns all user state:
- `progress`: `{ [taxonId]: 'known' }` — persisted to `localStorage` under key `bird-flashcard-progress`
- `collected`: `{ [taxonId]: { id, name, sciName, photoUrl, collectedAt } }` — persisted under `buzbirds-collection`
- These are **unified**: `addToCollection` also marks as known; `removeFromCollection` also unmarks. Never call them independently.

Daily challenge state (`buzbirds-daily-v1`) is managed locally inside `DailyChallenge.jsx`.

### API utilities (`src/utils/`)

All utilities use **in-memory Maps** as session caches — fetch once per taxon per session.

| File | API | Purpose |
|------|-----|---------|
| `gbif.js` | `api.gbif.org/v1/species/match` | Family / order taxonomy |
| `inatProvinces.js` | `api.inaturalist.org/v1/observations` | Province presence (9 parallel requests) |
| `inatPhotos.js` | `api.inaturalist.org/v1/taxa/{id}` | Up to 8 taxon photos |
| `xencanto.js` | `api.inaturalist.org/v1/observations` (sounds) | Bird call audio (SA first, global fallback) |
| `apiLookup.js` | iNaturalist autocomplete | Resolve province/group names → IDs |

Note: `xencanto.js` is misnamed — it was originally Xeno-canto but was rewritten to use iNaturalist sounds due to CORS issues. Xeno-canto is not used.

### Static data

- `src/data/provinces.js` — 9 SA provinces with **hardcoded, verified iNaturalist place IDs** (admin_level=10). Do not change these without re-verifying via the iNat API.
- `src/data/birdGroups.js` — 16 bird family/order groups with verified iNaturalist taxon IDs.

### Key UI patterns

**Card flip**: CSS 3D transform (`rotateY(180deg)`) with `perspective`, `backface-visibility: hidden`. Defined in `src/index.css` as `.card-scene` / `.card-inner` / `.card-face`.

**Swipe animation**: In `App.jsx`, `cardAnim` state drives `translateX` + `rotate` on the card wrapper div. `animatingRef` locks new swipes during the exit/enter sequence. `deckLengthRef` is updated each render (before `return`) so `setTimeout` callbacks in `swipeNavigate` don't stale-close over deck length.

**Audio on iOS**: The `AudioPlayer` component in `FlashCard.jsx` requires `onTouchStart` + `onTouchEnd` with `stopPropagation` AND `preventDefault` on the wrapper div — `onClick` stopPropagation alone is insufficient on iOS Safari to prevent the card from flipping.

**Safe area insets**: `env(safe-area-inset-top, 0px)` is applied on the main container and all full-screen overlays (FilterMenu, DailyChallenge). The `index.html` must have `viewport-fit=cover` for this to work.

### PWA

`vite-plugin-pwa` generates a service worker with Workbox. Runtime caching: NetworkFirst for iNat/GBIF API calls (24h), CacheFirst for photos/sounds (30 days). The app installs as a standalone PWA on iOS via "Add to Home Screen".

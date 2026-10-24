# R84 - Walk-in gallery: the rooms behind the street doors

Owner (23 Oct 2026, translated from Chinese): "the 3D street only works like a navigation: every section sign sends the
visitor down to that part of the website - that is ordinary. I want the visitor to walk INTO a building and see
everything there, in 3D: my awards and certificates, my About with banners hanging, my contact info ... as real as
possible. It must be easy to update (new projects, new awards) and scale. No lag, no bugs."

## 1. What changed for a visitor

| Before                                                                           | After                                                                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| A sign (VIEW) or E at a door (WALK) scrolled the page to `#about`, `#honors` ... | It brings a shutter down and opens that section's ROOM; the visitor walks in it, inspects exhibits, and leaves by the door |
| The 3D street showed no content                                                  | Every room shows the section's real content: photos, certificates, trophies, banners, kiosks, a working postbox            |

Rooms (one per section of `lib/sections.ts` that has a door in `engine/doors.ts`):

| Section    | Room                   | What stands in it                                                                                                                       |
| ---------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| about      | The studio             | The portrait (framed), name card + statement; the four Build Sheet facts as hanging banners; UM plate; resume                           |
| projects   | The showroom (konbini) | One kiosk per project (screen = first gallery photo, else a printed title screen); aisle numbers; the index board                       |
| experience | The timeline corridor  | One booth per role: photo, logo plate, three thumbnails, caption; the timeline and dates painted on the floor                           |
| honors     | The treasure hall      | One bay per honour: the certificate framed on the wall, a plinth with its trophy (the page's emblem form) and caption; the tally column |
| contact    | The post office        | The postbox (a letter = the page's contact form, same API, same bot traps); email / LinkedIn / GitHub / location cards                  |
| any other  | Gallery hall           | Framed exhibits along the walls (a new section with a door works with no 3D code)                                                       |

Interaction: walk (WASD / joystick), E or a click / tap on an exhibit = INSPECT (the camera frames it, a card opens
with every word, photo, figure and link), Escape / X closes it; INDEX lists every exhibit (keyboard and screen-reader
visitors never need to walk); STREET (or the door, or VIEW) goes back out to the same door. OTHER ROOMS in the index
jumps between rooms.

## 2. Content: one source of truth, three ways to update

`components/tokyo-diorama/gallery/content.ts` builds the rooms from the data the page already renders:
`honorsList` (+ `CERT_SIZE`, `CERT_PREVIEW`), `projects`, `experiences`, the ZeroLag `photos`, `LEDGER` (About Build
Sheet) and `personalDetails`. Nothing is typed twice.

1. **Code (normal way):** add an award to `honorsList`, a project to `projects` ... - the page AND the 3D room show it.
2. **`public/gallery/gallery.json` (no TypeScript):** `{ "items": [ { "room": "honors", "id": "...", "title": "..." } ] }`.
   Same `room` + `id` as a built-in exhibit = patch it; `"hidden": true` = hide it.
3. **`/admin/gallery` (live, no deploy):** Supabase table `gallery_items` + public bucket `gallery`
   (`sql/002_gallery.sql`); pictures are converted to WebP in the browser and uploaded with their real pixel size;
   `/api/gallery` serves published rows (CDN 30 s). Without Supabase it answers `[]`.

Everything from 2 and 3 is validated in `gallery/live.ts` (ids, lengths, SIGNAL / emblem / kind enums, link schemes:
https / http / mailto / same-site only; images: same-site paths or https only). Rooms grow with their content
(`engine/rooms/layouts.ts`: every plan computes its size from the exhibit count).

## 3. Engine

- Each room is its own `THREE.Scene` + collision `World` (`engine/rooms/hall.ts`), built a piece per frame
  (`buildRoomSteps`, ~80 ms of canvas work in total) behind the 520 ms shutter, then its shaders are prepared with the
  R80 warm-up (`warmUp(scene)`) - one warm draw per PROGRAM for rooms (they share ~5 programs).
- Every room has exactly 1 hemisphere + 1 key light + 4 point lights, so all rooms share programs.
- Street = ACES tone mapping (night neon). Rooms = Khronos PBR Neutral (photos keep their colours); the OutputPass
  defines are switched with the scene, compiled during the room's warm-up. Bloom is off indoors (`pass.enabled`).
- Photos: fetched + decoded off the main thread (`createImageBitmap`), scaled to 1024 px (768 on LOW), swapped into
  a placeholder material (same program), uploaded one per frame. Two rooms are cached; older ones are disposed.
- While a room is open the street keeps simulating (traffic, lights) but the player is not on it; rain is heard
  through the walls (30 %), the train not at all. No umbrella indoors.
- Inspect camera: eases to the exhibit's view, panned so the exhibit sits beside the card (desktop) or above the
  bottom sheet (phone); the walker hides while inspecting.

Measured (SwiftShader, this sandbox - real GPUs are far faster): room build 80 - 92 ms in 14 slices (max 33 ms);
first room warm-up 18 s (software has no parallel shader compile; behind the shutter), next rooms ~6 s; draw calls
36 - 95 per room, 3 - 13 k triangles. First Load JS for `/`: 184 kB (baseline 183 kB, budget 190 kB).

## 4. Guards

`tests/r84-walk-in-gallery.spec.ts`: every door opens its room with all its exhibits (directory count = hotspots);
draw calls < 160; two rooms cached at most; a sign opens its room without scrolling the page and STREET brings the
visitor out; E opens the card with the page's exact words and certificate link, Escape closes it, INDEX reaches any
exhibit; gallery.json adds an exhibit, hides one and loses unsafe links / data: images.
`tests/r70.spec.ts` and `tests/r73.spec.ts`: a sign now opens its room (was: scrolls to the section).

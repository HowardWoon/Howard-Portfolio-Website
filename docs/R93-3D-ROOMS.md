# R93 - The walk-in rooms: neo-brutalism outside, brutalism in the concrete (R87 P6)

Owner, 3 Nov 2026, on the rooms behind the street doors: "like an exhibition hall ... very ugly, very monotonous, not
good-looking". "I allow you to combine neo-brutalism with brutalism ... brutalism has more to showcase." Everything in
them must update automatically when a project / photo / achievement is added (AGENTS.md 8.5).

## 1. What is wrong today (R84 / R85 rooms, read from the code)

- Every room is the same box: cream walls, a paper dot floor, the same frieze, the same ink beams and pilasters. Only
  the furniture differs, so five rooms read as one room five times ("monotonous").
- Colour is almost absent: a SIGNAL meaning shows only as an 8 cm cap on a plinth or a band on a caption card. From the
  doorway the room is cream on cream.
- Warm point-light pools on cream walls = the soft "hotel lobby" look; nothing has the page's hard ink outline.
- Exhibits are small against 5 - 6 m walls; captions are the only big type, and they sit at eye level only.

## 2. Research (AGENTS.md 8.1)

| Reference                                                                                                                                                                                                                                                                                                                            | What it is                                                                                                      | What R93 takes from it                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MASP, Lina Bo Bardi - crystal easels](https://inspiration.detail.de/en/article/exhibition-display-panels-in-sao-paulos-museu-de-arte-5331)                                                                                                                                                                                          | Paintings on glass panels held by raw concrete blocks, standing in a grid in an open hall                       | The concrete EASEL: every framed photo / screen stands in a raw concrete block, free of the wall; the block is the brutalist part, the ink-framed print the neo-brutalist part                                                                                                |
| [Whitney (Breuer) designation testimony](https://hdc.org/?p=51560) and [Breuer, 945 Madison report](https://a860-gpp.nyc.gov/downloads/rv042z33q?locale=en)                                                                                                                                                                          | Board-formed / bush-hammered concrete, the lobby light grid repeated in COFFERED gallery ceilings               | Board-marked concrete walls (printed planks, tie holes - hard tone steps, no noise blur) and a coffered ceiling whose coffers hold the flat light panels                                                                                                                      |
| [Barbican Art Gallery, OFFICE KGDVS](https://officekgdvs.com/projects/168)                                                                                                                                                                                                                                                           | Exhibition built from "fragments of the building": coffered ceiling, an exposed concrete column, black railings | Exposed concrete columns with ink railings / ink edges; the structure IS the decoration (no added ornaments)                                                                                                                                                                  |
| [Hayward Gallery](https://clare-hughes.squarespace.com/hayward-gallery)                                                                                                                                                                                                                                                              | Board-marked concrete "adds a very human touch"                                                                 | Plank marks at a human scale (15 cm boards), not a photo texture                                                                                                                                                                                                              |
| [Codrops: Sketching the impossible - a 3D portfolio without a single 3D model](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)                                                                                                                                     | Rooms built from planes / cubes with drawn textures and a flat (MeshBasic-based) shader                         | Print the look into canvas textures (already our `print.ts` way) and keep geometry boxes; flat colour fields instead of lighting tricks                                                                                                                                       |
| [Three.js cel shading (MeshToonMaterial)](https://salivity.github.io/three.js/article/three-js-cel-shading-with-meshtoonmaterial) and [inverted-hull outlines (drei Outlines)](https://drei.docs.pmnd.rs/abstractions/outlines)                                                                                                      | Hard banded light + an ink outline drawn as a second, larger back-face mesh                                     | The INK EDGE: every plinth / easel / bench carries ink edge bars (the 3 px border at room scale). Built as batched boxes, not a hull pass: zero extra draw calls, no new shader program, exact thickness. Toon shading rejected: a 7th program per room and banding on photos |
| [vogdb/3D-art-gallery](https://github.com/vogdb/3D-art-gallery), [theringsofsaturn/3D-art-gallery-threejs](https://www.github.com/theringsofsaturn/3D-art-gallery-threejs), [freeCodeCamp gallery code-along](https://recapio.com/digest/code-a-virtual-3d-art-gallery-three-js-javascript-tutorial-code-a-long-by-freecodecamp-org) | Typical three.js galleries: frames on walls, spotlights, 4K textures                                            | What NOT to do: soft spot pools, photo-real textures (4K, LFS), every room the same corridor of frames. Taken: collision boxes per piece, one walk height                                                                                                                     |
| [Karol Binkowski portfolio (Awwwards)](https://www.awwwards.com/sites/karolbinkow-ski)                                                                                                                                                                                                                                               | Print-first: paper, ink, one accent, uppercase type, hard shadows                                               | Big uppercase labels as the wayfinding (painted on the floor and on the walls), one SIGNAL colour per bay                                                                                                                                                                     |
| [Codrops: scroll-reactive 3D gallery](https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/)                                                                                                                                                              | Class-based engine / gallery split                                                                              | Confirms our split (Hall kit + per-room plan generators); nothing new taken                                                                                                                                                                                                   |

## 3. The design

One kit change reaches all five rooms (`engine/rooms/hall.ts`), then one signature move per room (`layouts.ts`).

Brutalism (the building):

- **Board-marked concrete** walls and columns (`print.ts concreteTexture`: 15 cm planks in 3 - 4 hard grey steps, a tie
  hole grid, a printed seam; tiled; no noise, no gradient). Background grey, not cream.
- **Coffered ceiling**: a grid of deep concrete ribs; each coffer holds one flat white panel (the lights you see).
  Replaces the ink beams.
- **Concrete floor with an exposed grid**: poured slab with ink joint lines every 2 m (the "raw grid").
- **Monoliths**: exhibits stand on / in raw concrete blocks (MASP easels for photos and screens, stepped podiums).

Neo-brutalism (everything that carries Howard's content):

- **SIGNAL bays**: each exhibit stands in front of a flat full-height colour panel in ITS SIGNAL colour (lib/signal.ts,
  rule A3), with a white chip naming the meaning (rule B "coloured strips get a white label chip"). No meaning = paper.
  Seen from the doorway, a room now reads as its honours / projects in their colours.
- **Ink edges** on every block (5 cm ink bars on all 12 edges) - the page's 3 px border, in 3D.
- **Hard offset shadows**: the existing ink slab behind every frame / card grows to 8 cm and gets one under every
  monolith on the floor (a flat ink quad offset +x / +z).
- **Giant labels**: in front of each bay, the exhibit's own number or kicker painted on the floor, 1 m tall, mono; the
  room's name painted 2 m tall on the floor at the corridor mouth.

Per room (the signature that ends "monotonous"):

- About - **the Studio**: the portrait on a stepped concrete podium (three steps, ink nosings), the Build Sheet banners
  on concrete columns down the aisle.
- Projects - **the Showroom**: kiosks become concrete easels (MASP) with the SIGNAL panel as their back, aisle numbers
  hung from the coffers.
- Experience - **the Timeline**: the floor timeline becomes a raised concrete spine with ink edge; dates painted 1 m tall.
- Honors - **the Vault**: plinths are concrete monoliths with ink edges and SIGNAL caps; the tally is a concrete column.
- Contact - **the Post Office**: the counter in concrete with an ink edge; pigeonholes in paper / ink.

Unchanged on purpose: lights 1 hemisphere + 1 key + 4 points, PBR Neutral, no bloom, photos <= 1024 px into the
placeholder material, two rooms cached, build in generator steps, the 6 m corridor, START 3D on software WebGL.
No new material TYPE (MeshStandard / MeshBasic only), so no new shader programs; new colours are new batch keys.

## 4. Automation (AGENTS.md 8.5)

Content still comes only from `gallery/content.ts` (registries) + validated extras. Guard added in
`tests/r93-rooms.spec.ts`: every room's hotspots equal its content's exhibit ids (nothing dropped by a plan); 15 extra
exhibits injected into each room through the live-extras path all appear, inside the room, apart from each other, and
the room grows.

## 5. Measurements and verification

Real-time frame intervals on the GPU (`--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`), 4 s walking into each
room after its photos landed, production build, same machine, HEAD ed1d1c2 (before) vs R93 (after). Engine render time
per frame from `debug.info().ms.render`.

| Room       | 1440 x 900 before: median / p95 / max ms, render | after                                       | 820 x 1180 after         |
| ---------- | ------------------------------------------------ | ------------------------------------------- | ------------------------ |
| About      | 16.7 / 16.7 / 16.8                               | 16.7 / 16.8 / 33.4 (one frame of 240), 0.67 | 16.7 / 16.7 / 33.4, 0.64 |
| Projects   | 16.7 / 16.7 / 16.8                               | 16.7 / 16.8 / 16.8, 0.71                    | 16.7 / 16.7 / 16.8, 0.82 |
| Experience | 16.7 / 16.7 / 16.8, 0.57                         | 16.7 / 16.8 / 16.8, 0.73                    | 16.7 / 16.7 / 16.8, 0.63 |
| Honors     | 16.7 / 16.8 / 16.8, 1.03                         | 16.7 / 16.8 / 16.8, 1.25                    | 16.7 / 16.8 / 16.8, 1.15 |
| Contact    | 16.7 / 16.7 / 16.8, 0.51                         | 16.7 / 16.7 / 16.8, 0.55                    | 16.7 / 16.8 / 16.8, 0.52 |

Every room stays at the 60 Hz cap. The About room shows one 33 ms frame per run at both sizes (it is the first room
entered in the probe; the baseline had none) - recorded, not hidden. Render cost per frame rose ~0.1 - 0.2 ms (the ink
edges and bays are batched: no new draw call per block; floor labels add one draw per exhibit).

Found by the new guard and fixed in this round: the Honours hall put a side-wall bay and a far-wall bay in the same
corner once it grew (stand marks 0.72 m apart); its corner margin is now 3.2 m. The About room did not grow for exhibits
added beyond its side-wall slots (they were dropped); it grows now.

Checks run: tests/r93-rooms (2 passed; failed on the corner defect before the fix), r84 + r85 + r80 + r73 +
tokyo-diorama (19 passed), verify.mjs ALL PASS, audit-ui ALL PASS, device-sweep ALL PASS (23 x 6). Screenshots of every
room at 1440 x 900 and 820 x 1180 were looked at (concrete walls, SIGNAL bays, painted labels, no clipping).

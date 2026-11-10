---
trigger: always_on
---

# 50 - Content updates: one procedure per kind of upload (always on)

Owner (R83, 23 Oct 2026): every session must update the site the SAME way - photos, logos, honours, projects,
experience, CV, certificates. "Don't upload casually, each time a new style ... I don't want that." A visitor learns
one look per kind of thing; a second variant (e.g. Catfish and Sensor X showing their logos differently) reads as a
mistake. This file is the procedure. Follow it exactly; if a request does not fit it, ask Howard, then extend this file
in the same commit (AGENTS.md 7.2).

## A. The three laws of an update

1. **Same kind, same look, same place, same list.** Every item of one kind uses the one component and the one data
   list below. Never style a new item by hand, never add a second component for a kind that has one. To add an item,
   copy its nearest sibling entry field for field, then change only the facts.
2. **One change reaches every place that shows it.** Each kind below lists every place on the site that repeats it.
   Update all of them in the same commit, or none (a Ledger that lists 12 honours while Honours shows 13 is a bug).
3. **The owner's files are facts, the site's words are his.** Copy facts (names, dates, placements, numbers) exactly as
   the owner's source states them. When a source disagrees with the site (the CV says one date, Experience another),
   do not pick one: list the differences and ask.
4. **Automatic, not on request (R87).** The owner never has to point out a place that missed an update: after adding
   an item, open every consumer listed for its kind (section D) on the built site and confirm it is there, including the
   Arena Wall rows above Contact and the 3D rooms. A consumer that keeps its own copy of the list is fixed to read the
   registry in the same round (AGENTS.md 8.5).
5. **Photos are shown whole (R86).** `object-contain`, never a crop that cuts people or text; see AGENTS.md 8.4.

## B. Intake: every file the owner drops

The owner drops uploads in the repo root (often with spaces, `.ico` / `.webp` / huge PNGs, a folder like `logo/`).

1. **Read every file completely before anything is published** (images: look at them; PDFs: every page AND the text
   layer). Publishing distributes it.
2. **Privacy:** no IC / NRIC / passport number, home address beyond the town, or a team-mate's identity number may go
   public. Check the PDF text layer and metadata (`python -I -c "import pypdf ..."`: search `\d{6}-?\d{2}-?\d{4}`) -
   a blanked field can still hold the number as hidden text. A document that showed one is published as a PICTURE (PNG
   rendered from the owner's cleaned copy, no text layer), never as the PDF (R49, R51).
3. **Convert, never copy raw:** check the real format (`sharp().metadata()`; MUBA's ".ico" was a PNG), then write the
   web file with sharp into the folder from section C, lowercase kebab-case name, no spaces. Read the REAL pixel size
   from the written file; never type a guessed `w` / `h`.
4. **The originals stay out of git.** Never commit the upload; tell Howard which originals are still in the repo root
   (an untracked file there can break `tsc` / `eslint .` when it is code) and ask before moving or deleting them.

## C. Where each kind of file lives (new files go ONLY here)

| Kind                                  | Folder / file                                 | Format                                                         | Registered in                                         |
| ------------------------------------- | --------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| Project photo / screen                | `public/images/projects/<project-id>/`        | JPEG q86, long edge <= 1600 px (screens: PNG if text is small) | the project's `galleryPhotos` (stacked-projects.tsx)  |
| Experience photo                      | `public/images/experiences/<experience-id>/`  | JPEG q86, long edge <= 1600 px                                 | the role's `galleryPhotos` (experience-section.tsx)   |
| Project organiser logo                | `public/images/logos/organisers/<id>.png`     | trimmed to its ink, 160 px tall, PNG                           | `lib/organisers.ts`                                   |
| Experience organisation wordmark      | `public/images/logos/<org>_logo.png`          | trimmed, white or transparent ground                           | `ORG_LOGOS` (components/org-logo.tsx)                 |
| Institution crest (UM, KMNS)          | `public/images/logos/<name>_crest.png`        | trimmed, centred, HD                                           | `components/institution-seal.tsx` only                |
| Certificate                           | `public/certificates/<kebab-name>.png`        | PNG picture, long edge <= 2000 px                              | `certificateUrl` + `CERT_SIZE` (honors-section.tsx)   |
| Certificate PDF (text layer verified) | `public/certificates/<kebab-name>.pdf`        | PDF + a preview PNG in `public/certificates/previews/`         | `certificateUrl`                                      |
| CV                                    | `public/resume.pdf` (this exact name, always) | the owner's PDF, unmodified                                    | `RESUME_URL` (lib/resume.ts) - every control reads it |
| Pitch deck / document                 | `public/documents/<kebab-name>.pdf`           | PDF                                                            | the project's `deckUrl`                               |

Legacy folders (`images/muba/`, `images/experience/mhw|mytech/`, certificate names in UPPER_CASE) stay where they are:
moving them breaks paths and tests for no visitor gain. Never add new files to them.

## D. Per-kind checklists (every box, same commit)

### D1. Photos (project or experience gallery)

- [ ] Intake (B), folder (C), real `w` / `h`, factual `alt` (who, what, where - no adjectives).
- [ ] Order (AGENTS.md 6.1): Howard with the award / on stage first, other event photos, product screens last.
      Numbered uploads (1.jpg, 2.jpg ...) keep the owner's numbering.
- [ ] R102: a photo's size comes from `lib/photo-manifest.ts`, made from the files before every build (never type
      it); give it its gallery entry (alt, order) in the same change. (R118: The Build's film reels, the SYS MAP docks
      and `memory-data.ts` are deleted - there is no second photo list to update.) A new folder needs its project /
      experience entry first. Never add a hand-kept photo or project list anywhere.
- [ ] `npm run build` regenerates `lib/photo-manifest.ts` and `components/photo-blur.ts` (prebuild); commit both.
      `tests/r102` fails when a typed `w` / `h` differs from the file or a folder photo is missing from the reel.
- [ ] Guards: tests/r76 + r82 (lightbox), device-sweep.

### D2. Honour / award

- [ ] `honorsList` (honors-section.tsx): copy the nearest sibling. `signal` by SIGNAL KEY (podium = won, qualifier =
      finalist / qualified, academic = grades); `emblem` by kind (gold / silver / bronze / star / finalist / seal /
      ticket / badge); `statCallout.value` <= 6 characters (it is drawn on the emblem); certificate per D6.
- [ ] Every place that repeats honours: `LEDGER` (lib/ledger.ts, read by the 3D rooms; same order as Honours), the About Build Sheet podium counter (about-section.tsx, this
      year's podiums), the hero ticker (bikebear-hero.tsx: ONLY the newest result, tagged LATEST), the logo wall
      `REEL_ROWS` ticket (arena-reel.tsx), the highlight tape (portfolio-page.tsx), and the project's `badge` when the
      honour belongs to a project.
- [ ] Guards: tests/r83 (ledger issuers exist in Honours, Build Sheet counts), r24 (emblem geometry), r29 / r48.

### D3. Project

- [ ] `projects` (stacked-projects.tsx): copy a sibling; `number` follows the order the owner wants; `signal`, `badge`,
      `organiser` (D5), `tags` that match the skills matrix names, `galleryPhotos` (D1), `deckUrl` (C).
- [ ] Every place that repeats projects: the About Build Sheet project count, the logo wall ticket, About pillar text when the project is a pillar's proof.
- [ ] Guards: tests/r83 (organiser plates), r18 (focus neighbours follow the order), r10.

### D4. Experience / role

- [ ] `experiences` (experience-section.tsx): copy a sibling; dates exactly as the owner states them; `logo` through
      `ORG_LOGOS` (never a raw `<img>`); photos per D1.
- [ ] Repeats: About Build Sheet roles count, About "Finance & Leadership" pillar, highlight tape.

### D5. Organiser logo (projects)

- [ ] Intake (B); trim to the ink; 160 px tall PNG in `public/images/logos/organisers/`; entry in `lib/organisers.ts`
      with the real size. A mark drawn for a dark ground gets `dark: true` (it sits on an ink chip INSIDE the same
      white plate) - never a different plate.
- [ ] Shown ONLY through `<OrganiserPlate>`: `md` on the project card (the R88 HOSTED BY strip under the title block, with
      the organiser's `name` printed - every entry needs its full name; ask Howard if it is missing), `sm` on the project
      index tile.
      Every project has one; projects that share an organiser share the entry.

### D6. Certificate

- [ ] Privacy (B2). A picture unless the PDF's text layer is verified clean.
- [ ] `certificateUrl` on the honour; a PNG also gets its real size in `CERT_SIZE`; a PDF gets a preview PNG.
- [ ] Guards: tests/r49 (VIEW CERTIFICATE), r51 privacy notes in honors-section.tsx.

### D7. CV / resume

- [ ] Read all pages; privacy (B2); compare its text with the previous `public/resume.pdf` (`difflib` over the pypdf
      text) and report what changed.
- [ ] Replace `public/resume.pdf` - same name, so the header, footer stub, contact, command palette and drawer all
      update at once. Never a second CV file, never a versioned name.
- [ ] Facts that differ between the CV and the site (dates, titles, awards) are LISTED for Howard, not silently changed
      (A3). Visitors who opened the old file may see it for up to an hour (vercel.json max-age=3600).
- [ ] After the deploy: download the live `/resume.pdf` and compare it byte for byte with the upload.

## E. Consistency rules for the look

- One component per kind: gallery = `interactive-photo-stack`; organiser = `OrganiserPlate`; experience wordmark =
  `OrgLogo`; crest = `InstitutionSeal`; emblem = `HonorEmblem`. A new need is a prop on that component, not a copy.
- Logos always sit on white with an ink border, at the component's fixed height; never on a tinted card, never
  rotated, never faint, never recoloured.
- Colour by SIGNAL KEY only (lib/signal.ts). Names and dates in the owner's spelling.
- Text that does not fit (a long issuer, a five-character medal value) is solved in the component for every item,
  never with a one-off size for one item.

## F. Verify and report

- `node scripts/verify.mjs`, the guards of the kinds touched, a build + `node scripts/device-sweep.mjs`, and
  screenshots of the changed section on desktop and a phone (look at them).
- Report: every file added (path, size), every place updated (component + list name), the privacy check result, the
  facts that disagree with the owner's source, and the originals still in the repo root.

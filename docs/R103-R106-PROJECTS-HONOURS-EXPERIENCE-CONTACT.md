# R103 - R106: real project files, the company-card host plate, treasurer roles split, honours ticket wall, the Contact credential

Owner, 9 Nov 2026 (five screenshots):

- Projects: "the key architecture part is ugly, no info, superficial ... I would rather you put more words to explain my
  product completely ... more technical info based on my real projects, not fake"; "the HOSTED BY logo placement is very
  ugly ... redesign it, or put the logo like my Experience section does".
- Honours: "a big empty space ... not organised ... make it neat, natural neo-brutalism, not vibe-coded"; Water Nexus is
  nearly empty: "put some info in, or ask me, I can give it to you".
- Contact (circled): "the drawn line under the words is ugly, messy ... make it brutalist".
- Experience: "keep the treasurer work summarised in ALL, but on the LEADERSHIP track every treasurer experience must be
  separate, so it shows how many different experiences I have".

## Research

| Reference                                                                                                                                                                          | What was taken                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)                                                                                               | rules as structure: the technical file and the ledgers are ruled tables, not floating chips     |
| [Neubrutalism guide](https://hn.jakechampion.name/reader/https://neubrutalism.com)                                                                                                 | flat fills, hard shadows; a "key" per credential instead of a drawn underline                   |
| [RetroUI: 12 neobrutalist websites](https://retroui.shadcn.io/blogs/12-neobrutalist-websites-you-should-know-in-2026)                                                              | one idea per section: the dossier (projects), the ledger (treasurer), the ticket wall (honours) |
| CSS multi-column masonry ([MDN: columns](https://developer.mozilla.org/en-US/docs/Web/CSS/columns), [break-inside](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside)) | balanced columns where each card keeps its own height; no row stretches a short card            |
| The site's own Experience company card (R48 `data-org-plate`)                                                                                                                      | the owner's preferred logo placement, reused for the organiser                                  |

## Sources of the new project facts (nothing invented)

| Project                                                  | Source                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| ZeroLag                                                  | `public/documents/supervity-pitchdeck.pdf` (AutoPilot Asia 2026, Round 2)     |
| ProofPay                                                 | `public/proofpay_pitch_deck.pdf` (MUBA 2026, Sui Track 01)                    |
| Monsun Bridge                                            | the team's website edition (shenenleow10521.github.io/monsun-bridge/web.html) |
| BILAHUJAN, Catfish Detector AI, Slotify, Sensor X Sensei | each repository's README on github.com/HowardWoon                             |

Each card prints its source under the technical file.

## What changed

- R103 `components/stacked-projects.tsx` + `app/project-file.css`: a role line, the description and the build points in
  FULL (the R92 label chips + READ MORE are retired on project cards), and a TECHNICAL FILE (3 - 4 ruled sections of
  facts from the source). `components/organiser-plate.tsx`: the host is a company card - the logo on a white tile, an ink
  HOSTED BY tag over the organiser's name - on the project's soft SIGNAL tint.
- R104 `components/experience-section.tsx` + `app/treasurer.css`: the four PEKOM treasurer roles are one list
  (`TREASURER_EVENTS`). ALL: the PEKOM card keeps the summary accordion. LEADERSHIP (count 5): the PEKOM card keeps its
  totals and each role follows as its own card - event title, role line, the role's own text and a ruled LEDGER of its
  figures (all already in its text).
- R105 `components/contact-section.tsx`: "Software Engineering @ Universiti Malaya (4.00 CGPA)" is three printed keys
  (ink / paper / ACADEMIC orange) instead of a 4 px underline that broke over two lines.
- R106 `components/honors-section.tsx`: the results are a ticket wall (balanced CSS columns, 3 / 2 / 1), every card as
  tall as its content, the description in full, the emblem and certificate key side by side as the stub.

## Open

- Water Nexus Symposium 2026: the card holds only what the owner gave (champion, Smart Water Utilities Track). The owner
  will send the month, organiser, project and photos; they then go in through 50-content-updates D2.
- MYTECH text states both a 79.9% and an 81.5% spending cap (existing wording, unchanged): the owner to confirm which.

## Guard

`tests/r103.spec.ts` (all four rounds); `tests/r92-label-first.spec.ts` and `tests/r21.spec.ts` updated to the owner's
new layout (labels-first only on Experience; honours in columns, none alone).

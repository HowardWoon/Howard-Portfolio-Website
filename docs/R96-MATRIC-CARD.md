# R96 - The Build's student ID follows the real matric card (owner, 5 Nov 2026)

Owner, with a screenshot of The Build (02 PARSE) and a photo of the real Universiti Malaya matric card: "the orange
matric student card must based on the photo i attached which is my formal matric student card to design and create,
must be similar and perfect".

## 1. Owner's choices (asked 5 Nov 2026)

- **What is copied:** the card's layout, the UM crest and its printed lines, word for word: HOWARD WOON HAO ZHE /
  BACHELOR OF COMPUTER SCIENCE (SOFTWARE ENGINEERING) / FACULTY OF COMPUTER SCIENCE AND INFORMATION TECHNOLOGY /
  KL / 2025/2026.
- **Left out:** the bank and payment marks (the card is also an RHB Visa debit card: RHB, VISA Debit, MyDebit, ISLAMIC,
  the chip), the government crest and MySISWA, and the matric number (privacy, like IC numbers).
- **Photo:** the pixel portrait stays (not the formal photo from the card).

## 2. Research

| Reference | What was taken |
| --- | --- |
| The owner's own matric card (photo, 5 Nov 2026) | portrait orientation; photo top left on a blue ground; crest + UNIVERSITI MALAYA top right; name, programme, faculty below without labels; campus and session bottom left |
| ISO/IEC 7810 ID-1 (85.60 x 53.98 mm, the size of bank and student cards) | the portrait card keeps the ID-1 proportions as the base for its layout |
| The site's own R90 spec sheet (docs/R90-THE-BUILD-REDESIGN.md) | stays neo-brutalist: paper, 3 px ink, the orange academic signal as the header band and hard shadow, mono labels, the ENROLLED rubber stamp |

## 3. What changed

- `components/build-story.tsx`: the card body is the matric card's order: STUDENT ID tag and crest + UNIVERSITI MALAYA in
  the orange band; photo | CGPA; the printed lines; KL / 2025/2026 and the barcode. CGPA 4.00 stays (site content).
- `app/build-story.css`: a portrait card 300 px wide on desktops; on phones and short windows (<= 1023 px wide or
  <= 760 px tall, where the card is stacked over the terminal) the same card lies wide - photo, CGPA under it, the lines
  beside. The ENROLLED stamp lands in the free corner above CGPA (desktop) or on the barcode (phone): it covers no word.
  The parked card (scene 03) is a 90 x 137 px label at 0.3, 14 px under the HUD; the reel gives up the extra 50 px.
- The terminal (02 PARSE) wraps long lines at every width; they were cut at the card edge on desktops
  ("SQL ·", "System Archi").
- `tests/r29.spec.ts`: the KMNS gallery test waits for hydration and for the photo to load (red on CI: NaN ratio).

Guard: `tests/r96.spec.ts` (the card's lines present, the left-out marks absent, nothing under the stamp, the card on
screen under the HUD, the parked label under the HUD).

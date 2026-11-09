# R99 - Design critique of the whole site, and the plan to give every section its own neo-brutalist identity

Owner, 9 Nov 2026 (with a screenshot of a Google image search for neo-brutalist web design): "go research, must improve
my entire portfolio website ui, make sure every user interface, every scene, every page, every section must have their
own unique strong neo brutalism taste and ui ux design, must be professional, improve the entire neo brutalism style,
all the frame scrolling, dooms etc all must make it to neo brutalism theme".

Method: the live site (8fc84b8) photographed section by section at 1440 x 900 and 390 x 844, including five frames of
The Build and two of the Doom Walk; each section compared against the references below.

## 1. Research

| Reference                                                                                                                                                                                                                                 | What it says that matters here                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)                                                                                                                                                      | thick borders and angular forms create STRUCTURE; the style works only with a clear hierarchy and strong UX - decoration without hierarchy reads as noise     |
| [Neubrutalism - The Definitive Guide](https://hn.jakechampion.name/reader/https://neubrutalism.com), [The definitive guide to Neubrutalist web design](https://manualdousuario.net/en/neubrutalism-web-design/)                           | three rules: 2 - 5 px borders, hard 0-blur offset shadows, flat single-colour fills; type is the primary graphic device                                       |
| [daisyUI trends: neubrutalism](https://trends.daisyui.com/trend/neubrutalism/), [brutalism](https://trends.daisyui.com/trend/brutalism/)                                                                                                  | one radius and one shadow offset across the whole system; colour blocks, not tints                                                                            |
| [RetroUI: 12 neobrutalist websites to know in 2026](https://retroui.shadcn.io/blogs/12-neobrutalist-websites-you-should-know-in-2026), [Awwwards: brutalism inspiration](https://www.awwwards.com/inspiration/personal-brutalist-website) | the strong examples give each page or section ONE big idea (a poster, a ledger, a ticket, a terminal) instead of the same card kit everywhere                 |
| The owner's screenshot (Dribbble / Really Good Designs / Figma "neo-brutalism")                                                                                                                                                           | poster-scale type, colour-blocked panels that fill the frame edge to edge, stickers and stamps as real UI (badges, prices, CTAs), almost no empty white space |

## 2. Overall impression

The system is solid - 3 px ink, hard shadows, mono labels, flat SIGNAL colours - and the hero forme, the Arena Wall
and the matric card are strong. The biggest problem is **sameness**: About, Projects, Experience, Honours and Contact
all open with the same template (tilted yellow `X // Y` tag, two-line headline, tilted note card on the right), and the
same SIGNAL KEY table appears three times. The second problem is **empty frames** in the scroll scenes (The Build
03, the Doom Walk's right half), which read as unfinished rather than bold.

## 3. Findings by section

| #   | Section                       | Finding                                                                                                          | Severity | Recommendation                                                                                                                  |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | All sections                  | Same header template five times; the eye stops recognising sections                                              | Critical | Each section gets ONE signature header form (below, section 5)                                                                  |
| 2   | Projects, Experience, Honours | SIGNAL KEY table repeated three times, each taking ~180 px before the content                                    | Moderate | One key, printed once (a fold-out legend in the header / dock); sections show only the chips they use, inline                   |
| 3   | The Build, frame 0060         | The student ID drops over the fading title and under the HUD pills: two things fight for one spot                | Critical | The title clears (hard cut) before the card drops; the card lands below the HUD                                                 |
| 4   | The Build, 03 ARCHITECT       | ~60 % of the frame is white; the board is small and far from the parked ID                                       | Moderate | Scale the board to the frame; draw the grid of the drafting sheet the board sits on (structure, not decoration)                 |
| 5   | Doom Walk                     | Right half empty for the first half of the walk; the receipt starts at the bottom edge                           | Moderate | The receipt printer is fixed at the top right from frame 0 (paper feeds DOWN as he walks); the frame and printer fill the stage |
| 6   | Projects card                 | Long left column, empty right column under the gallery; radius mix (32 px card, pill buttons, square tags)       | Moderate | Gallery sticky beside the text; one radius rule: cards 0 or 12 px, buttons square with the hard shadow                          |
| 7   | Projects index                | Tiles grow to different heights with the organiser name (1 - 3 lines)                                            | Minor    | Fixed tile height, organiser name truncated to the plate, full name on hover / focus                                            |
| 8   | Experience                    | Treasurer events as rounded accordion rows with chevrons: the SaaS look                                          | Moderate | A ledger / receipt table (date, event, budget, surplus) - the content IS a ledger                                               |
| 9   | Honours                       | "PIN TO TRAY" pill on every card; Water Nexus card mostly empty                                                  | Moderate | Pin becomes a small corner stamp; cards size to content in a masonry of tickets / medals                                        |
| 10  | Diorama                       | macOS traffic-light dots (red / yellow / green) in the window bar: colour without a SIGNAL meaning, an OS cliche | Minor    | Square ink window keys like the rest of the OS windows                                                                          |
| 11  | Contact                       | Emoji in the intent buttons; "Alex Mercer" placeholder; "DIRECT TRANSMISSION CONSOLE" jargon                     | Moderate | Computed icons (law 5), a plain placeholder ("Your name"), a plain label ("Send a message")                                     |
| 12  | Header nav                    | "HONORS" stays active over the 3D diorama                                                                        | Minor    | The diorama has its own nav state (or none)                                                                                     |
| 13  | Phone, Projects card          | Five full-width tags before the gallery: the photo is three screens down                                         | Moderate | On phones the gallery leads the card, tags fold behind READ MORE                                                                |

## 4. What works

- The hero forme: poster-scale cast type with an extrusion that answers the pointer - the strongest moment on the site.
- The Arena Wall: real photos as taped prints on a yellow field - exactly the "stickers as UI" energy of the references.
- The split-flap Build Sheet, the matric card, the receipt ledger: mechanical, factual, on-brand.
- Accessibility basics hold: contrast passes (audit-ui), touch targets >= 44 px, type floor 0.8 rem.

## 5. The plan: one signature per section (one round each, research -> build -> measure -> owner review)

| Round | Section       | Signature form                                                                           | Replaces                                            |
| ----- | ------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| R100  | System        | One radius rule, one shadow scale, one key; the shared header template retired           | the five identical headers, three SIGNAL KEY tables |
| R101  | About         | A spec sheet / data plate: name plate, the four split-flap counters as the header        | tag + headline + note card                          |
| R102  | The Build     | Clean scene cuts (no overlap), the board scaled to fill its drafting sheet               | frame-0060 collision, empty 03                      |
| R103  | Doom Walk     | Printer fixed top right from frame 0, paper feeding down; frame + printer fill the stage | empty right half                                    |
| R104  | Projects      | A case-file / dossier per project: tabbed folder, sticky gallery, one radius             | long split card                                     |
| R105  | Experience    | A ledger: columns, totals row, rubber stamps for roles                                   | accordion rows                                      |
| R106  | Honours       | A ticket / medal wall in masonry, stamp-sized pin                                        | uniform cards with pills                            |
| R107  | Contact       | A postcard / mail form: stamp, postmark, address lines; no emoji                         | console with emoji                                  |
| R108  | Diorama + nav | Square window keys, its own nav state                                                    | traffic lights                                      |

Every round keeps every word, the SIGNAL KEY meanings and the owner's standing rules (torch, water portrait, no
background objects, no crop).

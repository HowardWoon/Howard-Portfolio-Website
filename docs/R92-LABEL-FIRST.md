# R92 - Label-first text (R87 plan P5)

Owner, 3 Nov 2026 (screenshots of the BILAHUJAN and PROOFPAY project cards): "the light-blue font in this whole
section is not obvious and a bit boring"; "wherever the website can express something with a visual or a label, use a
visual or a label, not all words - words are childish, long, and not everyone reads them; make it interactive and
readable - that's the brutalism strategy". AGENTS.md 8.3: a fact is shown as a label / chip / number first; the long
text sits behind it WORD FOR WORD; no invented wording.

## Research

| Reference | What was taken |
| --------- | -------------- |
| W3C APG, Disclosure (Show/Hide) pattern - https://www.w3.org/WAI/ARIA/apg/patterns/disclosure | The READ MORE key is a real `<button>` with `aria-expanded` + `aria-controls`; Enter / Space toggle it (native button). No `aria-pressed` on top (APG issue #897: both together confuse screen readers - https://github.com/w3c/aria-practices/issues/897). |
| Piccalil, "Use cases for aria-expanded" - https://piccalil.li/blog/use-cases-for-aria-expanded/ | The state lives on the control, the region follows it; same logic as the site's other drawers. |
| NN/g, Progressive disclosure - https://www.nngroup.com/videos/progressive-disclosure/ ; Jakob Nielsen, "Progressive disclosure" - https://jakobnielsenphd.substack.com/p/progressive-disclosure | Show the few facts most visitors need first, the rest one clearly labelled step away. Scanners judge by the first words, so a label starts with the fact itself (the number, the name). |
| UI-audit reference, progressive disclosure - https://cdn.jsdelivr.net/npm/ui-audit@1.0.2/references/21-patterns-progressive-disclosure.md | Never make "Read more" the only copy of information for assistive tech; cut at a natural break. Here nothing is cut: the labels are whole phrases and the full paragraph is always in the accessibility tree. |
| Chrome, "Making collapsed content accessible with hidden=until-found" - https://developer.chrome.com/docs/css-ui/hidden-until-found | `hidden=until-found` keeps find-in-page working but HIDES the text from screen readers and Chrome says not to use it in place of `.sr-only`. Owner's requirement is that screen readers keep the full text, so the closed paragraph is `.sr-only` (read aloud, not drawn). |
| GOV.UK summary list / details - https://design-system.service.gov.uk/components/summary-list/ | Key facts as short rows, detail behind a details-style disclosure - the "spec sheet" model. |
| Neo-brutalist portfolio breakdown - https://dev.to/highcenburg/brutal-efficiency-a-tech-breakdown-of-my-portfolio-1o2d ; brutalist portfolio templates (Framer Brutalist Studio - https://www.framer.com/marketplace/templates/brutalist-studio/ , FORMHAUS - https://superdesign.dev/library/formhaus-agency-website-brutalist-red) | Facts as bordered tag boxes with hard offset shadows, numbers in a bold block, mono tracked labels; project info as bordered index rows. Taken: chip = white box, 2 px ink, hard xs shadow, mono uppercase; a leading number sits in its own ink block (SIGNAL rule 7: a headline figure is ink with white text). |

## Decisions

1. **Taglines** (project subtitles and the other non-interactive `text-pop-blue` text): blue means "you can press this"
   (SIGNAL KEY). A tagline becomes an INK label: Bricolage display, extra-bold, larger, on a highlighter stripe in the
   card's OWN signal colour (`--lf-mark` = `SIGNAL[signal].hex`; the same colour as the card's spec bar, so the colour
   keeps its one meaning). No signal / INDUSTRY (ink): a thick ink underline instead of a stripe. Class `.lf-tag` in
   `app/label-first.css`.
2. **Long paragraphs** (`components/label-first.tsx`):
   - `LeadLabels` = the chips. Every chip is a VERBATIM substring of the paragraph it fronts (enforced in code: a chip
     that is not found is not drawn, and `tests/r92.spec.ts` fails). A chip that starts with a number draws the number
     in an ink block.
   - `ReadMore` = one `<button aria-expanded aria-controls>` "READ MORE" / "READ LESS" under the chips. The full text
     comes BELOW the button, so the button never moves when pressed (never lose the reader's place).
   - Closed: the full paragraph is `.sr-only` (screen readers read it in full; `innerText` / `textContent` keep it).
     Open: it is drawn, with the chip phrases set in extra-bold ink, word for word.
   - Chips are `aria-hidden` (they repeat words of the paragraph; a screen reader hears each sentence once).
   - Print: always open (no button, no chips).
   - Same behaviour at every width (the owner's complaint is about reading load, not screen size).
3. **Lists** (KEY ARCHITECTURAL HIGHLIGHTS, experience bullets): a numbered label row per point. The label is the
   point's own prefix before its first `:` when it has one (e.g. "Layer 1 Execution Node"), otherwise a phrase picked
   from the point (listed below). One READ MORE per list opens every point in full.
4. **About pillars** are themselves buttons (`role="button"`, R38), and a button may not hold another button; pressing
   a pillar also moves the masonry. So the pillar paragraphs stay visible and their key phrases are set in extra-bold
   ink (label-first by emphasis, no disclosure). The About lead paragraph (the bio under the H2) stays as it is: it is
   the page's one introduction, already carries its fact chips (Universiti Malaya, 4.00 CGPA) and runs the R27 ScrollInk.
5. **Not changed** (with reason): the hero torch words (owner's R86 rule: blue magnified words), the blueprint readout
   `PITCH / YAW` (live readout of the bench controls; tests/r12 reads it), header nav, VIEW ON MAP / trace keys / proof
   links (all controls), Experience headlines (one line each, already a label; the long PEKOM headline loses only its
   blue rule), honours `highlights` (already one-line bullets), the Dean's List / KMNS award paragraphs (already followed
   by the transcript / results boards).

## Non-interactive `text-pop-blue` found and treated

| Where | Text | Now |
| ----- | ---- | --- |
| stacked-projects.tsx subtitle | 7 project taglines | `.lf-tag` on the project's signal colour |
| experience-section.tsx | 4 x "Duration" (PEKOM dashboard) | ink |
| experience-section.tsx | short headlines (KRAIBURG, KMNS) | `.lf-tag` on the role's signal colour (KRAIBURG = industry: ink underline) |
| experience-section.tsx | long headline rule `border-pop-blue` (PEKOM) | `border-ink` |
| honors-section.tsx | issuing body under every honour title | ink, extra-bold |
| about-section.tsx | pillar headline (4) | `.lf-tag` on the pillar's signal (none = ink underline) |
| about-section.tsx | "TECHNICAL TOOLING MATRIX" | ink |
| contact-section.tsx | "Software Engineering @ Universiti Malaya (4.00 CGPA)" | `.lf-tag`, ink underline (Contact shows no signal legend) |
| contact-section.tsx | "// Select a conversation intent:" | ink |

Found, not changed (icons, not text): the hover arrow beside each project title (`ArrowUpRight`, blue, on a heading that
is not a link) - listed for Howard.

## Labels for Howard to check (every label is copied from the text it fronts)

### Projects - description chips

| Project | Chips |
| ------- | ----- |
| ZeroLag | Bi-Modal AI Agent Architecture · B2B buying groups · PDPA/GDPR compliance · deterministic halt states · zero pipeline pollution |
| PROOFPAY | B2B Transaction Truth Engine · built on Sui · non-custodial smart contract · Gonka-powered AI validates evidence |
| MONSUN BRIDGE | A planning tool for state and district planners · a plan a district can budget · Team DATAVENGERS (IPTA-093) · DOSM Datathon 2026 |
| BILAHUJAN | edge-ready civic intelligence platform · every civilian acts as a sensor node · Gemini 2.5 Flash 12-pass image triage · 7 standardised MCP tools · zero human intervention |
| CATFISH DETECTOR AI | exposes romance scammers · 51 behavioral heuristics · 50,000 raw dating profiles · 6-model ensemble engine |
| SLOTIFY | Spring Boot backend architecture · seven manually implemented data structures · Dijkstra's Shortest Path routing · optimal Big O time complexities |
| Sensor X Sensei | IoT-mediated building automation system · university lecture halls · dual-sensor fusion (PIR + NFC) · live carbon emission telemetry dashboards |

### Projects - KEY ARCHITECTURAL HIGHLIGHTS labels (P = the point's own prefix before ":")

| Project | Labels |
| ------- | ------ |
| ZeroLag | Layer 1 Execution Node (P) · Layer 2 Governance Node (P) · Compute-Optimized Logic Gates |
| PROOFPAY | Sui Move Smart Contract (P) · Gonka Router AI Verification (P) · Dispute Resolution (P) |
| MONSUN BRIDGE | Exposure (P) · Skill Bridge NLP (P) · East-coast fish landings retention gap · Besut pilot of 100 participants |
| BILAHUJAN | Autonomous Command Agent (Gemini 2.0 Flash) · 12-pass vision pipeline · Decentralised MCP Swarm architecture |
| CATFISH DETECTOR AI | Layer 1 Heuristic Engine (P) · Layer 2 ML Vote (P) · Explainable AI (SHAP) (P) |
| SLOTIFY | Memory Linkages (P) · Priority Engine (P) · Algorithmic Pathing (P) |
| Sensor X Sensei | Low-power ESP32 firmware · Next.js 15 telemetry dashboard · cutting idle energy consumption by -60.8% |

### Experience - bullet labels

| Role | Labels |
| ---- | ------ |
| KRAIBURG TPE | Accounts Payable (AP) and Accounts Receivable (AR) · vendor and customer master data migrations · statutory financial records |
| PEKOM | Portfolio Management (P) · B2B Corporate Partnerships (P) · Process Automation (P) · Financial Governance (P) |
| KMNS PAL | Peer-Assisted Learning (PAL) Facilitation (P) · Academic Mentorship & Concept Reinforcement (P) · Faculty Collaboration & Community Building (P) |

### Honours - description chips

| Honour | Chips |
| ------ | ----- |
| Supervity 2nd place | Architected ZeroLag · 5-agent sales intelligence command center · 55 enterprise and university teams · sub-second lead scoring pipelines |
| MUBA 2nd runner up | Developed ProofPay · B2B escrow and settlement platform built on Sui · smart contract milestone releases · AI-driven evidence verification |
| UM Game Jam 1st | 'The Goofy Experience' · psychological comedy/horror game · real-time UI hijacking · 100% custom audio |
| DOSM Datathon Top 5 | Lead builder and pitcher of Monsun Bridge · a planning tool for state and district planners · a plan a district can budget |
| UM Technothon Top 15 | 'Sensor X Sensei' · smart lecture hall energy management IoT system · ESP32 microcontrollers |
| Hari Inovasi gold | Gold Medal (Emas) · national-level Hari Inovasi PPAL 4.0 · technical innovation |
| Chemcreative gold | Gold Medal · state-level Chemcreative-Innovation competition · digital learning methodologies |
| Simposium PAL silver | Silver Medal (Perak) · Ministry of Education (KPM) · peer-mentorship strategies |
| V Hack qualifier | Architected BILAHUJAN · decentralised swarm intelligence platform for flood response · MCP-orchestrated command agent |
| UMSIC 2025 | Universiti Malaya Student Initiation Competition (UMSIC) 2025 · organized by PEKOM |

### About pillars - phrases set in extra-bold (paragraph stays visible)

| Pillar | Phrases |
| ------ | ------- |
| Full-Stack Products | Typed Next.js and React front ends · Spring Boot and FastAPI services · seven hand-built data structures · live carbon telemetry dashboards |
| Governed AI Agents | bi-modal agent workforce · 2nd place at Supervity AutoPilot Asia 2026 · 7 standardised MCP tools |
| Data, ML & Algorithms | a plan a district can budget · Top 5 and a consolation prize at the DOSM Datathon 2026 · 51 behavioural heuristics across 50,000 profiles |
| Finance & Leadership | Finance Lead and Executive Treasurer of PEKOM · Assistant Finance Executive & Intern at KRAIBURG TPE Technology · Assistant Head of Subject (Computer Science) |

## Guard

`tests/r92.spec.ts`: (1) no non-interactive element on `/` is drawn in `--pop-blue` text except the listed controls /
readouts; (2) every `[data-lf-chip]` text is found in its block's full text; (3) every block's full text is in the
accessibility tree while closed (`.sr-only`, not `display:none`), READ MORE has `aria-expanded`, Enter opens it, the
button does not move, the paragraph becomes visible; (4) taglines are ink. Content tests (r10, r13, r24, r49, r83,
honours) are unchanged.

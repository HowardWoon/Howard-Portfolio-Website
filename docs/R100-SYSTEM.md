# R100 - One system: one radius rule, one shadow scale, one key

Owner, 9 Nov 2026: "Start R100" - the first round of the plan in `docs/R99-DESIGN-CRITIQUE.md` (section 5).

## Research

| Reference                                                                                                             | What was taken                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)                                  | borders and angular forms are STRUCTURE; mixed radii read as noise, so the radius becomes a rule, not a per-component choice |
| [daisyUI trends: neubrutalism](https://trends.daisyui.com/trend/neubrutalism/)                                        | one radius token and one shadow offset across the whole system                                                               |
| [Neubrutalism - The Definitive Guide](https://hn.jakechampion.name/reader/https://neubrutalism.com)                   | hard 0-blur offset shadows only; the clay inset / blurred shadows on `.nb-btn` broke that rule                               |
| [RetroUI (shadcn neobrutalism kit)](https://retroui.shadcn.io/blogs/12-neobrutalist-websites-you-should-know-in-2026) | buttons are square keys with a hard shadow that collapses on press (translate by the shadow offset) - taken for `.nb-btn`    |

## What changed

1. **Radius scale** (`tailwind.config.ts`): md 6 px, lg 8, xl 10, 2xl = 3xl = 12 px. 48 arbitrary `rounded-[18-44px]` /
   `rounded-[2rem]` in 22 files became `rounded-2xl` (12 px); 13 CSS radii above 12 px on containers capped at 12 px.
2. **Shadow scale**: `shadow-clay` = `4px 4px 0 0 ink`, `shadow-clay-pressed` = none. The old clay shadows (inset, blur)
   are gone.
3. **Keys, not pills**: `.nb-btn` is a 6 px key with the hard shadow (hover lifts to 6 px, press sinks to 0); `.nb-chip`
   (tags, PIN TO TRAY, BLUEPRINT, award line), READ MORE and VIEW ON MAP are `rounded-md`. `rounded-full` stays only on
   round things (index discs, dots, icon keys).
4. **One key**: Projects, Experience and Honours print the SIGNAL KEY as a one-line strip of the colours they use
   (`<SignalKey strip only=[...] />`, the same words); the full table stays once, in the footer.

No wording, colour meaning, section or photo changed.

## Verification

Affected Playwright files (r9, r21, r22, r24, r31, r36, r49, r53, r62, r92, r98, smoke), `scripts/device-sweep.mjs`,
`scripts/audit-ui.mjs`; results in the round's report.

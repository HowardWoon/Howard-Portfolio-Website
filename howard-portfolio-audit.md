# Howard Woon Portfolio — Full Code Audit & Implementation Plan

**Repository:** `HowardWoon/Howard-Portfolio-Website` (branch `main`, HEAD `f8aa0d8`, 228 commits)
**Audit date:** 23 Sep 2026
**Scope:** every tracked source file (≈7,600 lines excluding `package-lock.json`): `app/`, `components/`, `lib/`, `middleware.ts`, `sql/`, all config files, `public/` assets.

---

## 0. How this was verified (not just read)

| Check | Command / method | Result |
|---|---|---|
| Install | `npm ci` | ✅ clean install |
| Type check | `npx tsc --noEmit` | ✅ 0 errors |
| Lint | `npx eslint .` | ❌ **1 error, 1 warning** (see §6.1) |
| Production build | `next build` (fonts stubbed, sandbox had no Google Fonts access) | ✅ builds, 12 routes. **`/` First Load JS = 203 kB** |
| Runtime | `next start` + headless Chromium (Playwright), desktop 1366×900 and mobile 360×740 | No hydration errors, no horizontal overflow at 360 px. **6 runtime bugs reproduced** (marked 🔬 below) |
| API | Direct POSTs to `/api/contact`, GETs to `/api/admin/*` | Origin check ✅, admin guard ✅, **bot-trap bypass reproduced** |
| Dependency audit | `npm audit --omit=dev`, `npm outdated` | 2 advisories (PostCSS inside Next, build-time only) |
| External repos | `git ls-remote` on every GitHub link | All 4 linked repos exist. **A 5th public repo (Sensor X Sensei) exists but is hidden on the site** |
| Assets | Sizes and pixel dimensions of all files in `public/` | 19.5 MB total. Two PDFs are ≥4.7 MB |

**Not verifiable from the sandbox:** live Vercel deployment, Supabase and Gmail delivery, and non-GitHub external links (itch.io, Firebase app, ProofPay Vercel app, Supervity orchestrator). Check those manually in an incognito window. §3.9 has the list.

**Overall verdict:** the codebase is in good shape technically. It compiles cleanly, has no hydration errors, uses sensible security patterns (service-role writes, RLS, origin check, honeypot, focus traps), and the comments show many earlier bugs were already fixed. The remaining problems fall into four groups:

1. **Real functional bugs** in counters, simulators, contact spam protection, the intent chips, and the admin UI.
2. **Content inconsistencies.** The same achievement or metric has different numbers in different places. This matters most, because interviewers read portfolios closely.
3. **Architecture debt.** The whole page is one client component, `site-data.ts` is mostly dead, and the admin CMS doesn't drive the site.
4. **Tooling gaps.** Lint never runs, and there's no CI and no tests.

---

## 1. Severity summary

| ID | Severity | Area | Title | Verified |
|---|---|---|---|---|
| B-01 | 🔴 High | UX | "Initialize System" gate blocks every full page load. Hero entrance animation plays hidden behind it | 🔬 |
| B-02 | 🔴 High | Bug | Honors stat counters show garbage frames: `0nd`, `1nd`, `0rd`, `#0`, `Top 0` | 🔬 |
| B-03 | 🔴 High | Bug | ZeroLag simulator: final stage never completes (stays pulsing) | 🔬 |
| B-04 | 🔴 High | Bug | BILAHUJAN simulator: every log timestamp is rewritten on each render. Log box never auto-scrolls | 🔬 |
| B-05 | 🔴 High | Security | Contact bot-trap is bypassed by omitting `startedAt`. The timer starts at page load, not form use | 🔬 |
| B-06 | 🔴 High | Bug | Quick-intent chips silently overwrite a message the visitor already typed | code |
| B-07 | 🔴 High | Content | Public Sensor X Sensei GitHub repo is hidden (`githubUrl: ""`). Game Jam itch.io link unused | git |
| B-08 | 🔴 High | Content | 20+ contradictory facts and numbers across sections, simulators, SQL seed and `site-data.ts` | code |
| B-09 | 🟠 Medium | Feature | Project cards never link to their simulators (`simulatorId` is a dead field) | code |
| B-10 | 🟠 Medium | A11y | About pillar cards are click-only (no keyboard). "ACTIVE" shown on all 4 cards. Markup copy-pasted 3× | 🔬 |
| B-11 | 🟠 Medium | A11y | Photo stack: `<button>` nested inside `role="button"` (invalid nested interactive) | code |
| B-12 | 🟠 Medium | Bug | Modal effects re-subscribe on every render, causing Lenis stop/start churn and scroll-lock re-application | code |
| B-13 | 🟠 Medium | Admin | Dashboard: 15 inputs with no label or placeholder, description rendered twice, no double-submit guard, category options don't match seed data | code |
| B-14 | 🟠 Medium | Admin | No sign-out anywhere. A signed-in non-admin gets silently bounced back to the login form | code |
| B-15 | 🟠 Medium | Admin | Server actions ignore DB errors. No error boundary. Inbox times render in server TZ (UTC on Vercel) | code |
| B-16 | 🟠 Medium | Arch | Admin CMS edits Supabase tables the public site never reads. `site-data.ts` is ~80% dead | code |
| B-17 | 🟠 Medium | Perf | Entire portfolio is one `'use client'` tree, so `/` ships **203 kB** JS (README claims ~100 kB) | build |
| B-18 | 🟠 Medium | Perf | 5.6 MB and 4.7 MB PDFs. 204 kB Spider-Man image eager-loaded on every visit | fs |
| B-19 | 🟠 Medium | Security | Admin mutation routes: weak payload validation, no Origin check | code |
| B-20 | 🟠 Medium | Security | No CSP / HSTS / COOP headers. Rate limit is per-instance only | code |
| B-21 | 🟠 Medium | DB | SQL functions lack `search_path`, admin UUID hard-coded in public SQL, no CHECK constraints, seed data contradicts UI | code |
| B-22 | 🟠 Medium | Tooling | Lint fails and is disabled during builds, `next lint` is deprecated, no CI, no tests | 🔬 |
| B-23 | 🟠 Medium | SEO | Simulator pages inherit `og:url = "/"`. No JSON-LD Person. Decorative headline duplicated as `<h2>` | code |
| B-24 | 🟡 Low | Deps | `@supabase/ssr` 0.5.2 (latest 0.12.x). Lucide brand icons removed in v1. Unused `clsx`/`tailwind-merge` | npm |
| B-25 | 🟡 Low | Semantics | Site `<footer>` lives inside `<section id="contact">` inside `<main>`, so it's not a contentinfo landmark | code |
| B-26 | 🟡 Low | UX | Command palette: no About/Contact/Simulators entries, background still scrolls, also active on `/admin` | code |
| B-27 | 🟡 Low | Misc | 12 small issues (focus-trap edge case, aria-controls, icon colour, duplicated constants, etc.) | code |

---

## 2. High-severity findings (details and fixes)

### B-01 — The boot gate blocks every visit, and the hero animation is wasted behind it 🔬

**Files:** `components/boot-sequence.tsx` (L15, L35), `components/bikebear-hero.tsx` (L150–L250)

**What happens**
- `bootedThisPageLoad` is a module variable, so **every** refresh or new tab shows the yellow gate and waits for a click. A recruiter opening your link from LinkedIn must click before seeing anything.
- The hero's `motion.*` entrance animations (`initial → animate`) start on mount, **under the gate**. Playwright measured the hero kicker at `opacity: 1` while the gate was still up. By the time the visitor clicks and waits 2.8 s, the entrance animation is already over, so they never see it.
- Lighthouse and Speed Insights will report the gate button as the LCP element, and "time to content" is effectively *human click + 2.8 s*.

**Fix (recommended: once per browser session, with the hero animating after the gate)**

1. Add a pre-paint inline script so returning visitors in the same tab session never see a flash:

```tsx
// app/layout.tsx — inside <html>, before <body>
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `try{if(sessionStorage.getItem('hw-booted')==='1')document.documentElement.classList.add('hw-booted')}catch(e){}`,
    }}
  />
</head>
```

```css
/* app/globals.css */
html.hw-booted .boot-overlay { display: none !important; }
```

2. Expose the boot state through context so the hero can animate **after** the gate closes:

```tsx
// components/boot-sequence.tsx
'use client';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

const BootedContext = createContext(true);
export const useBooted = () => useContext(BootedContext);

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [showBoot, setShowBoot] = useState(true);          // SSR: gate markup present (hidden by CSS if already booted)
  useLayoutEffect(() => {
    if (document.documentElement.classList.contains('hw-booted')) setShowBoot(false);
  }, []);

  function finish() {
    try { sessionStorage.setItem('hw-booted', '1'); } catch {}
    document.documentElement.classList.add('hw-booted');
    setShowBoot(false);
  }
  // …existing progress logic, call finish()…

  return (
    <BootedContext.Provider value={!showBoot}>
      {/* …existing JSX… */}
    </BootedContext.Provider>
  );
}
```

```tsx
// components/bikebear-hero.tsx (pattern for every hero motion element)
const booted = useBooted();
<motion.div initial={{ opacity: 0, y: 15 }} animate={booted ? { opacity: 1, y: 0 } : undefined} … />
```

3. Add a visible **"Skip intro"** link on the gate, and let `Enter`/`Space` anywhere dismiss it.
4. Optional: the gate never appears when the URL has a hash (`/#projects`) or `?nogate`, which is useful for links in your résumé.

> Your earlier comment says a `sessionStorage` version caused a "flash then fade" bug. That happened because state was read after paint. The inline `<head>` script above adds the class **before first paint**, so the gate never renders for returning visitors.

---

### B-02 — Counters show nonsense frames (`0nd`, `1nd`, `0rd`, `#0`, `Top 0`) 🔬

**File:** `components/animated-counter.tsx` (L11 regex, L39, L52)

**Reproduced:** while scrolling Honors into view, the captured frames were `['#0','0nd','0rd','Top 0', …]`.
The regex treats `"2nd"` as `prefix="" num="2" suffix="nd"`, resets it to `"0nd"`, then counts `0nd → 1nd → 2nd`. Same for `"3rd"`, `"#1"`, `"1st Yr"` and `"Top 1%"`. Counting a rank from 0 is meaningless and reads as a bug.

**Fix:** animate only real quantities (decimals, or integers ≥ 10). Leave ranks and ordinals static.

```tsx
const NUMERIC = /^([^0-9]*?)(\d+(?:\.\d+)?)(.*)$/;
const IS_RANK = (prefix: string, suffix: string) =>
  /#|top/i.test(prefix) || /^(st|nd|rd|th)\b/i.test(suffix);

function parse(value: string) {
  const m = value.match(NUMERIC);
  if (!m) return null;
  const [, prefix, num, suffix] = m;
  const n = parseFloat(num);
  const decimals = num.includes('.') ? num.split('.')[1].length : 0;
  const worthCounting = decimals > 0 || n >= 10;
  if (!worthCounting || IS_RANK(prefix, suffix)) return null;
  return { prefix, n, suffix, decimals };
}
// use `parse(value)` instead of `value.match(NUMERIC)`; when it returns null render `value` unchanged.
```

---

### B-03 — ZeroLag simulator never finishes its last stage 🔬

**File:** `components/project-simulators.tsx` L42–L56, L91–L92, L133

**Reproduced:** after the run, 1 stage still has `animate-ping` and only 4 of 5 stages show ✅. `currentStage` stops at `5`, which is the "current" condition for step 5 (`currentStage === stepNum`), so the last agent pulses forever while the log already says "Lead Qualified".

**Fix:** use `6` (= all done) as the terminal state.

```tsx
const DONE = stages.length + 1; // 6

const triggerPipeline = () => {
  if (isRunning) return;
  setIsRunning(true);
  let stage = 1;
  setCurrentStage(stage);
  const id = timers.interval(() => {
    stage += 1;
    setCurrentStage(stage);
    if (stage >= DONE) { clearInterval(id); setIsRunning(false); }
  }, 600);
};

// log line
{currentStage >= DONE ? "Lead Qualified: …" : isRunning ? `Executing Node #${currentStage}: ${stages[currentStage - 1]?.name}…` : "System Idle…"}
```

---

### B-04 — BILAHUJAN terminal: timestamps rewrite themselves, and the log hides new lines 🔬

**File:** `components/project-simulators.tsx` L150–L182, L246–L270

**Reproduced:**
- The timestamp is computed **during render** (`new Date()` at L267), so every new line re-stamps all previous lines with the current time (t1 = `15:56:56 ×2`, t2 = `15:56:59 ×6`). A mission log where every entry has the same time looks fake.
- The log box is `h-[150px] overflow-y-auto` with no auto-scroll. Content reached 216 px on desktop and 320 px on mobile with `scrollTop = 0`, so the key "Authority notification sent" line is **below the fold** and users never see the payoff.

**Fix**

```tsx
type LogLine = { t: string; msg: string };
const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

const [logs, setLogs] = useState<LogLine[]>([
  { t: '--:--:--', msg: '[System] Firebase RTDB connected.' },   // static on SSR → no hydration mismatch
  // …
]);
const push = (...msgs: string[]) => setLogs(p => [...p, ...msgs.map(msg => ({ t: stamp(), msg }))]);

const logRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const el = logRef.current;
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}, [logs]);

// render: <div ref={logRef} role="log" aria-live="polite" …>{logs.map((l, i) => <div key={i}>{l.t} {l.msg}</div>)}</div>
```

Remove `suppressHydrationWarning` afterwards. It's no longer needed.

---

### B-05 — The contact form's anti-bot timer is trivially bypassed 🔬

**Files:** `app/api/contact/route.ts` L28, L80–L84 · `components/contact-section.tsx` L36, L86

**Problems**
1. `startedAt` is **optional**. If absent, `elapsed = Infinity`, so the message is accepted. Verified: a POST without `startedAt` passed the trap and reached the delivery stage. Any script that doesn't send the field skips the check.
2. `startedAt` is recorded at **component mount** (page load). The form sits at the bottom of a page behind a 2.8 s gate, so even a bot that renders the page is always past 2.5 s.
3. Clock skew handling (negative elapsed = accepted) is also a bypass: send `startedAt` from the future.
4. The in-memory rate limit is per serverless instance (your comment acknowledges this).

**Fix:** measure the fill time **on the client clock only** and require it.

```tsx
// contact-section.tsx
const firstInteraction = useRef<number | null>(null);
<form onSubmit={handleSubmit} onFocusCapture={() => { firstInteraction.current ??= performance.now(); }}>
// in handleSubmit body:
fillMs: firstInteraction.current == null ? 0 : Math.round(performance.now() - firstInteraction.current),
```

```ts
// route.ts
fillMs: z.number().int().nonnegative().max(86_400_000),   // REQUIRED
// …
if (hw_hp_field || fillMs < 3000) return fakeSuccess();
```

**Stronger (recommended for production):**
- Add **Cloudflare Turnstile** (free, invisible) and verify the token server-side, **or**
- Use **Vercel Firewall** rate-limit rules / `@upstash/ratelimit` (Redis) keyed on `x-real-ip` for a global limit.

---

### B-06 — Intent chips overwrite what the visitor already typed

**File:** `components/contact-section.tsx` L65–L72

A recruiter writes a long message, then clicks "💼 2026 SWE Role" to set the subject. The **whole message is replaced**. Also:
- There's no Subject field, so after choosing a chip the subject can't be edited or cleared.
- The subject stays set even if the visitor rewrites the message entirely.

**Fix**

```tsx
const handleSelectIntent = (intent: (typeof quickIntents)[number]) => {
  const subject = intent.label.replace(/^\S+\s/, '');
  setActiveIntent(prev => (prev === intent.label ? null : intent.label)); // clicking again deselects
  setFormData(prev => ({
    ...prev,
    subject: prev.subject === subject ? '' : subject,
    // only prefill when the message is empty or is still an untouched template
    message: !prev.message.trim() || quickIntents.some(q => q.text === prev.message) ? intent.text : prev.message,
  }));
};
```

Also add a visible optional **Subject** input so the field that's stored in the DB is editable.

---

### B-07 — A real repo and a real game link are hidden

**Verified with `git ls-remote`:** `github.com/HowardWoon/Sensor-X-Sensei---UM-Technothon-2026` **exists and is public**. It's listed in `lib/site-data.ts` L159, but the live card uses `githubUrl: ""` (`components/stacked-projects.tsx` L580), so the GitHub button is suppressed.

Also unused: the Game Jam game link `https://howard-woon.itch.io/the-goofy-experience` (`site-data.ts` awards[0].link). The Honors "1ST PLACE (PUBLIC CHOICE AWARD)" card has no "Play the game" button, which is the most convincing proof you could show there.

**Fix:** set `githubUrl` for Sensor X, and add `externalUrl` + a "PLAY ON ITCH.IO" button to the Game Jam honor. ZeroLag's `githubUrl: ""`: if a repo exists (even a private one you can make public or share a demo video of), link it.

---

### B-08 — Contradictory facts across the site (credibility risk)

Interviewers cross-check. Each row is the **same fact** stated differently in different files. Pick one truth, put it in one data file (see §5 Phase 3), and delete the rest.

| # | Topic | Conflicting statements (file) |
|---|---|---|
| 1 | BILAHUJAN event | "V Hack 2026 Case Study 3" (`stacked-projects.tsx` L475, honors) vs "**KitaHack 2026**" (`about-section.tsx` L61, `site-data.ts` highlight) |
| 2 | BILAHUJAN stack | React/TypeScript/**Firebase**/Gemini (projects) vs **Flutter/Python/FastAPI/Supabase** (`site-data.ts` L139) |
| 3 | Supervity field size | "55+ APAC teams" (honors L48/L50) vs "50+ regional teams" (`site-data.ts` awards) |
| 4 | ZeroLag agents | Card: Identity, Dedupe, Comply, Score, Draft (`stacked-projects` L422) · Simulator: Ingestion, Scraper, Sentiment Scorer, Lead Ranker, CRM Dispatch (`project-simulators` L33) · Honors: "sentiment scoring with vectorized CRM dispatch" · SQL: "5-operator Supervity Master Orchestrator" |
| 5 | ZeroLag CRM/DB | "HubSpot API + PostgreSQL" (card) vs "Supabase & CRM" (simulator) |
| 6 | ZeroLag accuracy | "98.6% confidence" (`site-data.ts`) not shown anywhere else |
| 7 | Sensor X energy saving | **38.2%** (card metric and card telemetry) vs **28.4%** (`site-data.ts`) vs **60.8%** (simulator), and 1.84 → 0.72 kW is actually **60.9%** |
| 8 | Sensor X load | 1.42 kW (card) vs 1.84 kW (simulator) |
| 9 | Slotify Java | "Java 17" (card tags) vs "Java 21" (`site-data.ts`) |
| 10 | MUBA track | "Payments & Stablecoins" (honors title) vs "Sui Foundation track" (honors highlight) vs "(Sui)" (project badge) |
| 11 | MUBA framing | Badge "GLOBAL BLOCKCHAIN HACKATHON **WINNER**" for a 2nd-runner-up |
| 12 | Game Jam framing | Badge "NATIONAL GAME JAM **CHAMPION**" + title "1ST PLACE" for a **Public Choice** award; "39 universities" (honors) vs "39 Teams" (`site-data.ts`) |
| 13 | PEKOM expenditure | RM1,531.77 described as the **combined** Alphathon+CodeFest spend (`experience-section` L283) **and** as CodeFest's **own** total (L318) |
| 14 | MYTECH maths | Budget RM50,200, revenue RM46,200, surplus RM9,272.90, and an "81.5% spending cap". None of these reconcile (81.5% of 50,200 = 40,913, so the surplus would be ≈RM5,287) |
| 15 | Alphathon % | "89.2% of funds to prize pool", but USD 3,000 / 3,369 = **89.05%** |
| 16 | "Leverage Ratio 16.46x" | Undefined metric. RM62,550 sponsorship can't be derived from the listed events (46,200 + 14,150 + 2,700 = 63,050) |
| 17 | Availability | "Open to **full-time** roles" (contact) vs "seeking **internships or part-time**" (`site-data.ts` FAQ) |
| 18 | Kraiburg dates | "Nov 2025 – Present" (UI) vs `2025-06 → 2025-09` + separate `2024-03` internship (SQL seed) |
| 19 | PEKOM start | "2025 – Present" (UI) vs `2026-06-01` (SQL seed) |
| 20 | Hero kicker | Hero is labelled "**ABOUT** // VISION & SYSTEMS ARCHITECTURE", duplicating the real About section's kicker |
| 21 | Categorisation | "UMSIC 2025 **PARTICIPANT**" filed under "NATIONAL QUALIFIERS" |
| 22 | Unverifiable absolutes | "100% Audit Compliance", "Zero Discrepancies", "Sub-50ms API Latency", "Top 1%", "Wasted Compute: Zero", "90%+ Top Grades" |

**Recommendation:** keep numbers you can defend in an interview (with a source doc), soften the rest ("0 audit findings in FY25/26 review" instead of "100% compliance"), and use exact award names. A precise "Public Choice Award, UM Game Jam 2026" is more credible than "National Champion".

---

## 3. Medium-severity findings

### B-09 — Simulators are disconnected from their project cards
`simulatorId` (`"zerolag"`, `"bilahujan"`, `"sensor-x"`, …) is never read, and it doesn't match the real routes (`agentic`, `flood`, `energy`). The only entry point is the hero's "LIVE SIMULATORS" button.

**Fix:** replace `simulatorId: string` with `simulator?: 'agentic' | 'flood' | 'energy'` and render:
```tsx
{project.simulator && (
  <Link href={`/simulators/${project.simulator}`} className="nb-btn nb-btn-mint px-5 py-3">
    <Play className="w-4 h-4" strokeWidth={2.75} /> RUN SIMULATOR
  </Link>
)}
```
Also remove the hover `ArrowUpRight` next to project titles (L684). It implies the title is a link, but it isn't.

### B-10 — About pillars: keyboard-inaccessible, misleading "ACTIVE" badge, copy-pasted 3× 🔬
**File:** `components/about-section.tsx` L207–L304
- Cards are `<motion.div onClick>` with no `tabIndex`/role (Playwright: `tabindex = null`), so keyboard users can't activate them.
- The "ACTIVE" badge (L233/266/298) renders on **every** card regardless of `isActive`.
- The same ~30-line card is written three times (mobile list + two desktop columns).

**Fix:** one `PillarCard` component, one list, CSS stagger instead of two filtered columns:
```tsx
<div className="grid gap-7 lg:grid-cols-2 lg:gap-8">
  {architecturePillars.map((p, i) => (
    <PillarCard key={p.id} pillar={p} index={i} className="lg:even:translate-y-10" />
  ))}
</div>
```
Inside `PillarCard`, either drop the "active" concept (use `hover:` + `focus-within:` styles) or put a real `<button aria-pressed>` in the card header. Show the status badge only when active.

### B-11 — Photo stack nests a button inside a `role="button"`
**File:** `components/interactive-photo-stack.tsx` L33–L80
Nested interactive controls are invalid ARIA: screen readers announce them wrongly, and Space/Enter on the inner button can bubble.

**Fix:** make the wrapper a plain `div` and add two explicit buttons: **"Next photo"** (cycles) and **"Open full size"**. Also:
- `aria-label={cards[0]?.alt}` doesn't say what the control *does*. Use `aria-label="Next photo (3 of 8: ProofPay Interface 3)"`.
- "CLICK ALBUM TO CYCLE" → "TAP TO CYCLE" on touch (`@media (hover:none)`).
- Only render the top 4 cards. Index > 3 are invisible (`opacity: 0`) but still download.
- "Open full size" uses `window.open(photo.src)`. Open it in the existing certificate-style lightbox instead of a raw file tab.

### B-12 — Modal effects re-run on every render
**Files:** `components/honors-section.tsx` L306–L317, L653 · `components/field-record-viewer.tsx` L215–L232 · `components/field-archive.tsx` L169

`onClose={() => setSelectedCert(null)}` is a new function every render, and the viewer's `handlePrevious/handleNext` change on every navigation. Each change runs cleanup (`body.overflow = prev`, `lenis.start()`) and then setup again (`lenis.stop()`). That's harmless most of the time, but it causes scroll jumps with Lenis and can restore the wrong overflow value if two modals overlap.

**Fix:** a small "latest ref" hook, with effects that run once:
```ts
// lib/use-latest.ts
import { useLayoutEffect, useRef } from 'react';
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => { ref.current = value; });
  return ref;
}

// lib/use-scroll-lock.ts — shared by every modal
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    return () => { document.body.style.overflow = prev; window.__lenis?.start(); };
  }, [active]);
}
```
```tsx
const onCloseRef = useLatest(onClose);
useScrollLock();
useEffect(() => {
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [onCloseRef]);
```

### B-13 — Admin dashboard form is unusable
**File:** `components/admin/dashboard-client.tsx`
| Line | Problem |
|---|---|
| 198–203, 258–264, 314 | 15 inputs with `placeholder=" "` and **no label**, so the admin sees blank boxes and can't tell Role from Company. `floating-field` only adds `position:relative`, and the floating-label markup was never added |
| 278 + 300 | `item.description` rendered **twice** per project (subtitle should be `item.context`) |
| 58–64 | `run()` has no pending state: double-clicking "Add" inserts duplicates |
| 62 | Delete success toast says "Deletion saved." |
| 315–320 | Category `<select>` offers Languages/Backend/AI/ML/Design, but the seed uses **Frameworks** and **Tools**, so editing a seeded skill shows a blank select |
| 264 | `display_order` is a free text box. `"abc"` → `NaN` → DB error |
| 206 | `is_current` and `end_date` can both be set (contradictory) |
| 355–362 | trailing blank lines |

**Fix:** a labelled `Field` component, a `busy` flag, and categories derived from the data:
```tsx
function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <div className="floating-field">
      <input id={id} className="floating-input" placeholder=" " {...props} />
      <label htmlFor={id} className="floating-label">{label}</label>
    </div>
  );
}
// categories
const categories = Array.from(new Set(['Languages','Frameworks','Backend','AI/ML','Tools','Design', ...skills.map(s => s.category)]));
// busy guard
const [busy, setBusy] = useState(false);
const run = async (label, action, confirmText?) => {
  if (busy || (confirmText && !confirm(confirmText))) return;
  setBusy(true); setNotice(null);
  try { await action(); setNotice({ kind: 'ok', text: `${label} done.` }); }
  catch (e) { setNotice({ kind: 'error', text: e instanceof Error ? e.message : 'Something went wrong.' }); }
  finally { setBusy(false); }
};
```
Use `<input type="number" min={0} step={1}>` for display order, and disable `end_date` when `is_current` is checked.

### B-14 — No sign-out, and a silent bounce for non-admins
- `grep signOut` finds nothing. Once signed in, the only way out is clearing cookies.
- `login-form.tsx` L29: after a **successful** sign-in by a non-admin account, `router.push('/admin/dashboard')` → `requireAdminUser` redirects back to `/admin/login` → the login page shows the empty form again with **no message**.
- `login-form.tsx` L21: if `signInWithPassword` throws (network error), `loading` stays `true` forever. Use `try/finally`.

**Fix**
```ts
// app/admin/signout/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/admin/login', req.url), { status: 303 });
}
```
```tsx
// app/admin/login/page.tsx — when data.user exists but is not admin
<p>Signed in as {data.user.email}, which is not an admin account.</p>
<form action="/admin/signout" method="post"><button className="pill-button">Sign out</button></form>
```
Add a "Sign out" form button in `app/admin/layout.tsx`, shown only when a user exists.

### B-15 — Inbox actions and dates
**Files:** `app/admin/messages/actions.ts`, `app/admin/messages/page.tsx`
- `update()`/`delete()` results are ignored (L16, L23, L30). Failures look like success. Check `{ error }` and `throw new Error(error.message)`.
- `id` isn't validated. Add `z.string().uuid().parse(id)`.
- No `app/admin/error.tsx`, so any thrown action shows the generic Next error screen. Add an error boundary with a "Retry" button.
- L87 `new Date(created_at).toLocaleString()` runs **on the server**. On Vercel that's UTC in `en-US` format, so a message sent at 9 am Malaysia time shows as 1 am. Use:
  ```ts
  new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(message.created_at))
  ```
- L96 uses `next/link` for `mailto:`. Use a plain `<a>`.
- L124 `ml-auto` on the delete button has no effect (the `<form>` is the flex child). Move `ml-auto` to the `<form>`.
- Pre-fill the reply subject with the original subject: `?subject=${encodeURIComponent('Re: ' + message.subject)}`.

### B-16 — Admin CMS and `site-data.ts` don't drive the site
- The dashboard's own banner admits edits "do not change the live site". The public components hard-code their data (`about-section.tsx`, `stacked-projects.tsx`, `experience-section.tsx`, `honors-section.tsx`).
- `lib/site-data.ts`: `heroStats`, `tickerKeywords`, `faqs`, `awards`, `fallbackAwards`, `projects`, `experiences` are **never rendered** (only used as admin fallback), yet the README calls it "the single source of truth". It also holds most of the conflicting numbers in B-08.
- `lib/utils.ts` (`cn`) is unused, so `clsx` and `tailwind-merge` are dead dependencies.
- `profiles` table is never read.

**Decision needed. Pick one:**
- **Option A (recommended for a portfolio): content-as-code.** Delete the experiences/projects/skills CRUD (keep **only the Inbox**), delete the fallback client, and move all content into typed files under `content/` (§5 Phase 3). Simpler, faster, no DB dependency for the homepage.
- **Option B: real CMS.** Make the homepage a Server Component that reads Supabase with `export const revalidate = 3600` and `revalidateTag('content')` on save. Extend the tables to hold everything the cards render (badges, metrics, highlights, galleries…). Much more work. Only worth it if you'll update content often without deploying.

### B-17 — 203 kB first-load JS: the whole page is a client component
`components/portfolio-page.tsx` starts with `'use client'`, so every section, every string of content, and all of `framer-motion` ship to and hydrate in the browser. Build output: `/` = **55 kB page + 103 kB shared = 203 kB**. The README says "~100kB".

**Fix (incremental)**
1. Remove `'use client'` from `portfolio-page.tsx`. `BootSequence`, `SiteHeader`, `ScrollToTop` stay client islands (a client component can take server-rendered `children`).
2. Create one tiny client wrapper for scroll reveals:
   ```tsx
   // components/reveal.tsx
   'use client';
   import { motion, type HTMLMotionProps } from 'framer-motion';
   export function Reveal({ delay = 0, y = 20, ...rest }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
     return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }} {...rest} />;
   }
   ```
3. Convert the section files to Server Components that use `<Reveal>` around blocks. Keep interactive pieces (filter buttons, honor category keys, accordion, photo stack, contact form) as small client components.
4. `next/dynamic` the modals (`CertificateModal`, `FieldRecordViewer`) and `cmdk` (`CommandPalette` → load on first Ctrl+K or button click).
5. Consider `LazyMotion` + `m` components from framer-motion to cut its footprint.
6. Measure with `ANALYZE=true` via `@next/bundle-analyzer`. Target < 150 kB first load.

### B-18 — Heavy assets
| Asset | Size | Action |
|---|---|---|
| `public/proofpay_pitch_deck.pdf` | 5.6 MB | Compress (`gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook`), target ≈1 MB. Move to `/documents/` |
| `certificates/UMSIC HOWARD_WOON_HAO_ZHE.pdf` | 4.7 MB | Same, or export a 1600 px PNG/WebP |
| `images/spiderman.jpg` | 204 kB | `loading="eager"` on every visit including phones. Mount the `<Image>` only after the first `pointerenter` on the portrait (or use `fetchPriority="low"`) |
| Slotify/Catfish PNG screenshots | 150–540 kB | Already go through `next/image` ✅, but re-export sources as WebP to shrink the repo |
| 11 files with **spaces** in names (`Screenshot 2026-08-25 225954.png`, `UM TECHNOTHON 2026.pdf`, …) | — | Rename to kebab-case. Spaces work in `next/image` but break when copy-pasted into chats, emails, some crawlers |

### B-19 — Admin API payload validation
**File:** `app/api/admin/[resource]/route.ts`
- `start_date`/`end_date` are cast, not validated, so any string reaches Postgres.
- `tags` accepts any array (`[{}]`, numbers).
- `display_order: Number(...)` can be `NaN`/`Infinity`.
- `id` isn't checked to be a UUID.
- Raw DB `error.message` is returned (admin-only, but still leaks schema details).
- No `Origin` check. Supabase cookies are `SameSite=Lax`, which blocks most CSRF, but a same-site subdomain or future cookie change would expose it.

**Fix:** per-resource zod schemas.
```ts
const Uuid = z.string().uuid();
const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional();
const Experience = z.object({
  role: z.string().trim().min(1).max(200), company: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  start_date: DateStr, end_date: DateStr, is_current: z.boolean().default(false),
});
const Project = z.object({
  title: z.string().trim().min(1).max(200), context: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(5000),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  project_url: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
  display_order: z.number().int().min(0).max(1000),
});
const Skill = z.object({ name: z.string().trim().min(1).max(80), category: z.string().trim().min(1).max(40) });
// PATCH: schema.partial().extend({ id: Uuid })   DELETE: z.object({ id: Uuid })
```
Add the same `origin === host` check the contact route has, and return a generic `"Save failed"` while logging the real error server-side.

### B-20 — Security headers and rate limiting
`vercel.json` sets `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` ✅ but no CSP, HSTS or COOP. Move headers into `next.config.mjs` so they also apply locally and in previews:

```js
// next.config.mjs
const isDev = process.env.NODE_ENV !== 'production';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,   // Next inline bootstrap; move to nonces later
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
  "object-src 'self'",          // PDF <object> certificates
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig = {
  // …existing…
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};
```
Deploy with CSP as `Content-Security-Policy-Report-Only` first, check the console on every page (home, simulators, certificate modal, admin login), then switch to enforcing.
Remove `cleanUrls`/`trailingSlash` from `vercel.json`. They're for static sites and are ignored or confusing with the Next.js framework preset.

### B-21 — Database (`sql/001_init.sql`)
| Line | Issue | Fix |
|---|---|---|
| 21, 31 | Functions have a mutable `search_path` (Supabase Security Advisor warning `function_search_path_mutable`) | add `set search_path = ''` and fully-qualify (`auth.jwt()`) |
| 37 | Your admin auth UUID is hard-coded in a **public** repo | Not a secret by itself, but unnecessary. Use `app_metadata.role = 'admin'` only (set once via service role) and delete the UUID branch |
| 124–130 | `public.is_admin(auth.uid())` re-evaluated per row | Supabase RLS perf guidance: `using ((select public.is_admin((select auth.uid()))))` |
| 77–85 | No length limits in DB | `check (char_length(name) <= 120)`, same for email (200), subject (200), message (5000) |
| 41–47 | `profiles` table unused | drop, or use it for the content CMS (Option B) |
| 132–276 | Seed rows contradict the UI (B-08 #18, #19), and skill categories don't match the dashboard | Regenerate seed from the single content source, or delete the seed if you choose Option A |

```sql
create or replace function public.is_admin()
returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- one-time, as service role:
-- update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where id = '<your-uuid>';

alter table public.contact_messages
  add constraint contact_name_len    check (char_length(name)    between 1 and 120),
  add constraint contact_email_len   check (char_length(email)   between 3 and 200),
  add constraint contact_subject_len check (subject is null or char_length(subject) <= 200),
  add constraint contact_message_len check (char_length(message) between 1 and 5000);
```
Put schema changes in numbered migration files (`sql/002_…sql`) or adopt `supabase/migrations/` with the Supabase CLI.

### B-22 — Tooling: lint fails and is never run 🔬
- `npx eslint .` → **error** `@typescript-eslint/triple-slash-reference` in `next-env.d.ts` (auto-generated, should be ignored) and a warning in `postcss.config.mjs`.
- `next.config.mjs` has `eslint.ignoreDuringBuilds: true`, and `npm run lint` uses `next lint`, which is **deprecated in Next 15.5 and removed in Next 16**.
- No CI, no tests, no Prettier. Indentation is visibly inconsistent in `stacked-projects.tsx`, `experience-section.tsx`, `honors-section.tsx`.

**Fix**
```js
// eslint.config.mjs
const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];
```
```js
// postcss.config.mjs
const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;
```
```json
// package.json scripts
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"format": "prettier --write .",
"test:e2e": "playwright test",
"check": "npm run typecheck && npm run lint && npm run build"
```
Then set `eslint.ignoreDuringBuilds: false`, or leave it and rely on CI (below).

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

### B-23 — SEO
- **Simulator pages inherit `openGraph.url: '/'` and the homepage title/description** from `app/layout.tsx`, so sharing `/simulators/flood` on LinkedIn shows the homepage card and URL. Add `openGraph: { url, title, description }` and a `description` in `generateMetadata`.
- **No structured data.** Add JSON-LD `Person` so Google can show a knowledge panel:
  ```tsx
  // app/page.tsx
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: 'Howard Woon Hao Zhe', alternateName: 'Howard Woon', url: SITE_URL,
    image: `${SITE_URL}/images/howard-solid.jpeg`, jobTitle: 'Software Engineering Student',
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universiti Malaya' },
    sameAs: [LINKEDIN_URL, GITHUB_URL],
  };
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  ```
- `bikebear-hero.tsx` L74: the decorative magnifier copy is a second `<h2>` with identical text. `aria-hidden` hides it from screen readers but **not from crawlers or the document outline**. Change it to a `<div>`/`<p>`.
- The only `<h1>` is "HOWARD WOON" inside the fixed header. That's acceptable, but a stronger pattern is `<h1>` = "Howard Woon — Software Engineer" in the hero, with the header name as plain text.
- `sitemap.ts` uses `new Date()` (build time) for every URL. Use real last-content-change dates or omit `lastModified`.
- `SITE` URL is duplicated in `layout.tsx`, `robots.ts`, `sitemap.ts`. Centralise it as `NEXT_PUBLIC_SITE_URL` in `lib/site-config.ts`.
- OG image: consider adding your portrait (load via `fetch(new URL('../public/images/howard-solid.jpeg', import.meta.url))`). Cards with faces get far more clicks.

---

## 4. Low-severity findings

### B-24 Dependencies
| Package | Now | Note |
|---|---|---|
| `@supabase/ssr` | 0.5.2 | Latest 0.12.x. Upgrade (cookie API unchanged: `getAll/setAll`) |
| `lucide-react` | 0.514 | v1.x **removed brand icons** (`Github`, `Linkedin`). Before upgrading, replace with inline SVGs or `simple-icons` |
| `next` | 15.5.26 | Next 16 available (removes `next lint`, changes middleware → `proxy.ts`). Do after B-22 |
| `zod` | 3.25 | v4 available. `.email()` becomes `z.email()`. Low priority |
| `tailwindcss` | 3.4 | v4 is a rewrite (CSS-first config). Optional, large effort |
| `clsx`, `tailwind-merge` | — | **unused**. Remove, or actually use `cn()` for conditional classes |
| `npm audit` | 2 advisories | PostCSS inside `next`, build-time only, low real risk. Resolved by Next upgrade |

### B-25 Footer semantics
`components/contact-section.tsx` L409: the site footer sits inside `<section id="contact">` inside `<main>`, so it isn't exposed as the page's `contentinfo` landmark. Extract `SiteFooter` and render it after `</main>` in `portfolio-page.tsx`. The footer's "Index Directory" also lacks `#contact`.

### B-26 Command palette
- Add **About**, **Contact**, **Live Simulators**, **GitHub**, **LinkedIn** commands.
- Page still scrolls behind the palette (no scroll lock). Reuse `useScrollLock(open)` from B-12.
- Mounted in the root layout, so it's also active on `/admin` and its "Projects" command reloads the homepage from there. Render it only in `PortfolioPage` and the simulator layout.
- `window.open('/resume.pdf', '_blank')` → add `'noopener'`.
- The header's search button is `hidden xs:grid`, so on phones < 375 px there's no way to open the palette. Acceptable, but consider showing it in the mobile header.

### B-27 Miscellaneous
1. `lib/use-focus-trap.ts` L25: `el.offsetParent !== null` excludes `position: fixed` focusable elements (their `offsetParent` is always `null`). Use `el.getClientRects().length > 0`.
2. `experience-section.tsx` L403: `aria-controls={panelId}` points to an element that doesn't exist while collapsed. Render the panel always and use `hidden`, or only set `aria-controls` when expanded.
3. `field-record-viewer.tsx` L313: dot buttons have `aria-label="01"`. Use `"Show photo 1 of 5"`.
4. `contact-section.tsx` L193: `aria-live` on a `<button>` is unreliable. Add a separate `<span role="status" className="sr-only">` for "Email copied". The submit success message lives only inside the button text, so also mirror it in a `role="status"` element.
5. `contact-section.tsx` L50–51 + footer L461: LinkedIn/GitHub URLs duplicated (and differ from `personalDetails`: `www.` vs none). Use one constant.
6. "AVAILABLE FOR HIRE 2026" is hard-coded in the header, contact card and OG image. Move to `site-config.ts`.
7. `app/icon.tsx` uses `#F5C400`, brand yellow is `#FFC700`.
8. `boot-sequence.tsx` L46 sets `history.scrollRestoration = 'manual'` globally and never restores it (affects `/simulators` back-navigation too).
9. `project-simulators.tsx`: `exit` props without an `AnimatePresence` parent are no-ops. Comment numbering says "SIMULATOR 02/03/04" (01 was removed).
10. `project-simulators.tsx`: `text-neutral-500` on near-black fails WCAG AA (≈3.9:1). Use `neutral-400`.
11. Honors `pick()` hard-codes a 72 px header fallback. Reuse the `--header-h` value like the rest.
12. Vercel Analytics/Speed Insights must be **enabled in the Vercel dashboard**, otherwise `/_vercel/insights/script.js` returns 404 (seen locally, expected outside Vercel).

---

## 5. Implementation plan (ordered, each phase shippable on its own)

> Work in a branch per phase, run `npm run check` (typecheck + lint + build) before every merge, and keep commits small.

### Phase 0 — Safety net (≈½ day)
1. Fix ESLint config + `postcss.config.mjs` (B-22). Switch `lint` script to `eslint .`.
2. Add Prettier (`.prettierrc`: `{ "singleQuote": true, "printWidth": 120 }`), run it once in a dedicated commit.
3. Add `.github/workflows/ci.yml` (typecheck, lint, build).
4. Add Playwright with 5 smoke tests (templates in §6).
5. Remove unused `lib/utils.ts` + `clsx` + `tailwind-merge` (or start using `cn`).

### Phase 1 — Functional bug fixes (≈1 day)
1. B-02 counters. 2. B-03 ZeroLag terminal state. 3. B-04 BILAHUJAN log (timestamps + autoscroll + `role="log"`).
4. B-06 intent chips + Subject field. 5. B-05 contact `fillMs` required (+ Turnstile if you want real protection).
6. B-12 `useLatest` + `useScrollLock` for all three modals and the palette.
7. B-27 items 1–4.

### Phase 2 — First impression & performance (≈1–2 days)
1. B-01 boot gate: once per session, pre-paint class, `useBooted()` for hero animations, "Skip intro".
2. B-17 Server Components + `<Reveal>`; dynamic-import modals and `cmdk`. Target `/` < 150 kB.
3. B-18 compress PDFs, lazy Spider-Man layer, rename files with spaces (update references).
4. Re-run Lighthouse (mobile) and record LCP / TBT / CLS before and after in the PR description.

### Phase 3 — Content single source of truth (≈1 day, mostly editing)
1. Create `content/`:
   ```
   content/
     site.ts         // SITE_URL, name, email, links, availability text, résumé path
     projects.ts     // Project[] incl. simulator, githubUrl, deckUrl, gallery
     experience.ts   // Experience[] + PEKOM events
     honors.ts       // Honor[] incl. certificateUrl, externalUrl
     skills.ts       // tooling matrix + pillars
   ```
   Each with an exported TypeScript type and, optionally, a zod schema validated in a unit test.
2. Move data out of the section components. Components only render.
3. Resolve **every row of B-08**, with one number per fact and a source you can show.
4. B-07: add Sensor X GitHub + Game Jam itch.io link. B-09: "RUN SIMULATOR" buttons.
5. Make simulator stage names, numbers and stack match the project cards.
6. Delete `lib/site-data.ts` (or reduce it to re-exports from `content/`). Fix the README claims (bundle size, "single source of truth").

### Phase 4 — Admin, API & database (≈1 day)
1. Decide **Option A (inbox only)** or **Option B (real CMS)** (B-16). The rest of this phase assumes A.
2. Remove the experiences/projects/skills CRUD routes, dashboard and fallback client. Keep `/admin/messages`.
3. B-14 sign-out route + non-admin message + `try/finally` in the login form.
4. B-15 action error handling, UUID validation, `app/admin/error.tsx`, Malaysia-time formatting.
5. B-19 zod schemas + Origin check (if you keep any mutation routes).
6. B-21 migration `sql/002_hardening.sql` (search_path, admin via `app_metadata`, CHECK constraints, RLS `(select …)`). Run Supabase **Security Advisor** and **Performance Advisor** until both are clean.
7. B-20 security headers in `next.config.mjs` (Report-Only first, then enforce). Clean `vercel.json`.

### Phase 5 — Accessibility & SEO (≈½–1 day)
1. B-10 `PillarCard` refactor. B-11 photo stack controls. B-25 footer landmark. B-26 palette entries and scroll lock.
2. B-23 simulator metadata, JSON-LD, decorative `<h2>` → `<div>`, central `SITE_URL`.
3. Run **axe DevTools** on home, a simulator page, the certificate modal and admin login. Fix everything "serious" or above.
4. Keyboard-only walkthrough: gate → skip link → every section → open and close each modal → submit contact form.

### Phase 6 — Dependency upgrades (≈½ day, optional)
1. `@supabase/ssr` → latest 0.x. Re-test login/middleware.
2. Replace Lucide brand icons, then upgrade `lucide-react` to v1.
3. Next 16 (after Phase 0 lint migration): rename `middleware.ts` per the upgrade guide, re-run the full test suite.

---

## 6. Test checklist (Playwright templates)

```ts
// tests/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('gate can be dismissed and is skipped on reload in same session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
  await page.reload();
  await expect(page.locator('.boot-overlay')).toBeHidden();
});

test('honor counters never show ordinal garbage', async ({ page }) => {
  await page.goto('/?nogate');
  await page.locator('#honors').scrollIntoViewIfNeeded();
  for (let i = 0; i < 25; i++) {
    const texts = await page.locator('#honors .font-display.text-3xl').allTextContents();
    for (const t of texts) expect(t).not.toMatch(/^(0nd|1nd|0rd|1rd|2rd|#0|Top 0)$/);
    await page.waitForTimeout(60);
  }
});

test('ZeroLag pipeline completes all 5 stages', async ({ page }) => {
  await page.goto('/simulators/agentic');
  await page.getByRole('button', { name: /dispatch agent pipeline/i }).click();
  await expect(page.getByText(/Lead Qualified/)).toBeVisible({ timeout: 5000 });
  await expect(page.locator('main .animate-ping')).toHaveCount(0);
});

test('BILAHUJAN log keeps distinct timestamps and scrolls to latest', async ({ page }) => {
  await page.goto('/simulators/flood');
  await page.getByRole('button', { name: /simulate citizen report/i }).click();
  await expect(page.getByText(/Authority notification sent/)).toBeInViewport({ timeout: 7000 });
});

test('contact API rejects submissions without fill time', async ({ request }) => {
  const r = await request.post('/api/contact', { data: { name: 'a', email: 'a@b.co', message: 'hi' } });
  expect(r.status()).toBe(400);
});
```

**Manual checks before each deploy**
- [ ] iPhone Safari + Android Chrome: gate, hero, certificate PDF opens (native viewer fallback), photo swipe in Field Archive.
- [ ] Contact form end-to-end on the **preview** deployment: row appears in Supabase, Gmail notification arrives, reply-to is the visitor.
- [ ] Every external link opens in an incognito window: ProofPay app, BILAHUJAN app, Colab, **Supervity orchestrator** (likely requires a Supervity login, so if visitors can't open it, replace it with a screenshot or video), itch.io, all GitHub repos.
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO = 100.
- [ ] Supabase Security Advisor: 0 warnings.

---

## 7. What's already done well (keep it)
- Service-role inserts + **no public INSERT policy** on `contact_messages`. Correct pattern.
- Middleware only on `/admin` and `/api/admin`, so the public site stays static.
- Consistent `isAdminUser()` used by pages, API routes and server actions.
- Focus traps with focus return, portaled modals, `inert` behind the gate, skip link that moves focus, `prefers-reduced-motion` respected globally.
- Safe-area insets, `svh`/`dvh` units, `hoverOnlyWhenSupported`, landscape-phone variant. Mobile layout is solid (no overflow at 360 px).
- `next/image` with correct `sizes` almost everywhere; honeypot uses `display:none` (the autofill-safe choice).
- Clean TypeScript: strict mode, 0 type errors.

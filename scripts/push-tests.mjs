#!/usr/bin/env node
/**
 * Picks the Playwright files the pre-push hook runs (R94, owner: "too slow and i need to wait so long").
 * The full suite (600+ tests) runs on GitHub CI in parallel shards after every push; before the push only:
 *   1. the core guards (smoke, crash guard, type floor),
 *   2. every test file changed in the commits being pushed,
 *   3. the rounds named in those commit subjects (`feat(r89): ...` -> tests/r89*.spec.ts),
 *   4. the test files that mention a changed source file's name (components/doom-walk.tsx -> "doom-walk").
 * Usage: node scripts/push-tests.mjs [base]   (base defaults to the upstream, else origin/main)
 * Prints one test path per line; `--why` prints the reason next to each.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

const argv = process.argv.slice(2);
const why = argv.includes('--why');
const git = (cmd) => spawnSync(`git ${cmd}`, { shell: true, encoding: 'utf8' });
const upstream = git('rev-parse --abbrev-ref --symbolic-full-name @{u}').stdout.trim();
const base = argv.find((a) => !a.startsWith('--')) || upstream || 'origin/main';

const CORE = ['tests/smoke.spec.ts', 'tests/r86.spec.ts', 'tests/r24.spec.ts'];
// names too common to tell which tests belong to a file
const GENERIC = new Set([
  'index',
  'page',
  'layout',
  'route',
  'globals',
  'utils',
  'types',
  'error',
  'loading',
  'content',
]);
// the most files a push runs before it leaves the rest to CI (about 10 - 15 min on one worker)
const CAP = 14;

const files = git(`diff --name-only ${base}...HEAD`).stdout.split('\n').filter(Boolean);
const subjects = git(`log --format=%s ${base}..HEAD`).stdout;
const tests = readdirSync('tests')
  .filter((f) => f.endsWith('.spec.ts'))
  .map((f) => `tests/${f}`);
const text = new Map(tests.map((t) => [t, readFileSync(t, 'utf8')]));

const picked = new Map();
const add = (t, reason) => {
  if (existsSync(t) && !picked.has(t)) picked.set(t, reason);
};
CORE.forEach((t) => add(t, 'core'));
files.filter((f) => /^tests\/.*\.spec\.ts$/.test(f)).forEach((t) => add(t, 'changed'));
// a stylesheet or the root layout can break any zoom: R89's receipt split words at 3,840 px only (r62)
if (files.some((f) => /^app\/.*\.css$|^app\/layout\.tsx$/.test(f))) add('tests/r62.spec.ts', 'css changed: zoom');
for (const [, round] of subjects.matchAll(/\((r\d+[a-z]?)\)/gi))
  tests.filter((t) => basename(t).toLowerCase().startsWith(`${round.toLowerCase()}`)).forEach((t) => add(t, round));
const related = [];
for (const f of files) {
  if (!/^(app|components|lib)\//.test(f)) continue;
  const stem = basename(f, extname(f));
  // a plain word ("print", "layouts") is in many tests for other reasons: only a hyphenated or long name tells
  if (GENERIC.has(stem) || !(stem.includes('-') || stem.length >= 8)) continue;
  if (!/^[\w-]+$/.test(stem)) continue;
  const token = new RegExp(`(?<![\\w-])${stem}(?![\\w-])`);
  for (const t of tests) if (token.test(text.get(t))) related.push([t, `mentions ${stem}`]);
}
related.forEach(([t, r]) => picked.size < CAP && add(t, r));

const left = related.filter(([t]) => !picked.has(t)).map(([t]) => t);
for (const [t, r] of picked) console.log(why ? `${t}  (${r})` : t);
if (why && left.length) console.log(`left to CI: ${[...new Set(left)].join(' ')}`);

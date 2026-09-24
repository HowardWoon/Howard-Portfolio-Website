#!/usr/bin/env node
/**
 * One-command verification for Howard's portfolio. Cross-platform (Windows PowerShell, macOS, Linux).
 * Usage:
 *   node scripts/verify.mjs            -> encoding + typecheck + lint + format + build
 *   node scripts/verify.mjs --e2e      -> also runs Playwright (needs a production build)
 *   node scripts/verify.mjs --no-build -> skip the production build (quick pre-commit style run)
 * Exit code 0 only when every executed step passed. Prints a table the AI must paste into its report.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const results = [];

function run(name, cmd, { timeoutMin = 10 } = {}) {
  const started = Date.now();
  const r = spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    timeout: timeoutMin * 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const timedOut = r.error && r.error.code === 'ETIMEDOUT';
  const ok = r.status === 0 && !timedOut;
  const tail = out.trim().split(/\r?\n/).slice(-15).join('\n');
  results.push({ name, ok, status: timedOut ? 'TIMEOUT' : r.status, secs, tail, out });
  console.log(`\n=== ${name} -> ${ok ? 'PASS' : 'FAIL'} (exit ${timedOut ? 'TIMEOUT' : r.status}, ${secs}s)\n${tail}`);
  return { ok, out };
}

// 1. Repo hygiene (tracked files only, so node_modules and .next never matter)
const tracked = spawnSync('git ls-files', { shell: true, encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
const forbidden = ['fix.py', 'rename_refs.py', 'temp.txt', 'temp2.txt', 'desktop.ini'];
const problems = [
  ...tracked.filter((f) => forbidden.includes(f) || f.startsWith('align_env/')).map((f) => `forbidden file: ${f}`),
  ...tracked.filter((f) => /\s/.test(f)).map((f) => `space in path: ${f}`),
  ...tracked
    .filter((f) => /\.(jpe?g|png|webp|gif|pdf|mp4)$/i.test(f) && !f.startsWith('public/') && !f.startsWith('app/'))
    .map((f) => `binary outside public/: ${f}`),
  ...['00-core', '05-obedience', '06-stability', '10-architecture', '20-responsive-a11y', '40-verification']
    .map((r) => `.agents/rules/${r}.md`)
    .filter((f) => !existsSync(f) || statSync(f).size < 400)
    .map((f) => `rule file missing or empty: ${f}`),
];
// Large files are reported as a warning only (shrinking PDFs needs Howard's approval, see R3-10d).
const bigFiles = tracked
  .filter((f) => f.startsWith('public/') && existsSync(f) && statSync(f).size > 2 * 1024 * 1024)
  .map((f) => `WARNING (not a failure) file over 2 MB: ${f} (${(statSync(f).size / 1048576).toFixed(1)} MB)`);
const hygieneOk = problems.length === 0;
results.push({
  name: 'repo hygiene',
  ok: hygieneOk,
  status: hygieneOk ? 0 : 1,
  secs: '0.0',
  tail: [...problems, ...bigFiles].join('\n') || 'clean',
});
console.log(`\n=== repo hygiene -> ${hygieneOk ? 'PASS' : 'FAIL'}\n${results.at(-1).tail}`);

// 2. Encoding
if (existsSync('scripts/check-encoding.mjs'))
  run('encoding (check-encoding.mjs)', 'node scripts/check-encoding.mjs', { timeoutMin: 2 });
else
  results.push({
    name: 'encoding (check-encoding.mjs)',
    ok: false,
    status: 'MISSING',
    secs: '0.0',
    tail: 'scripts/check-encoding.mjs not found',
  });

// 3. Static checks
run('typecheck', 'npm run typecheck', { timeoutMin: 5 });
const lint = run('lint', 'npm run lint', { timeoutMin: 5 });
const warn = (lint.out.match(/(\d+) warnings?/) || [])[1];
if (lint.ok && warn && Number(warn) > 0) {
  const r = results.find((x) => x.name === 'lint');
  r.ok = false;
  r.status = `${warn} warning(s)`;
}
run('format (prettier --check)', 'npx prettier --check app components lib tests scripts', { timeoutMin: 3 });

// 4. Build
if (!args.has('--no-build')) {
  const b = run('build', 'npm run build', { timeoutMin: 15 });
  const m = b.out.match(/^\S+\s+\S+\s+\/\s+[\d.]+\s+k?B\s+([\d.]+\s+k?B)/m);
  if (m) results.at(-1).tail = `First Load JS for "/": ${m[1]}\n` + results.at(-1).tail;
}

// 5. E2E
if (args.has('--e2e')) run('e2e (playwright)', 'npm run test:e2e', { timeoutMin: 15 });

// Summary table
const line = (r) => `| ${r.name} | ${r.ok ? 'PASS' : 'FAIL'} | ${r.status} | ${r.secs}s |`;
console.log(
  '\n## verify.mjs summary\n| Step | Result | Exit | Time |\n|---|---|---|---|\n' + results.map(line).join('\n'),
);
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\nRESULT: FAIL (${failed.map((f) => f.name).join(', ')})` : '\nRESULT: ALL PASS');
process.exit(failed.length ? 1 : 0);

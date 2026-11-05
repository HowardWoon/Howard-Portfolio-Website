#!/usr/bin/env node
/**
 * After a push: GitHub CI and Vercel for one commit (R94). The full Playwright suite runs there now, not before the
 * push, so a push is finished only when this prints CI green and Vercel success.
 * Usage: node scripts/ci-status.mjs [sha] [--wait]   (sha defaults to HEAD; --wait checks every 3 min, up to 45 min)
 * Exit 0 = CI passed and Vercel deployed, 1 = something failed, 2 = still running (without --wait) or timed out.
 * Without a GITHUB_TOKEN the API allows 60 requests an hour: one check is 2 requests.
 */
import { spawnSync } from 'node:child_process';

const REPO = 'HowardWoon/Howard-Portfolio-Website';
const argv = process.argv.slice(2);
const wait = argv.includes('--wait');
const ref = argv.find((a) => !a.startsWith('--')) || 'HEAD';
const sha = spawnSync(`git rev-parse ${ref}`, { shell: true, encoding: 'utf8' }).stdout.trim();
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'ci-status' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const api = async (path) => {
  const r = await fetch(`https://api.github.com/repos/${REPO}/${path}`, { headers });
  // 06-stability G1: the public API rate-limits this IP; then read the run page in a browser instead
  if (!r.ok) throw new Error(`GitHub API ${r.status} on ${path} (403 = rate limit: open github.com/${REPO}/actions)`);
  return r.json();
};

async function check() {
  const runs = (await api(`commits/${sha}/check-runs?per_page=50`)).check_runs ?? [];
  const vercel = ((await api(`commits/${sha}/status`)).statuses ?? []).find((s) => s.context === 'Vercel');
  const rows = runs.map((c) => `${(c.conclusion ?? c.status).padEnd(12)} ${c.name}`);
  rows.push(`${(vercel?.state ?? 'not started').padEnd(12)} Vercel`);
  const failed = runs.some((c) => c.conclusion && !['success', 'skipped', 'neutral'].includes(c.conclusion));
  const running = !runs.length || runs.some((c) => c.status !== 'completed') || !vercel || vercel.state === 'pending';
  const vercelFailed = vercel && ['failure', 'error'].includes(vercel.state);
  return { rows, state: failed || vercelFailed ? 'failed' : running ? 'running' : 'passed', runs };
}

const t0 = Date.now();
let r = await check();
while (wait && r.state === 'running' && Date.now() - t0 < 45 * 60_000) {
  await new Promise((done) => setTimeout(done, 180_000));
  r = await check();
}
console.log(`${sha.slice(0, 7)}: ${r.state.toUpperCase()}\n${r.rows.join('\n')}`);
const run = r.runs.find((c) => c.html_url)?.html_url;
if (run) console.log(`details: ${run}`);
process.exit(r.state === 'passed' ? 0 : r.state === 'failed' ? 1 : 2);

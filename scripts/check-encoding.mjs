#!/usr/bin/env node
/**
 * Fails (exit 1) if any source file has a UTF-8 BOM or mojibake.
 * Patterns are built from numeric code points, so this file never matches itself.
 * A lone middle dot (U+00B7) is legitimate content and is NOT flagged.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['app', 'components', 'lib', 'tests', 'scripts', 'AGENTS.md', '.agents'];
const EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.css', '.json', '.md']);
// Built from numeric code points so no tool, editor or AI can "normalise" the pattern into real characters.
const c = (n) => String.fromCodePoint(n);
const BAD = new RegExp(
  [
    `${c(0xc3)}[${c(0x80)}-${c(0xbf)}]`, // UTF-8 read as Latin-1 (e.g. accented letters)
    `${c(0xe2)}${c(0x20ac)}`, // broken quotes / dashes
    `${c(0xf0)}${c(0x178)}`, // broken emoji
    `${c(0xc2)}[${c(0xa0)}-${c(0xbf)}]`, // stray A-circumflex before a symbol (a lone middle dot is fine)
    c(0xfffd), // replacement character
  ].join('|'),
);

let bad = 0;
function check(p) {
  if (!EXT.has(extname(p))) return;
  const b = readFileSync(p);
  if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) {
    console.log(`BOM      ${p}`);
    bad++;
  }
  b.toString('utf8')
    .split('\n')
    .forEach((line, i) => {
      if (BAD.test(line)) {
        console.log(`MOJIBAKE ${p}:${i + 1}`);
        bad++;
      }
    });
}
function walk(p) {
  if (!existsSync(p)) return;
  if (statSync(p).isDirectory()) {
    for (const n of readdirSync(p)) if (n !== 'node_modules' && n !== '.next') walk(join(p, n));
  } else check(p);
}
ROOTS.forEach(walk);
console.log(bad ? `encoding: ${bad} problem(s)` : 'encoding: clean');
process.exit(bad ? 1 : 0);

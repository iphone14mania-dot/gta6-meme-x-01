// Entry program for make.fun's "Post a GTA 6 meme on X" bounty (gta6-meme-x-01).
//
// The entry is the X post itself: a GTA 6 meme (meme.png in this repository),
// posted on X from a public account with make.fun and the entrant's play code
// in its text. This program's only job is to hand the post's address to the
// grader: it reads POST.json from the repository root, checks it is a JSON
// object naming an X post URL, and writes those exact bytes to the output
// directory, where the gate reads them.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Node 22, standard library only. No network, no wall clock, no files outside
// the repository: the two runs of an entry write the same bytes.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR: string = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const SOURCE_PATH = join(BOT_DIR, "POST.json");
const TARGET_PATH = join(OUTPUT_DIR, "POST.json");

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

let raw: Buffer;
try {
  raw = readFileSync(SOURCE_PATH);
} catch (err) {
  fail(`could not read ${SOURCE_PATH}: ${(err as Error).message}`);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw.toString("utf8"));
} catch (err) {
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

if (
  typeof parsed !== "object" ||
  parsed === null ||
  Array.isArray(parsed) ||
  typeof (parsed as { url?: unknown }).url !== "string"
) {
  fail('POST.json must be a JSON object with a string "url" field');
}

const url = (parsed as { url: string }).url;
if (!/^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/.test(url)) {
  fail(`POST.json url is not an X post address: ${url}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  writeFileSync(TARGET_PATH, raw);
} catch (err) {
  fail(`could not write ${TARGET_PATH}: ${(err as Error).message}`);
}

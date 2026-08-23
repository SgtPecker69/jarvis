// Dry run a file through the parsers without writing anything.
//
//   npm run ingest:check ~/Downloads/transactions.csv
//
// Use this on the first real export from each service — the column names in
// parsers.js came from documented formats, not from Mark's own files.

import { ingestFile } from "./watcher.js";

const path = process.argv[2];
if (!path) {
  console.error("Usage: npm run ingest:check <file.csv>");
  process.exit(1);
}

const result = ingestFile(path, { dryRun: true });

console.log(`\n  file:   ${result.filename}`);
console.log(`  status: ${result.status}`);
if (result.source) console.log(`  parser: ${result.source}`);
if (result.reason) console.log(`  reason: ${result.reason}`);
console.log(`  rows:   ${result.rows}`);
if (result.sample) console.log(`  sample: ${JSON.stringify(result.sample)}`);
console.log(result.status === "would import"
  ? "\n  Nothing was written. Drop it in the inbox to import for real.\n"
  : "\n  Nothing was written.\n");

#!/usr/bin/env node
// Defensive placeholder — redirects users to the real cupel package.
// No network, no filesystem access, no dependencies.

const isTTY = process.stdout.isTTY && !process.env.NO_COLOR;
const dim = isTTY ? (s) => `\x1b[2m${s}\x1b[0m` : (s) => s;
const bold = isTTY ? (s) => `\x1b[1m${s}\x1b[0m` : (s) => s;

console.error("");
console.error("  " + bold("This is a defensive placeholder package."));
console.error("");
console.error("  Did you mean:  " + bold("npx cupel"));
console.error("");
console.error(dim("  Real package:  https://www.npmjs.com/package/cupel"));
console.error(dim("  Source code:   https://github.com/aissablk1/cupel"));
console.error("");
process.exit(1);

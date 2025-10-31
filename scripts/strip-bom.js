#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function stripBomString(str) {
  if (!str) return str;
  // Remove leading BOM if present
  return str.charCodeAt(0) === 0xFEFF ? str.slice(1) : str;
}

function processFile(p) {
  const abs = path.resolve(p);
  const data = fs.readFileSync(abs, 'utf8');
  const cleaned = stripBomString(data);
  fs.writeFileSync(abs, cleaned, { encoding: 'utf8' });
  console.log(`Rewrote without BOM: ${abs}`);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node scripts/strip-bom.js <file> [file...]');
  process.exit(1);
}
files.forEach(processFile);

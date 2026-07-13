import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;
const patterns = [
  /<script[^>]+src=["']https?:\/\//i,
  /import\s*\(\s*["']https?:\/\//i,
  /from\s+["']https?:\/\//i,
  /\beval\s*\(/i,
  /\bnew\s+Function\s*\(/i,
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const files = (await walk(distDir)).filter((file) => /\.(js|html)$/i.test(file));
const violations = [];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const pattern of patterns) {
    if (pattern.test(text)) violations.push(`${file}: ${pattern}`);
  }
}

if (violations.length) {
  console.error('Potential remote executable code found:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Remote-code audit passed (${files.length} files checked).`);

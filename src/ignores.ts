import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The same standard glob file is consumed by Prettier, ESLint and micromatch.
export const ignorePath = fileURLToPath(
  new URL('../../quality.ignore', import.meta.url),
);
export const generatedPaths = readFileSync(ignorePath, 'utf8')
  .trim()
  .split('\n');

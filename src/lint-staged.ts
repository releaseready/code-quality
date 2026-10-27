import micromatch from 'micromatch';
import { relative, resolve } from 'node:path';
import { generatedPaths } from './ignores.js';

function checks(files: string[], lint: boolean) {
  const selected = micromatch
    .not(
      files.map((file) => relative(process.cwd(), file)),
      generatedPaths,
      { dot: true },
    )
    .map((file) => resolve(file));
  if (selected.length === 0) return [];
  // lint-staged parses arguments without a shell; quote paths including spaces.
  const args = selected.map((file) => JSON.stringify(file)).join(' ');
  return [
    `prettier --check --ignore-path quality.ignore ${args}`,
    ...(lint ? [`eslint --max-warnings 0 ${args}`] : []),
  ];
}
export default {
  '*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}': (files: string[]) => checks(files, true),
  '*.{json,jsonc,md,yml,yaml,css,scss,html}': (files: string[]) =>
    checks(files, false),
};

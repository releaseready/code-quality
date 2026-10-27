import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import ignore from 'ignore';
import * as prettier from 'prettier';
import { ESLint } from 'eslint';
import { defineConfig } from 'lint-staged/config';

async function check(files: readonly string[], lint: boolean) {
  const policy = ignore().add(readFileSync('quality.ignore', 'utf8'));
  const selected = files.filter(
    (file) => !policy.ignores(relative(process.cwd(), file)),
  );
  for (const file of selected) {
    const options = {
      ...(await prettier.resolveConfig(file, { editorconfig: true })),
      filepath: file,
    };
    if (!(await prettier.check(readFileSync(file, 'utf8'), options))) {
      throw new Error(`prettier: unformatted staged file ${file}`);
    }
  }
  if (lint && selected.length) {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(selected);
    if (results.some((result) => result.errorCount || result.warningCount)) {
      throw new Error(
        await (await eslint.loadFormatter('stylish')).format(results),
      );
    }
  }
}
// Native tasks receive filename arrays after lint-staged hides unstaged changes.
// No shell or argument-string escaping is involved.
export default defineConfig({
  '*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}': {
    title: 'Check staged code',
    task: (files) => check(files, true),
  },
  '*.{json,jsonc,md,yml,yaml,css,scss,html}': {
    title: 'Check staged formatting',
    task: (files) => check(files, false),
  },
});

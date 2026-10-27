import js from '@eslint/js';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier/flat';
import { join } from 'node:path';

// Consumer paths must describe files covered by its real TypeScript projects.
export function qualityConfig(
  root: string,
  typedFiles = ['src/**/*.ts', 'src/**/*.tsx', 'tests/**/*.ts'],
) {
  return defineConfig(
    includeIgnoreFile(join(root, 'quality.ignore')),
    js.configs.recommended,
    tseslint.configs.recommended,
    {
      files: typedFiles,
      extends: [tseslint.configs.recommendedTypeChecked],
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir: root },
      },
    },
    // Config files retain recommended syntax rules without inventing a TS project.
    prettier,
  );
}

# ReleaseReady code quality (RRDSCRUM-69 draft)

Shared formatting and lint rules for standalone repositories. This local draft is
not published or adopted. The approved public repository has a README baseline only.

## Supported tools

Node 22.23.4 is the tested runtime. Exact pins are in package.json and the npm lock.
ESLint 10.13.0, typescript-eslint 8.72.1 and TypeScript 5.9.3 have compatible declared
peer ranges. Do not upgrade TypeScript to 7 until the parser supports it.
ESLint loads the authored TypeScript configuration through pinned jiti 2.7.0.
Only emitted dist JavaScript is generated; source and tests are TypeScript.

## Local verification

After cloning, run `npm ci`, `npm run setup:dev`, then `npm run check`.
setup:dev builds and installs this repository’s hooks. Git-dependency prepare only
builds exports; it must not install hooks into a consumer repository.
`npm run format` explicitly writes formatting; `format:check` checks the same scope.
The hook tests create owned disposable Git repositories with normal Husky hooks,
ordinary commits and offline npm. They never run customer code or hosted CI.

## Consumer adoption (separate reviewed changes)

Install the shared package at an approved immutable Git SHA after publication.
Declare the command-line tools directly at the exact versions in this package:
ESLint, Prettier, Husky, lint-staged, jiti and TypeScript. Do not rely on a transitive
binary being hoisted into the consumer node_modules directory. Preserve lockfiles.

An eslint.config.ts imports `qualityConfig` from
`@releaseready/code-quality/eslint` and exports
`qualityConfig(import.meta.dirname, ['src/**/*.ts', 'tests/**/*.ts'])`.
Use the actual project-covered paths, including TSX where present. Application and
test files use recommended type-checked rules with projectService. Legitimate
configuration files outside a project retain recommended non-type-aware rules;
do not put application files there to evade typed linting. The final shared preset
is eslint-config-prettier, so stylistic conflicts do not duplicate formatting.

Set package.json `prettier` to `@releaseready/code-quality/prettier`.
A lint-staged.config.ts re-exports the default from
`@releaseready/code-quality/lint-staged`.
Use these scripts (adapt build paths, not the checking policy):

```json
{
  "format": "prettier --ignore-path quality.ignore --write .",
  "format:check": "prettier --ignore-path quality.ignore --check .",
  "lint": "eslint . --max-warnings 0",
  "check:staged": "node node_modules/@releaseready/code-quality/dist/src/check-paths.js && node node_modules/lint-staged/bin/lint-staged.js --hide-unstaged",
  "prepare": "npm run build && husky"
}
```

Copy the pinned package quality.ignore to the consumer root during reviewed adoption
and refresh that exact copy on package upgrades. Prettier interprets ignores relative
to their file, so never point it into node_modules. Copy hooks/pre-commit to
.husky/pre-commit and run the installed local Husky setup.
For repositories without an existing build prepare step, use `husky` alone.
Do not overwrite existing prepare behavior. Generated outputs and dependencies
may be ignored; do not exclude authored code or weaken existing checks.

The hook checks staged formatting and lint without --fix. Run format explicitly,
review the diff, then stage it yourself. Always use --hide-unstaged: type-aware checks must also hide unstaged changes
in imported files. lint-staged retains its backup and restores the working state.
quality.ignore is the shared generated-path policy for formatting, lint and staged
selection; the maintained ignore library filters paths before either tool runs. ESLint uses
its supported includeIgnoreFile helper; CRLF, blank lines and comments are valid.
Native lint-staged tasks pass filename arrays directly to tool APIs without shell
quoting. Missing dependencies fail;
the hook never runs npx or downloads a substitute. Local hooks can be bypassed by
users and are not an absolute access-control boundary. Hosted check/protection
policy is unchanged.

## Framework boundaries and rollout

This first package provides the shared TS baseline, not invented framework rules.
Add thin reviewed React/hooks, Playwright or WDIO recommended presets only with
the corresponding consumer adoption and compatible declared direct dependencies.
Keep eslint-config-prettier last. Mobile is idle; Web PR13 remains untouched;
central package ownership must be handed over after its TS migration. Empty API
and TDM repositories need ticketed tooling initialization, not feature scaffolding.

Sources: [ESLint TypeScript configuration](https://eslint.org/docs/latest/use/configure/configuration-files),
[typescript-eslint](https://typescript-eslint.io/packages/typescript-eslint/),
[lint-staged](https://github.com/lint-staged/lint-staged),
[Husky](https://typicode.github.io/husky/how-to.html).

## DevOps governance boundary

A later ticket may add reusable Sonar scan workflows, secure action pins, gate
enforcement and analysis defaults. Product repositories retain project keys and
source/test/coverage paths; secrets stay in GitHub Secrets and gate administration
stays in Sonar. This package adds no hosted scans or Sonar settings.

Future PRs are regular PRs. Use DO NOT MERGE for blockers and Ready To Review
only after exact-head verification; repository owners review and merge.

The approved portable-filename policy rejects literal backslashes before lint-staged
normalizes paths. The check reads Git’s NUL-delimited staged names, never renames
or hides files, and reports an actionable error. Spaces, Unicode and quotes remain
supported. No broader filename restriction is imposed.

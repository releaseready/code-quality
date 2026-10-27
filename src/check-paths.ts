import { spawnSync } from 'node:child_process';

const result = spawnSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
  { encoding: 'utf8' },
);
if (result.error || result.status !== 0) {
  console.error('Unable to read staged filenames; commit checks stopped.');
  process.exit(1);
}
const unsupported = result.stdout
  .split('\0')
  .filter((name) => name.includes('\\'));
if (unsupported.length) {
  console.error(
    'Literal backslashes in filenames are unsupported. Rename these paths explicitly and stage the changes before committing:',
  );
  for (const name of unsupported) console.error(JSON.stringify(name));
  process.exit(1);
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './helpers.js';

function listFiles(dir, exts) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listFiles(path, exts);
    return exts.some((e) => name.endsWith(e)) ? [path] : [];
  });
}

const jsFiles = [...listFiles(join(ROOT, 'js'), ['.js']), ...listFiles(join(ROOT, 'scripts'), ['.mjs'])];

test('tous les fichiers JS sont syntaxiquement valides', () => {
  const failures = jsFiles
    .map((file) => ({ file, res: spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' }) }))
    .filter(({ res }) => res.status !== 0)
    .map(({ file, res }) => `${relative(ROOT, file)}\n${res.stderr}`);
  assert.deepEqual(failures, [], failures.join('\n'));
});

test('index.html référence des fichiers qui existent', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="([^"#:]+\.(?:css|js|svg))"/g)].map((m) => m[1]);
  assert.ok(refs.length > 5);
  const missing = refs.filter((ref) => {
    try {
      return !statSync(join(ROOT, ref)).isFile();
    } catch {
      return true;
    }
  });
  assert.deepEqual(missing, []);
});

test('chaque import relatif pointe vers un fichier existant', () => {
  const broken = [];
  jsFiles.forEach((file) => {
    const src = readFileSync(file, 'utf8');
    for (const [, spec] of src.matchAll(/(?:import|export)\s[^'"]*?from\s+'(\.[^']+)'/g)) {
      const target = join(file, '..', spec);
      try {
        statSync(target);
      } catch {
        broken.push(`${relative(ROOT, file)} → ${spec}`);
      }
    }
  });
  assert.deepEqual(broken, []);
});

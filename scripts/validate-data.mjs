#!/usr/bin/env node
/**
 * Vérifie data.json avant de committer.
 *   node scripts/validate-data.mjs            (data.json à la racine)
 *   node scripts/validate-data.mjs autre.json
 * Code de sortie 1 s'il y a au moins une erreur (les avertissements ne bloquent pas).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateData } from './lib/validate.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(root, process.argv[2] || 'data.json');

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`✗ Impossible de lire ${file}\n  ${e.message}`);
  process.exit(1);
}

const { errors, warnings, recipeCount, categoryCount } = validateData(data);

if (warnings.length) console.log(warnings.join('\n'));
if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} erreur(s), ${warnings.length} avertissement(s) dans ${recipeCount} recettes.`);
  process.exit(1);
}
console.log(`✓ data.json valide : ${recipeCount} recettes, ${categoryCount} catégories${warnings.length ? `, ${warnings.length} avertissement(s)` : ''}.`);

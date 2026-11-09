import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from './helpers.js';
import { validateData } from '../scripts/lib/validate.mjs';
import { normalizeRecipe } from '../js/core/library.js';
import { normalize } from '../js/utils/text.js';

const data = loadData();

test('data.json passe le validateur sans erreur', () => {
  const { errors } = validateData(data);
  assert.deepEqual(errors, [], `\n${errors.join('\n')}`);
});

test('un même ingrédient est toujours rangé dans le même rayon', () => {
  // Sinon la liste de courses le range au hasard selon l'ordre du menu.
  const seen = new Map();
  const conflicts = [];
  data.recipes.forEach((r) => r.ingredients.forEach((i) => {
    const key = normalize(i.name);
    const previous = seen.get(key);
    if (previous && previous.aisle !== i.aisle) {
      conflicts.push(`« ${i.name} » : ${previous.aisle} (${previous.recipe}) ≠ ${i.aisle} (${r.id})`);
    }
    if (!previous) seen.set(key, { aisle: i.aisle, recipe: r.id });
  }));
  assert.deepEqual(conflicts, [], `\n${conflicts.join('\n')}`);
});

test('un même ingrédient est écrit exactement pareil partout', () => {
  // « Lait d'amande sans sucre » vs « lait d'amande sans sucre » = deux lignes dans la liste de courses.
  const spellings = new Map();
  data.recipes.forEach((r) => r.ingredients.forEach((i) => {
    const key = normalize(i.name);
    if (!spellings.has(key)) spellings.set(key, new Set());
    spellings.get(key).add(i.name);
  }));
  const variants = [...spellings.values()].filter((s) => s.size > 1).map((s) => [...s].join(' / '));
  assert.deepEqual(variants, [], `\n${variants.join('\n')}`);
});

test('les kcal par portion restent plausibles pour une glace healthy', () => {
  const outliers = data.recipes
    .map((r) => normalizeRecipe(r))
    .filter((r) => r.kcalPerServing <= 0 || r.kcalPerServing > 600)
    .map((r) => `${r.id} : ${r.kcalPerServing} kcal/portion`);
  assert.deepEqual(outliers, [], `\n${outliers.join('\n')}`);
});

test('chaque catégorie déclarée contient au moins une recette', () => {
  const used = new Set(data.recipes.map((r) => r.category));
  const empty = data.categories.filter((c) => !used.has(c.id)).map((c) => c.id);
  assert.deepEqual(empty, []);
});

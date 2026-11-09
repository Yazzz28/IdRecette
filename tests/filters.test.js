import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecipe } from '../js/core/library.js';
import { filterRecipes, filterWithoutCategory, sortRecipes, collectTags, countByCategory } from '../js/core/filters.js';
import { DEFAULT_FILTERS } from '../js/core/stores.js';
import { makeRecipe } from './helpers.js';

const recipes = [
  makeRecipe({ id: 'fraise', title: 'Fraise', category: 'fruitees', tags: ['Vegan', 'Express'], prepTime: 5, nutrition: { protein: 2 } }),
  makeRecipe({
    id: 'cacahuete', title: 'Cacahuète protéinée', category: 'proteinees', tags: ['Vegan', 'Riche en protéines'], prepTime: 10, nutrition: { protein: 22 },
    ingredients: [{ qty: 30, unit: 'g', name: 'Protéine végétale vanille', kcal: 115 }, { qty: 15, unit: 'g', name: 'Beurre de cacahuète', kcal: 90 }],
  }),
  makeRecipe({ id: 'mangue', title: 'Sorbet mangue', category: 'sorbets', tags: ['Sans gluten'], prepTime: 3, nutrition: {} }),
].map((r) => normalizeRecipe(r));

const ids = (list) => list.map((r) => r.id);
const filters = (over = {}) => ({ ...DEFAULT_FILTERS, ...over });

test('sans filtre, tout est affiché', () => {
  assert.deepEqual(ids(filterRecipes(recipes, filters(), [])), ['fraise', 'cacahuete', 'mangue']);
});

test('recherche insensible à la casse et aux accents, sur les ingrédients aussi', () => {
  assert.deepEqual(ids(filterRecipes(recipes, filters({ query: 'CACAHUETE' }), [])), ['cacahuete']);
  assert.deepEqual(ids(filterRecipes(recipes, filters({ query: 'protéine vanille' }), [])), ['cacahuete']);
  assert.deepEqual(ids(filterRecipes(recipes, filters({ query: 'introuvable' }), [])), []);
});

test('les tags se cumulent (ET)', () => {
  assert.deepEqual(ids(filterRecipes(recipes, filters({ tags: ['Vegan'] }), [])), ['fraise', 'cacahuete']);
  assert.deepEqual(ids(filterRecipes(recipes, filters({ tags: ['Vegan', 'Express'] }), [])), ['fraise']);
});

test('catégorie et favoris', () => {
  assert.deepEqual(ids(filterRecipes(recipes, filters({ category: 'sorbets' }), [])), ['mangue']);
  assert.deepEqual(ids(filterRecipes(recipes, filters({ favOnly: true }), ['mangue', 'fraise'])), ['fraise', 'mangue']);
});

test('les compteurs de catégories ignorent la catégorie active', () => {
  const list = filterWithoutCategory(recipes, filters({ category: 'sorbets', tags: ['Vegan'] }), []);
  const counts = countByCategory(list);
  assert.equal(counts.get('fruitees'), 1);
  assert.equal(counts.get('proteinees'), 1);
  assert.equal(counts.get('sorbets'), undefined);
});

test('tris', () => {
  assert.deepEqual(ids(sortRecipes(recipes, 'az')), ['cacahuete', 'fraise', 'mangue']);
  assert.deepEqual(ids(sortRecipes(recipes, 'protein')), ['cacahuete', 'fraise', 'mangue']);
  assert.deepEqual(ids(sortRecipes(recipes, 'prep')), ['mangue', 'fraise', 'cacahuete']);
  assert.deepEqual(ids(sortRecipes(recipes, 'kcal'))[2], 'cacahuete');
  assert.deepEqual(ids(sortRecipes(recipes, 'default')), ids(recipes));
});

test('sortRecipes ne modifie pas la liste d’origine', () => {
  const before = ids(recipes);
  sortRecipes(recipes, 'az');
  assert.deepEqual(ids(recipes), before);
});

test('collectTags trie par fréquence', () => {
  assert.equal(collectTags(recipes)[0], 'Vegan');
  assert.equal(collectTags(recipes).length, 4);
});

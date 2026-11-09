import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecipe, scaleIngredients, thumbColor } from '../js/core/library.js';
import { makeRecipe } from './helpers.js';

test('normalizeRecipe calcule les kcal depuis les ingrédients', () => {
  const r = normalizeRecipe(makeRecipe());
  assert.equal(r.kcalTotal, 90);
  assert.equal(r.kcalPerServing, 45);
  assert.equal(r.isUser, false);
});

test('normalizeRecipe applique des valeurs par défaut sûres', () => {
  const r = normalizeRecipe({ id: 42, title: 'Minimal', ingredients: [{ name: 'Mangue', qty: '100', kcal: '60', aisle: 'Inconnu', group: '?' }] }, { isUser: true });
  assert.equal(r.id, '42');
  assert.equal(r.servings, 2);
  assert.equal(r.freezeTime, 24);
  assert.equal(r.emoji, '🍨');
  assert.equal(r.isUser, true);
  assert.deepEqual(r.tags, []);
  assert.equal(r.ingredients[0].qty, 100);
  assert.equal(r.ingredients[0].aisle, 'Épicerie');
  assert.equal(r.ingredients[0].group, 'base');
  assert.equal(r.nutrition.protein, null);
});

test('normalizeRecipe ignore les ingrédients sans nom', () => {
  const r = normalizeRecipe(makeRecipe({ ingredients: [{ name: '', qty: 1, kcal: 999 }, { name: 'Banane', qty: 1, unit: 'pc', kcal: 105 }] }));
  assert.equal(r.ingredients.length, 1);
  assert.equal(r.kcalTotal, 105);
});

test('la recherche indexe titre, ingrédients et tags sans accents', () => {
  const r = normalizeRecipe(makeRecipe({ title: 'Glace à la Crème', tags: ['Protéinée'] }));
  assert.ok(r.searchText.includes('glace a la creme'));
  assert.ok(r.searchText.includes('proteinee'));
  assert.ok(r.searchText.includes("lait d'amande"));
});

test('scaleIngredients met à l’échelle quantités et kcal', () => {
  const r = normalizeRecipe(makeRecipe());
  const x2 = scaleIngredients(r, 4);
  assert.equal(x2[0].qty, 400);
  assert.equal(x2[0].kcal, 128);
  const half = scaleIngredients(r, 1);
  assert.equal(half[1].qty, 100);
});

test('scaleIngredients garde null pour les quantités « à volonté »', () => {
  const r = normalizeRecipe(makeRecipe({ ingredients: [{ name: 'Menthe', qty: null, unit: 'feuilles', kcal: 0 }] }));
  assert.equal(scaleIngredients(r, 6)[0].qty, null);
});

test('thumbColor : couleur de la recette, sinon de la catégorie', () => {
  const cats = new Map([['fruitees', { id: 'fruitees', color: 'ciel' }]]);
  assert.equal(thumbColor(normalizeRecipe(makeRecipe()), cats), 'var(--ciel)');
  assert.equal(thumbColor(normalizeRecipe(makeRecipe({ color: 'pelure' })), cats), 'var(--pelure)');
  assert.equal(thumbColor(normalizeRecipe(makeRecipe({ category: 'x' })), cats), 'var(--sauge)');
});

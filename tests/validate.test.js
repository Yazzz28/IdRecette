import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateData } from '../scripts/lib/validate.mjs';
import { makeRecipe, makeData } from './helpers.js';

const errorsFor = (recipe) => validateData(makeData([recipe])).errors;
const hasError = (errors, fragment) => errors.some((e) => e.includes(fragment));

test('une recette complète est valide', () => {
  const { errors, warnings } = validateData(makeData());
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('racine invalide', () => {
  assert.ok(validateData(null).errors.length);
  assert.ok(validateData([]).errors.length);
  assert.ok(hasError(validateData({ categories: [] }).errors, 'recipes'));
});

test('id manquant, mal formé ou en double', () => {
  assert.ok(hasError(errorsFor(makeRecipe({ id: undefined })), 'id manquant'));
  assert.ok(hasError(errorsFor(makeRecipe({ id: 'Fraise Basilic' })), 'id manquant ou invalide'));
  assert.ok(hasError(errorsFor(makeRecipe({ id: 'crème' })), 'id manquant ou invalide'));
  const dup = validateData(makeData([makeRecipe(), makeRecipe({ title: 'Autre' })]));
  assert.ok(hasError(dup.errors, 'id en double'));
});

test('catégorie inconnue', () => {
  assert.ok(hasError(errorsFor(makeRecipe({ category: 'glaces-salees' })), 'absente de "categories"'));
});

test('valeurs hors schéma', () => {
  assert.ok(hasError(errorsFor(makeRecipe({ difficulty: 'Dur' })), 'difficulty'));
  assert.ok(hasError(errorsFor(makeRecipe({ modes: ['Turbo'] })), 'mode inconnu'));
  assert.ok(hasError(errorsFor(makeRecipe({ modes: [] })), 'modes'));
  assert.ok(hasError(errorsFor(makeRecipe({ color: 'rouge' })), 'color'));
  assert.ok(hasError(errorsFor(makeRecipe({ servings: 1.5 })), 'servings'));
  assert.ok(hasError(errorsFor(makeRecipe({ prepTime: '5' })), 'prepTime'));
  assert.ok(hasError(errorsFor(makeRecipe({ steps: [] })), 'steps'));
  assert.ok(hasError(errorsFor(makeRecipe({ tags: 'Vegan' })), 'tags'));
});

test('ingrédients invalides', () => {
  const withIngredient = (ing) => makeRecipe({
    ingredients: [{ qty: 100, unit: 'g', name: 'Fraises', kcal: 32, group: 'base', aisle: 'Surgelés', ...ing }],
  });
  assert.ok(hasError(errorsFor(makeRecipe({ ingredients: [] })), 'au moins un ingrédient'));
  assert.ok(hasError(errorsFor(withIngredient({ unit: 'tasse' })), 'unit'));
  assert.ok(hasError(errorsFor(withIngredient({ aisle: 'Rayon frais' })), 'aisle'));
  assert.ok(hasError(errorsFor(withIngredient({ group: 'deco' })), 'group'));
  assert.ok(hasError(errorsFor(withIngredient({ kcal: '32' })), 'kcal'));
  assert.ok(hasError(errorsFor(withIngredient({ qty: 0 })), 'qty'));
  assert.ok(hasError(errorsFor(withIngredient({ name: '' })), 'name'));
  assert.deepEqual(errorsFor(withIngredient({ qty: null })), [], 'qty null = « à volonté », autorisé');
});

test('avertissements non bloquants', () => {
  const perso = validateData(makeData([makeRecipe({ id: 'perso-fraise-abc' })]));
  assert.deepEqual(perso.errors, []);
  assert.ok(perso.warnings.some((w) => w.includes('perso-')));

  const kcalPour100g = validateData(makeData([makeRecipe({
    ingredients: [{ qty: 10, unit: 'g', name: 'Amandes', kcal: 580, group: 'topping', aisle: 'Épicerie' }],
  })]));
  assert.deepEqual(kcalPour100g.errors, []);
  assert.ok(kcalPour100g.warnings.some((w) => w.includes('kcal/100 g')));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecipe } from '../js/core/library.js';
import { buildShoppingList, shoppingToText, menuEntries } from '../js/core/shopping.js';
import { makeRecipe } from './helpers.js';

const a = normalizeRecipe(makeRecipe({ id: 'a', title: 'Fraise-banane' }));
const b = normalizeRecipe(makeRecipe({
  id: 'b',
  title: 'Choco',
  ingredients: [
    { qty: 100, unit: 'ml', name: "lait d'amande sans sucre", kcal: 13, group: 'base', aisle: 'Épicerie' },
    { qty: 10, unit: 'g', name: 'Cacao non sucré', kcal: 35, group: 'base', aisle: 'Placard' },
  ],
}));
const byId = new Map([[a.id, a], [b.id, b]]);
const emptyShopping = { checked: {}, manual: [], pantry: false };
const find = (list, name) => list.groups.flatMap((g) => g.items).find((i) => i.name.toLowerCase() === name.toLowerCase());

test('menu vide = liste vide', () => {
  const list = buildShoppingList({}, byId, emptyShopping);
  assert.equal(list.total, 0);
  assert.deepEqual(list.groups, []);
});

test('les recettes supprimées sont ignorées', () => {
  assert.deepEqual(menuEntries({ disparue: 4 }, byId), []);
});

test('les quantités suivent les portions du menu', () => {
  const list = buildShoppingList({ a: 4 }, byId, emptyShopping);
  assert.equal(find(list, 'Fraises surgelées').qty, '400 g');
});

test('un même ingrédient est regroupé entre recettes (nom insensible à la casse, même unité)', () => {
  const list = buildShoppingList({ a: 2, b: 4 }, byId, emptyShopping);
  const lait = find(list, "Lait d'amande sans sucre");
  assert.equal(lait.qty, '400 ml'); // 200 + 100 × 2
  assert.equal(lait.source, 'Fraise-banane · Choco');
});

test('le placard est masqué par défaut puis affichable', () => {
  const hidden = buildShoppingList({ a: 2, b: 2 }, byId, emptyShopping);
  assert.equal(find(hidden, 'Cacao non sucré'), undefined);
  assert.equal(hidden.hiddenPantry, 2);
  const shown = buildShoppingList({ a: 2, b: 2 }, byId, { ...emptyShopping, pantry: true });
  assert.ok(find(shown, 'Cacao non sucré'));
  assert.equal(shown.hiddenPantry, 0);
});

test('les rayons suivent un ordre fixe', () => {
  const list = buildShoppingList({ a: 2 }, byId, { ...emptyShopping, pantry: true });
  assert.deepEqual(list.groups.map((g) => g.name), ['Surgelés', 'Épicerie', 'Placard (souvent déjà chez toi)']);
});

test('articles manuels et cases cochées', () => {
  const list = buildShoppingList({ a: 2 }, byId, {
    checked: { 'man:x': true, 'gen:fraises surgelees|g': true },
    manual: [{ id: 'x', name: 'Cornets', qty: '6' }],
    pantry: false,
  });
  assert.equal(list.groups.at(-1).name, 'Ajouté à la main');
  assert.equal(list.total, 3);
  assert.equal(list.done, 2);
  const text = shoppingToText(list);
  assert.ok(text.includes('☑ Cornets · 6'));
  assert.ok(text.includes('☑ Fraises surgelées · 200 g'));
  assert.ok(text.includes("☐ Lait d'amande sans sucre · 200 ml"));
});

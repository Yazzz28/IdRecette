import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const loadData = () => JSON.parse(readFileSync(resolve(ROOT, 'data.json'), 'utf8'));

/** Glace Ninja Creami minimale valide, à surcharger dans les tests. */
export function makeRecipe(overrides = {}) {
  return {
    id: 'test-recette',
    title: 'Recette de test',
    category: 'fruitees',
    emoji: '🍓',
    description: 'Pour les tests.',
    tags: ['Vegan'],
    appliance: 'Ninja Creami',
    difficulty: 'Facile',
    prepTime: 5,
    freezeTime: 24,
    servings: 2,
    modes: ['Lite Ice Cream'],
    ingredients: [
      { qty: 200, unit: 'g', name: 'Fraises surgelées', kcal: 64, group: 'base', aisle: 'Surgelés' },
      { qty: 200, unit: 'ml', name: "Lait d'amande sans sucre", kcal: 26, group: 'base', aisle: 'Épicerie' },
      { qty: 1, unit: 'pincée', name: 'Fleur de sel', kcal: 0, group: 'base', aisle: 'Placard' },
    ],
    steps: ['Mixe.', 'Congèle 24 h.'],
    nutrition: { protein: 2, carbs: 10, fat: 1 },
    tip: '',
    author: 'Test',
    ...overrides,
  };
}

/** Plat classique (sans Ninja Creami) minimal valide. */
export function makeDish(overrides = {}) {
  const { appliance, modes, freezeTime, ...rest } = makeRecipe();
  return {
    ...rest,
    id: 'test-plat',
    title: 'Plat de test',
    appliance: 'Casserole',
    cookTime: 20,
    ...overrides,
  };
}

export const makeData = (recipes = [makeRecipe()]) => ({
  categories: [{ id: 'fruitees', label: 'Fruitées', color: 'sauge' }],
  recipes,
});

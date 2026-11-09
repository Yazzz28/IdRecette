import { normalize } from '../utils/text.js';

export const SORTS = [
  { id: 'default', label: 'Par défaut' },
  { id: 'az', label: 'A → Z' },
  { id: 'kcal', label: 'Moins de kcal' },
  { id: 'protein', label: 'Plus de protéines' },
  { id: 'prep', label: 'Plus rapide' },
];

function matchesQuery(recipe, query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return words.every((w) => recipe.searchText.includes(w));
}

/** Filtre sur tout sauf la catégorie (utile pour les compteurs des chips). */
export function filterWithoutCategory(recipes, filters, favorites) {
  const favSet = new Set(favorites);
  return recipes.filter((r) =>
    (!filters.query || matchesQuery(r, filters.query))
    && filters.tags.every((t) => r.tags.includes(t))
    && (!filters.favOnly || favSet.has(r.id)));
}

export function filterRecipes(recipes, filters, favorites) {
  return filterWithoutCategory(recipes, filters, favorites)
    .filter((r) => filters.category === 'all' || r.category === filters.category);
}

export function sortRecipes(recipes, sort) {
  const list = [...recipes];
  const collator = new Intl.Collator('fr', { sensitivity: 'base' });
  switch (sort) {
    case 'az': return list.sort((a, b) => collator.compare(a.title, b.title));
    case 'kcal': return list.sort((a, b) => a.kcalPerServing - b.kcalPerServing);
    case 'protein': return list.sort((a, b) => (b.nutrition.protein ?? -1) - (a.nutrition.protein ?? -1));
    case 'prep': return list.sort((a, b) => a.activeTime - b.activeTime);
    default: return list;
  }
}

/** Tags présents dans les données, du plus fréquent au plus rare. */
export function collectTags(recipes) {
  const counts = new Map();
  recipes.forEach((r) => r.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'))
    .map(([tag]) => tag);
}

export function countByCategory(recipes) {
  const counts = new Map();
  recipes.forEach((r) => counts.set(r.category, (counts.get(r.category) || 0) + 1));
  return counts;
}

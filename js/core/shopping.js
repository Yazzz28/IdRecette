import { AISLES, PANTRY_AISLE, scaleIngredients } from './library.js';
import { normalize } from '../utils/text.js';
import { formatQty } from '../utils/format.js';

const MANUAL_GROUP = 'Ajouté à la main';

/** Recettes du menu encore présentes dans la bibliothèque. */
export function menuEntries(menu, byId) {
  return Object.entries(menu)
    .map(([id, servings]) => ({ recipe: byId.get(id), servings }))
    .filter((e) => e.recipe);
}

/** « Fraise-banane au lait d'amande » → « Fraise-banane » : assez court pour la ligne, assez long pour s'y retrouver. */
const shortTitle = (title) => {
  const words = title.split(/\s+/);
  return words[0].length >= 6 || words.length === 1 ? words[0] : words.slice(0, 2).join(' ');
};

/**
 * Regroupe les ingrédients de toutes les recettes du menu :
 * même nom + même unité = une seule ligne avec la quantité cumulée.
 */
export function buildShoppingList(menu, byId, shopping) {
  const entries = menuEntries(menu, byId);
  const merged = new Map();

  entries.forEach(({ recipe, servings }) => {
    scaleIngredients(recipe, servings).forEach((ing) => {
      const key = `${normalize(ing.name)}|${ing.unit}`;
      const current = merged.get(key) || {
        key: `gen:${key}`,
        name: ing.name,
        unit: ing.unit,
        qty: null,
        aisle: ing.aisle,
        sources: [],
      };
      if (ing.qty !== null) current.qty = (current.qty || 0) + ing.qty;
      const src = shortTitle(recipe.title);
      if (!current.sources.includes(src)) current.sources.push(src);
      merged.set(key, current);
    });
  });

  const aisles = AISLES.filter((a) => a !== PANTRY_AISLE || shopping.pantry);
  const groups = aisles
    .map((aisle) => ({
      name: aisle === PANTRY_AISLE ? 'Placard (souvent déjà chez toi)' : aisle,
      items: [...merged.values()]
        .filter((i) => i.aisle === aisle)
        .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
        .map((i) => ({
          key: i.key,
          name: i.name,
          qty: formatQty(i.qty, i.unit),
          source: i.sources.join(' · '),
          checked: !!shopping.checked[i.key],
        })),
    }))
    .filter((g) => g.items.length);

  if (shopping.manual.length) {
    groups.push({
      name: MANUAL_GROUP,
      manual: true,
      items: shopping.manual.map((m) => ({
        key: `man:${m.id}`,
        id: m.id,
        name: m.name,
        qty: m.qty || '',
        source: 'Ajouté par toi',
        checked: !!shopping.checked[`man:${m.id}`],
      })),
    });
  }

  const hiddenPantry = shopping.pantry ? 0 : [...merged.values()].filter((i) => i.aisle === PANTRY_AISLE).length;
  const items = groups.flatMap((g) => g.items);
  return {
    entries,
    groups,
    hiddenPantry,
    total: items.length,
    done: items.filter((i) => i.checked).length,
  };
}

export function shoppingToText(list) {
  const lines = ['Liste de courses · IDrecette V.2', ''];
  if (list.entries.length) {
    lines.push(`Pour : ${list.entries.map((e) => `${e.recipe.title} (${e.servings} pers.)`).join(', ')}`, '');
  }
  list.groups.forEach((g) => {
    lines.push(g.name.toUpperCase());
    g.items.forEach((i) => lines.push(`${i.checked ? '☑' : '☐'} ${i.name}${i.qty ? ` · ${i.qty}` : ''}`));
    lines.push('');
  });
  return lines.join('\n').trim();
}

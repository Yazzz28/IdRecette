import { libraryStore } from './stores.js';
import { normalize } from '../utils/text.js';
import { THUMB_COLORS, AISLES, GROUPS, APPLIANCES, CREAMI } from './schema.js';

export {
  THUMB_COLORS, AISLES, PANTRY_AISLE, UNITS, GROUPS, CREAMI_MODES, DIFFICULTIES, APPLIANCES, CREAMI,
} from './schema.js';

const toNumber = (v, fallback = 0) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? fallback : Number(v));

function normalizeIngredient(raw) {
  const qty = raw.qty === null || raw.qty === undefined || raw.qty === '' ? null : toNumber(raw.qty, null);
  return {
    qty,
    unit: String(raw.unit ?? '').trim(),
    name: String(raw.name ?? '').trim(),
    kcal: Math.max(0, toNumber(raw.kcal)),
    group: GROUPS.some((g) => g.id === raw.group) ? raw.group : 'base',
    aisle: AISLES.includes(raw.aisle) ? raw.aisle : 'Épicerie',
  };
}

/** Transforme une recette brute de data.json en objet prêt pour l'affichage. */
export function normalizeRecipe(raw) {
  const ingredients = (Array.isArray(raw.ingredients) ? raw.ingredients : [])
    .map(normalizeIngredient)
    .filter((i) => i.name);
  const servings = Math.max(1, Math.round(toNumber(raw.servings, 2)));
  const ingredientsKcal = ingredients.reduce((sum, i) => sum + i.kcal, 0);
  const kcalTotal = ingredientsKcal || toNumber(raw.kcal) * servings;
  const nutrition = raw.nutrition || {};
  const tags = Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : [];
  const modes = Array.isArray(raw.modes) ? raw.modes.filter(Boolean) : [];
  const appliance = APPLIANCES.includes(raw.appliance) ? raw.appliance : (modes.length ? CREAMI : '');
  const isCreami = appliance === CREAMI;

  const recipe = {
    id: String(raw.id),
    title: String(raw.title ?? 'Sans titre'),
    category: String(raw.category ?? ''),
    emoji: raw.emoji || '🍨',
    image: raw.image || '',
    color: THUMB_COLORS.includes(raw.color) ? raw.color : null,
    description: raw.description || '',
    tags,
    difficulty: raw.difficulty || 'Facile',
    appliance,
    isCreami,
    prepTime: toNumber(raw.prepTime),
    cookTime: toNumber(raw.cookTime),
    restTime: toNumber(raw.restTime),
    freezeTime: toNumber(raw.freezeTime, isCreami ? 24 : 0),
    servings,
    modes: isCreami ? modes : [],
    ingredients,
    steps: (Array.isArray(raw.steps) ? raw.steps : []).map(String).filter((s) => s.trim()),
    nutrition: {
      protein: toNumber(nutrition.protein, null),
      carbs: toNumber(nutrition.carbs, null),
      fat: toNumber(nutrition.fat, null),
    },
    tip: raw.tip || '',
    author: raw.author || '',
    kcalTotal,
    kcalPerServing: Math.round(kcalTotal / servings),
  };

  /** Temps « actif » : préparation + cuisson (sans repos ni congélation). */
  recipe.activeTime = recipe.prepTime + recipe.cookTime;

  recipe.searchText = normalize([
    recipe.title,
    recipe.description,
    tags.join(' '),
    recipe.modes.join(' '),
    appliance,
    ingredients.map((i) => i.name).join(' '),
    recipe.author,
  ].join(' '));

  return recipe;
}

/** Quantités et kcal recalculées pour un nombre de portions. */
export function scaleIngredients(recipe, servings) {
  const ratio = servings / recipe.servings;
  return recipe.ingredients.map((i) => ({
    ...i,
    qty: i.qty === null ? null : i.qty * ratio,
    kcal: i.kcal * ratio,
  }));
}

/** Couleur de vignette : celle de la recette, sinon celle de sa catégorie. */
export function thumbColor(recipe, categoriesById) {
  const color = recipe.color || categoriesById.get(recipe.category)?.color;
  return `var(--${THUMB_COLORS.includes(color) ? color : 'sauge'})`;
}

/** Construit la bibliothèque (catégories + recettes indexées) à partir du contenu de data.json. */
export function buildLibrary(data) {
  const categories = (data?.categories || []).map((c) => ({
    id: String(c.id),
    label: c.label || c.id,
    color: THUMB_COLORS.includes(c.color) ? c.color : 'sauge',
  }));
  const recipes = (data?.recipes || []).filter((r) => r && r.id).map(normalizeRecipe);
  return {
    categories,
    categoriesById: new Map(categories.map((c) => [c.id, c])),
    recipes,
    byId: new Map(recipes.map((r) => [r.id, r])),
  };
}

/** Charge data.json, la seule source des recettes. */
export async function loadLibrary() {
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`data.json introuvable (HTTP ${res.status})`);
    const json = await res.json();
    if (!Array.isArray(json.recipes)) throw new Error('data.json doit contenir un tableau "recipes".');
    libraryStore.set({ status: 'ready', error: null, ...buildLibrary(json) });
  } catch (error) {
    libraryStore.set({ status: 'error', error, ...buildLibrary(null) });
  }
}

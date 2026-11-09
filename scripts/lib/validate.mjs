import {
  THUMB_COLORS, AISLES, UNITS, GROUPS, CREAMI_MODES, DIFFICULTIES, ID_PATTERN, APPLIANCES, CREAMI,
} from '../../js/core/schema.js';

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const groupIds = GROUPS.map((g) => g.id);

/**
 * Vérifie le contenu de data.json.
 * @param {any} data  objet déjà parsé
 * @returns {{ errors: string[], warnings: string[], recipeCount: number, categoryCount: number }}
 */
export function validateData(data) {
  const errors = [];
  const warnings = [];
  const err = (where, msg) => errors.push(`✗ ${where} : ${msg}`);
  const warn = (where, msg) => warnings.push(`! ${where} : ${msg}`);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    err('racine', 'data.json doit être un objet { "categories": [...], "recipes": [...] }');
    return { errors, warnings, recipeCount: 0, categoryCount: 0 };
  }

  // ---------- Catégories ----------
  const categoryIds = new Set();
  if (!Array.isArray(data.categories)) {
    err('categories', 'doit être un tableau');
  } else {
    data.categories.forEach((c, i) => {
      const where = `categories[${i}]`;
      if (!isStr(c?.id) || !ID_PATTERN.test(c.id)) err(where, `id invalide « ${c?.id} » (kebab-case sans accent)`);
      if (categoryIds.has(c?.id)) err(where, `id en double « ${c.id} »`);
      categoryIds.add(c?.id);
      if (!isStr(c?.label)) err(where, 'label manquant');
      if (!THUMB_COLORS.includes(c?.color)) err(where, `color doit être l'une de : ${THUMB_COLORS.join(', ')}`);
    });
  }

  // ---------- Recettes ----------
  const ids = new Set();
  const titles = new Map();
  if (!Array.isArray(data.recipes)) {
    err('recipes', 'doit être un tableau');
  } else {
    data.recipes.forEach((r, i) => {
      if (!r || typeof r !== 'object') {
        err(`recipes[${i}]`, 'doit être un objet');
        return;
      }
      const where = `recipes[${i}]${r.id ? ` (${r.id})` : ''}`;

      if (!isStr(r.id) || !ID_PATTERN.test(r.id)) err(where, 'id manquant ou invalide (kebab-case sans accent, ex. "fraise-banane-amande")');
      else if (ids.has(r.id)) err(where, `id en double « ${r.id} »`);
      ids.add(r.id);

      if (!isStr(r.title)) err(where, 'title manquant');
      else {
        const key = r.title.trim().toLowerCase();
        if (titles.has(key)) warn(where, `même titre que ${titles.get(key)}`);
        titles.set(key, r.id);
      }

      if (!categoryIds.has(r.category)) err(where, `category « ${r.category} » absente de "categories"`);
      if (r.color !== undefined && !THUMB_COLORS.includes(r.color)) err(where, `color doit être l'une de : ${THUMB_COLORS.join(', ')}`);
      if (!isStr(r.emoji) && !isStr(r.image)) warn(where, 'ni emoji ni image : la vignette sera 🍨');
      if (!isStr(r.description)) warn(where, 'description vide');
      if (!isStr(r.author)) warn(where, 'author vide : signe ta recette');

      if (!Number.isInteger(r.servings) || r.servings < 1) err(where, 'servings doit être un entier ≥ 1');
      if (!isNum(r.prepTime) || r.prepTime < 0) err(where, 'prepTime (minutes) doit être un nombre ≥ 0');
      ['cookTime', 'restTime'].forEach((k) => {
        if (r[k] !== undefined && (!isNum(r[k]) || r[k] < 0)) err(where, `${k} (minutes) doit être un nombre ≥ 0`);
      });
      if (!DIFFICULTIES.includes(r.difficulty)) err(where, `difficulty doit être l'une de : ${DIFFICULTIES.join(', ')}`);
      if (!Array.isArray(r.tags) || r.tags.some((t) => !isStr(t))) err(where, 'tags doit être un tableau de textes');

      // Appareil : facultatif. « Ninja Creami » rend modes et freezeTime obligatoires.
      if (r.appliance !== undefined && !APPLIANCES.includes(r.appliance)) {
        err(where, `appliance « ${r.appliance} » inconnu (${APPLIANCES.join(', ')})`);
      }
      const hasModes = Array.isArray(r.modes) && r.modes.length > 0;
      const isCreami = r.appliance === CREAMI;
      if (isCreami) {
        if (!hasModes) err(where, 'une recette Ninja Creami doit lister ses programmes dans modes');
        if (!isNum(r.freezeTime) || r.freezeTime < 0) err(where, 'freezeTime (heures) est obligatoire pour une recette Ninja Creami');
      } else {
        if (hasModes) err(where, 'modes est réservé aux recettes "appliance": "Ninja Creami"');
        if (r.freezeTime !== undefined && (!isNum(r.freezeTime) || r.freezeTime < 0)) err(where, 'freezeTime (heures) doit être un nombre ≥ 0');
      }
      if (r.modes !== undefined && !Array.isArray(r.modes)) err(where, 'modes doit être un tableau');
      if (hasModes) r.modes.forEach((m) => { if (!CREAMI_MODES.includes(m)) err(where, `mode inconnu « ${m} » (${CREAMI_MODES.join(', ')})`); });

      if (!Array.isArray(r.ingredients) || !r.ingredients.length) {
        err(where, 'ingredients doit contenir au moins un ingrédient');
      } else {
        r.ingredients.forEach((ing, j) => {
          const w = `${where} › ingredients[${j}]${ing?.name ? ` (${ing.name})` : ''}`;
          if (!ing || typeof ing !== 'object') {
            err(w, 'doit être un objet');
            return;
          }
          if (!isStr(ing.name)) err(w, 'name manquant');
          if (ing.qty !== null && (!isNum(ing.qty) || ing.qty <= 0)) err(w, 'qty doit être un nombre > 0 (ou null pour « à volonté »)');
          if (!UNITS.includes(ing.unit)) err(w, `unit « ${ing.unit} » inconnue (${UNITS.join(', ')})`);
          if (!isNum(ing.kcal) || ing.kcal < 0) err(w, 'kcal doit être un nombre ≥ 0 (kcal de CETTE quantité)');
          if (!groupIds.includes(ing.group)) err(w, `group doit être l'un de : ${groupIds.join(', ')}`);
          if (!AISLES.includes(ing.aisle)) err(w, `aisle doit être l'un de : ${AISLES.join(', ')}`);
          if (ing.unit === 'g' && isNum(ing.qty) && isNum(ing.kcal) && ing.kcal / ing.qty > 9.5) {
            warn(w, `${Math.round((ing.kcal / ing.qty) * 100)} kcal/100 g, ça paraît beaucoup : vérifie que kcal correspond à la quantité et pas à 100 g`);
          }
        });
      }

      if (!Array.isArray(r.steps) || !r.steps.length || r.steps.some((s) => !isStr(s))) err(where, 'steps doit contenir au moins une étape (texte)');

      const n = r.nutrition;
      if (n !== undefined) {
        ['protein', 'carbs', 'fat'].forEach((k) => {
          if (n?.[k] !== undefined && (!isNum(n[k]) || n[k] < 0)) err(where, `nutrition.${k} doit être un nombre ≥ 0`);
        });
      } else {
        warn(where, 'nutrition absente (protéines / glucides / lipides par portion)');
      }
    });
  }

  return {
    errors,
    warnings,
    recipeCount: Array.isArray(data.recipes) ? data.recipes.length : 0,
    categoryCount: categoryIds.size,
  };
}

import { $, $$, esc, debounce, plural } from '../utils/dom.js';
import { normalize, slugify, capitalize } from '../utils/text.js';
import { formatKcal } from '../utils/format.js';
import { copyText, downloadFile } from '../utils/clipboard.js';
import { readStorage, writeStorage } from '../core/store.js';
import { libraryStore, userRecipesStore, draftStore } from '../core/stores.js';
import {
  AISLES, UNITS, GROUPS, CREAMI_MODES, DIFFICULTIES, THUMB_COLORS, APPLIANCES, CREAMI,
} from '../core/library.js';
import { collectTags } from '../core/filters.js';
import { navigate } from '../core/router.js';
import { icons } from '../ui/icons.js';
import { toast } from '../ui/toast.js';

const EMOJIS = ['🍲', '🍛', '🥗', '🍝', '🥘', '🍳', '🥑', '🍅', '🥕', '🧆', '🥞', '🍰', '🍪', '🍫', '🍨', '🍓', '🥭', '🫐', '🍌', '🍋', '🍹', '🍵', '☕'];
const COLOR_LABELS = { sauge: 'Sauge', beurre: 'Beurre', ciel: 'Ciel', lilas: 'Lilas', pelure: 'Pelure' };

const blankIngredient = () => ({ qty: '', unit: 'g', name: '', kcal: '', group: 'base', aisle: 'Épicerie' });

function emptyModel() {
  const firstCategory = libraryStore.get().categories[0]?.id || 'perso';
  return {
    title: '', category: firstCategory, emoji: '🍲', color: '', description: '',
    appliance: '', servings: 2, prepTime: 10, cookTime: '', restTime: '', freezeTime: 24, difficulty: 'Facile',
    modes: ['Lite Ice Cream'], tags: [],
    ingredients: [blankIngredient(), blankIngredient(), blankIngredient()],
    steps: ['', ''],
    nutrition: { protein: '', carbs: '', fat: '' },
    tip: '', author: readStorage('author', ''),
  };
}

const clone = (v) => JSON.parse(JSON.stringify(v));
const num = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));

/** Convertit le modèle du formulaire en recette au format data.json. */
function toRecipe(model, id) {
  const nutrition = {};
  ['protein', 'carbs', 'fat'].forEach((k) => {
    const v = num(model.nutrition[k]);
    if (v !== null) nutrition[k] = v;
  });
  const isCreami = model.appliance === CREAMI;
  const cookTime = num(model.cookTime);
  const restTime = num(model.restTime);
  return {
    id,
    title: model.title.trim(),
    category: model.category,
    emoji: model.emoji.trim() || '🍲',
    ...(model.color ? { color: model.color } : {}),
    description: model.description.trim(),
    tags: model.tags,
    ...(model.appliance ? { appliance: model.appliance } : {}),
    difficulty: model.difficulty,
    prepTime: num(model.prepTime) ?? 0,
    ...(cookTime ? { cookTime } : {}),
    ...(restTime ? { restTime } : {}),
    ...(isCreami ? { freezeTime: num(model.freezeTime) ?? 24 } : {}),
    servings: Math.max(1, num(model.servings) ?? 2),
    ...(isCreami ? { modes: model.modes } : {}),
    ingredients: model.ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({
        qty: num(i.qty),
        unit: i.unit,
        name: capitalize(i.name.trim()),
        kcal: num(i.kcal) ?? 0,
        group: i.group,
        aisle: i.aisle,
      })),
    steps: model.steps.map((s) => s.trim()).filter(Boolean),
    nutrition,
    tip: model.tip.trim(),
    author: model.author.trim(),
  };
}

/** Ingrédients connus (data.json + perso) pour pré-remplir kcal et rayon. */
function knownIngredients() {
  const map = new Map();
  libraryStore.get().recipes.forEach((r) => r.ingredients.forEach((i) => {
    const key = normalize(i.name);
    if (!map.has(key) && i.qty) map.set(key, { unit: i.unit, kcalPerUnit: i.kcal / i.qty, aisle: i.aisle, group: i.group, name: i.name });
  }));
  return map;
}

const options = (list, selected, label = (v) => v) =>
  list.map((v) => `<option value="${esc(v)}" ${v === selected ? 'selected' : ''}>${esc(label(v))}</option>`).join('');

/** Vue « Créer / modifier une recette » (stockée dans le localStorage). */
export function createCreateView(root, { onSaved }) {
  let model = emptyModel();
  let editingId = null;
  let error = '';

  const saveDraft = debounce(() => draftStore.set({ editingId, model }), 300);

  function readForm() {
    const form = $('form.recipe-form', root);
    if (!form) return;
    const val = (name) => form.elements[name]?.value ?? '';
    model.title = val('title');
    model.category = val('category');
    model.emoji = val('emoji');
    model.color = form.querySelector('[name="color"]:checked')?.value ?? '';
    model.description = val('description');
    model.servings = val('servings');
    model.appliance = val('appliance');
    model.prepTime = val('prepTime');
    model.cookTime = val('cookTime');
    model.restTime = val('restTime');
    if (form.elements.freezeTime) model.freezeTime = val('freezeTime');
    model.tip = val('tip');
    model.author = val('author');
    model.nutrition = { protein: val('protein'), carbs: val('carbs'), fat: val('fat') };
    model.ingredients = $$('.ing-row', form).map((row) => ({
      qty: row.querySelector('[name="ing-qty"]').value,
      unit: row.querySelector('[name="ing-unit"]').value,
      name: row.querySelector('[name="ing-name"]').value,
      kcal: row.querySelector('[name="ing-kcal"]').value,
      group: row.querySelector('[name="ing-group"]').value,
      aisle: row.querySelector('[name="ing-aisle"]').value,
    }));
    model.steps = $$('[name="step"]', form).map((t) => t.value);
  }

  function estimate() {
    const total = model.ingredients.reduce((s, i) => s + (num(i.kcal) ?? 0), 0);
    const servings = Math.max(1, num(model.servings) ?? 1);
    return { total, perServing: Math.round(total / servings) };
  }

  function updateEstimate() {
    const { total, perServing } = estimate();
    const node = $('[data-estimate]', root);
    if (node) node.innerHTML = `≈ <strong>${formatKcal(perServing)} kcal</strong> par portion · ${formatKcal(total)} kcal le pot`;
  }

  function ingredientRow(ing, index) {
    return `
      <div class="ing-row" data-index="${index}">
        <input class="input input--qty" name="ing-qty" type="number" inputmode="decimal" step="any" min="0" placeholder="Qté" value="${esc(ing.qty)}" aria-label="Quantité">
        <select class="input" name="ing-unit" aria-label="Unité">${options(UNITS, ing.unit)}</select>
        <input class="input ing-row__name" name="ing-name" list="known-ingredients" placeholder="Ingrédient" value="${esc(ing.name)}" aria-label="Ingrédient">
        <input class="input input--qty" name="ing-kcal" type="number" inputmode="numeric" min="0" placeholder="kcal" value="${esc(ing.kcal)}" aria-label="Calories pour cette quantité">
        <select class="input" name="ing-group" aria-label="Rôle">${options(GROUPS.map((g) => g.id), ing.group, (id) => GROUPS.find((g) => g.id === id).label)}</select>
        <select class="input" name="ing-aisle" aria-label="Rayon">${options(AISLES, ing.aisle)}</select>
        <button type="button" class="icon-btn icon-btn--ghost" data-action="remove-ing" aria-label="Supprimer l'ingrédient">${icons.close}</button>
      </div>`;
  }

  function persoList() {
    const recipes = userRecipesStore.get();
    if (!recipes.length) return '';
    return `
      <section class="perso">
        <div class="section-head">
          <h2>Mes recettes perso <span class="chip__count">${recipes.length}</span></h2>
          <button type="button" class="btn btn--outline" data-action="export">${icons.download}Exporter en JSON</button>
        </div>
        <p class="form-hint">Elles sont stockées dans ce navigateur uniquement. Pour les partager avec tout le monde, exporte-les et colle-les dans le tableau <code>recipes</code> de <code>data.json</code> (procédure dans le README).</p>
        <ul class="perso__list">
          ${recipes.map((r) => `
            <li class="perso__item">
              <span class="perso__emoji" aria-hidden="true">${esc(r.emoji || '🍨')}</span>
              <a href="#/recette/${encodeURIComponent(r.id)}">${esc(r.title)}</a>
              <a class="btn btn--ghost" href="#/creer/${encodeURIComponent(r.id)}">${icons.pen}Modifier</a>
            </li>`).join('')}
        </ul>
      </section>`;
  }

  function render() {
    const { categories, recipes } = libraryStore.get();
    const tagSuggestions = [...new Set([...collectTags(recipes), ...model.tags])];
    const known = knownIngredients();
    const cats = categories.length ? categories : [{ id: 'perso', label: 'Perso' }];

    root.innerHTML = `
      <div class="container page page--narrow">
        <header class="page-head">
          <p class="page-head__eyebrow">${editingId ? 'Modification' : 'Brouillon enregistré automatiquement'}</p>
          <h1 class="page-head__title">${editingId ? 'Modifier la recette' : 'Nouvelle recette'}</h1>
          <p class="page-head__sub">Ta recette est gardée dans ce navigateur. Pas de compte, pas de serveur.</p>
        </header>

        <form class="recipe-form" novalidate>
          <datalist id="known-ingredients">${[...known.values()].map((k) => `<option value="${esc(k.name)}">`).join('')}</datalist>

          <section class="form-card">
            <div class="field">
              <label for="f-title">Nom de la recette</label>
              <input id="f-title" class="input input--lg" name="title" required maxlength="80" placeholder="Ex. Curry de pois chiches coco" value="${esc(model.title)}">
            </div>
            <div class="field">
              <label for="f-description">En une phrase</label>
              <textarea id="f-description" class="input" name="description" rows="2" maxlength="220" placeholder="Pourquoi on va l'adorer.">${esc(model.description)}</textarea>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="f-category">Catégorie</label>
                <select id="f-category" class="input" name="category">${options(cats.map((c) => c.id), model.category, (id) => cats.find((c) => c.id === id).label)}</select>
              </div>
              <div class="field">
                <label for="f-author">Signée par</label>
                <input id="f-author" class="input" name="author" maxlength="40" placeholder="Ton prénom" value="${esc(model.author)}">
              </div>
            </div>
            <div class="field">
              <span class="field__label">Vignette</span>
              <div class="thumb-picker">
                <input class="input input--emoji" name="emoji" maxlength="8" value="${esc(model.emoji)}" aria-label="Emoji de la vignette">
                <div class="emoji-row">${EMOJIS.map((e) => `<button type="button" class="emoji-btn" data-emoji="${e}" aria-label="Choisir ${e}">${e}</button>`).join('')}</div>
              </div>
              <div class="swatches" role="radiogroup" aria-label="Couleur de la vignette">
                <label class="swatch"><input type="radio" name="color" value="" ${!model.color ? 'checked' : ''}><span class="swatch__dot swatch__dot--auto"></span>Auto</label>
                ${THUMB_COLORS.map((c) => `<label class="swatch"><input type="radio" name="color" value="${c}" ${model.color === c ? 'checked' : ''}><span class="swatch__dot" style="background:var(--${c})"></span>${COLOR_LABELS[c]}</label>`).join('')}
              </div>
            </div>
          </section>

          <section class="form-card">
            <div class="field-row">
              <div class="field">
                <label for="f-appliance">Appareil</label>
                <select id="f-appliance" class="input" name="appliance">
                  <option value="" ${!model.appliance ? 'selected' : ''}>Aucun en particulier</option>
                  ${options(APPLIANCES, model.appliance)}
                </select>
              </div>
              <div class="field">
                <label for="f-servings">Portions</label>
                <input id="f-servings" class="input" name="servings" type="number" min="1" max="24" inputmode="numeric" value="${esc(model.servings)}">
              </div>
            </div>
            <div class="field-row field-row--3">
              <div class="field">
                <label for="f-prep">Préparation (min)</label>
                <input id="f-prep" class="input" name="prepTime" type="number" min="0" inputmode="numeric" value="${esc(model.prepTime)}">
              </div>
              <div class="field">
                <label for="f-cook">Cuisson (min)</label>
                <input id="f-cook" class="input" name="cookTime" type="number" min="0" inputmode="numeric" placeholder="0" value="${esc(model.cookTime)}">
              </div>
              ${model.appliance === CREAMI ? `
              <div class="field">
                <label for="f-freeze">Congélation (h)</label>
                <input id="f-freeze" class="input" name="freezeTime" type="number" min="0" inputmode="numeric" value="${esc(model.freezeTime)}">
              </div>` : `
              <div class="field">
                <label for="f-rest">Repos (min)</label>
                <input id="f-rest" class="input" name="restTime" type="number" min="0" inputmode="numeric" placeholder="0" value="${esc(model.restTime)}">
              </div>`}
            </div>
            <div class="field">
              <span class="field__label">Difficulté</span>
              <div class="chips chips--wrap">${DIFFICULTIES.map((d) => `<button type="button" class="chip chip--sm" data-difficulty="${esc(d)}" aria-pressed="${model.difficulty === d}">${esc(d)}</button>`).join('')}</div>
            </div>
            ${model.appliance === CREAMI ? `
            <div class="field">
              <span class="field__label">Programmes Creami <small>(dans l'ordre)</small></span>
              <div class="chips chips--wrap">${CREAMI_MODES.map((m) => `<button type="button" class="chip chip--sm" data-mode="${esc(m)}" aria-pressed="${model.modes.includes(m)}">${esc(m)}</button>`).join('')}</div>
            </div>` : ''}
            <div class="field">
              <span class="field__label">Tags</span>
              <div class="chips chips--wrap">
                ${tagSuggestions.map((t) => `<button type="button" class="chip chip--sm" data-tag="${esc(t)}" aria-pressed="${model.tags.includes(t)}">${esc(t)}</button>`).join('')}
                <input class="input input--tag" data-new-tag placeholder="+ nouveau tag" maxlength="30" aria-label="Ajouter un tag">
              </div>
            </div>
          </section>

          <section class="form-card">
            <div class="section-head">
              <h2>Ingrédients</h2>
              <span class="form-estimate" data-estimate></span>
            </div>
            <p class="form-hint">Quantités pour ${esc(model.servings || 2)} ${plural(Number(model.servings) || 2, 'portion', 'portions')}. Les kcal sont celles de la quantité indiquée (pas pour 100 g) ; pour un ingrédient déjà connu, elles se remplissent toutes seules.</p>
            <div class="ing-list">${model.ingredients.map(ingredientRow).join('')}</div>
            <button type="button" class="btn btn--outline btn--block" data-action="add-ing">${icons.plus}Ajouter un ingrédient</button>
          </section>

          <section class="form-card">
            <h2>Étapes</h2>
            <ol class="step-list">
              ${model.steps.map((s, i) => `
                <li class="step-row">
                  <span class="step-row__n">${i + 1}</span>
                  <textarea class="input" name="step" rows="2" placeholder="${i === 0 ? "Ex. Fais revenir l'oignon 5 min dans l'huile d'olive." : 'Et ensuite ?'}" aria-label="Étape ${i + 1}">${esc(s)}</textarea>
                  <button type="button" class="icon-btn icon-btn--ghost" data-action="remove-step" data-index="${i}" aria-label="Supprimer l'étape ${i + 1}">${icons.close}</button>
                </li>`).join('')}
            </ol>
            <button type="button" class="btn btn--outline btn--block" data-action="add-step">${icons.plus}Ajouter une étape</button>
          </section>

          <section class="form-card">
            <h2>Pour aller plus loin <small class="form-optional">facultatif</small></h2>
            <div class="field-row field-row--3">
              <div class="field"><label for="f-protein">Protéines / portion (g)</label><input id="f-protein" class="input" name="protein" type="number" min="0" step="any" value="${esc(model.nutrition.protein)}"></div>
              <div class="field"><label for="f-carbs">Glucides / portion (g)</label><input id="f-carbs" class="input" name="carbs" type="number" min="0" step="any" value="${esc(model.nutrition.carbs)}"></div>
              <div class="field"><label for="f-fat">Lipides / portion (g)</label><input id="f-fat" class="input" name="fat" type="number" min="0" step="any" value="${esc(model.nutrition.fat)}"></div>
            </div>
            <div class="field">
              <label for="f-tip">L'astuce</label>
              <textarea id="f-tip" class="input" name="tip" rows="2" maxlength="240" placeholder="Le petit truc qui change tout.">${esc(model.tip)}</textarea>
            </div>
          </section>

          ${error ? `<p class="form-error" role="alert">${esc(error)}</p>` : ''}

          <div class="page-actions page-actions--sticky">
            <button type="submit" class="btn btn--tomate">${icons.check}${editingId ? 'Enregistrer les modifs' : 'Enregistrer la recette'}</button>
            <button type="button" class="btn btn--ghost" data-action="reset">${editingId ? 'Annuler' : 'Repartir de zéro'}</button>
          </div>
        </form>

        ${persoList()}
      </div>`;

    updateEstimate();
  }

  function rerender(mutate) {
    readForm();
    mutate?.();
    saveDraft();
    render();
  }

  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-new-tag]')) return;
    readForm();
    updateEstimate();
    saveDraft();
  });

  // Pré-remplissage des kcal / rayon pour un ingrédient connu.
  root.addEventListener('change', (e) => {
    if (e.target.name === 'appliance') {
      rerender(() => {
        if (model.appliance === CREAMI && !model.modes.length) model.modes = ['Lite Ice Cream'];
      });
      $('[name="appliance"]', root)?.focus();
      return;
    }
    const row = e.target.closest('.ing-row');
    if (!row || !['ing-name', 'ing-qty', 'ing-unit'].includes(e.target.name)) return;
    const known = knownIngredients().get(normalize(row.querySelector('[name="ing-name"]').value));
    if (!known) return;
    const qtyInput = row.querySelector('[name="ing-qty"]');
    const unitSelect = row.querySelector('[name="ing-unit"]');
    const kcalInput = row.querySelector('[name="ing-kcal"]');
    if (e.target.name === 'ing-name') {
      unitSelect.value = known.unit;
      row.querySelector('[name="ing-aisle"]').value = known.aisle;
      row.querySelector('[name="ing-group"]').value = known.group;
    }
    const qty = num(qtyInput.value);
    if (qty !== null && unitSelect.value === known.unit) kcalInput.value = Math.round(qty * known.kcalPerUnit);
    readForm();
    updateEstimate();
    saveDraft();
  });

  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.matches('[data-new-tag]')) return;
    e.preventDefault();
    const tag = capitalize(e.target.value);
    if (!tag) return;
    rerender(() => {
      if (!model.tags.includes(tag)) model.tags.push(tag);
    });
    $('[data-new-tag]', root)?.focus();
  });

  root.addEventListener('click', async (e) => {
    const el = e.target.closest('button');
    if (!el) return;
    const { dataset } = el;

    if (dataset.emoji) {
      const input = $('[name="emoji"]', root);
      input.value = dataset.emoji;
      readForm();
      saveDraft();
      return;
    }
    if (dataset.difficulty) return rerender(() => { model.difficulty = dataset.difficulty; });
    if (dataset.mode) {
      return rerender(() => {
        model.modes = model.modes.includes(dataset.mode)
          ? model.modes.filter((m) => m !== dataset.mode)
          : [...model.modes, dataset.mode];
      });
    }
    if (dataset.tag) {
      return rerender(() => {
        model.tags = model.tags.includes(dataset.tag)
          ? model.tags.filter((t) => t !== dataset.tag)
          : [...model.tags, dataset.tag];
      });
    }

    switch (dataset.action) {
      case 'add-ing':
        rerender(() => model.ingredients.push(blankIngredient()));
        $$('[name="ing-name"]', root).at(-1)?.focus();
        break;
      case 'remove-ing': {
        const index = Number(el.closest('.ing-row').dataset.index);
        rerender(() => {
          model.ingredients.splice(index, 1);
          if (!model.ingredients.length) model.ingredients.push(blankIngredient());
        });
        break;
      }
      case 'add-step':
        rerender(() => model.steps.push(''));
        $$('[name="step"]', root).at(-1)?.focus();
        break;
      case 'remove-step':
        rerender(() => {
          model.steps.splice(Number(dataset.index), 1);
          if (!model.steps.length) model.steps.push('');
        });
        break;
      case 'reset':
        draftStore.set(null);
        error = '';
        if (editingId) {
          navigate('creer');
        } else {
          model = emptyModel();
          render();
        }
        break;
      case 'export': {
        const json = JSON.stringify(userRecipesStore.get(), null, 2);
        downloadFile('recettes-perso.json', json);
        await copyText(json);
        toast('Exporté et copié dans le presse-papiers.');
        break;
      }
      default:
    }
  });

  root.addEventListener('submit', (e) => {
    e.preventDefault();
    readForm();
    const recipeId = editingId || `perso-${slugify(model.title) || 'recette'}-${Date.now().toString(36)}`;
    const recipe = toRecipe(model, recipeId);

    if (!recipe.title) error = 'Il manque le nom de la recette.';
    else if (!recipe.ingredients.length) error = 'Ajoute au moins un ingrédient.';
    else if (!recipe.steps.length) error = 'Ajoute au moins une étape.';
    else error = '';

    if (error) {
      render();
      $('.form-error', root)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    writeStorage('author', recipe.author);
    userRecipesStore.set((list) => (editingId
      ? list.map((r) => (r.id === editingId ? recipe : r))
      : [...list, recipe]));
    draftStore.set(null);
    toast(editingId ? 'Recette mise à jour.' : 'Recette enregistrée. 🍨');
    editingId = null;
    model = emptyModel();
    onSaved(recipeId);
  });

  return {
    show(param) {
      error = '';
      const draft = draftStore.get();
      if (param) {
        const existing = userRecipesStore.get().find((r) => r.id === param);
        if (!existing) {
          toast('Seules les recettes perso sont modifiables ici.');
          navigate('creer');
          return;
        }
        editingId = param;
        model = draft?.editingId === param ? clone(draft.model) : {
          ...emptyModel(),
          ...clone(existing),
          color: existing.color || '',
          appliance: existing.appliance || (existing.modes?.length ? CREAMI : ''),
          modes: existing.modes?.length ? existing.modes : ['Lite Ice Cream'],
          cookTime: existing.cookTime ?? '',
          restTime: existing.restTime ?? '',
          freezeTime: existing.freezeTime ?? 24,
          ingredients: existing.ingredients.map((i) => ({ ...blankIngredient(), ...i, qty: i.qty ?? '', kcal: i.kcal ?? '' })),
          nutrition: { protein: '', carbs: '', fat: '', ...(existing.nutrition || {}) },
        };
      } else {
        editingId = null;
        model = draft && !draft.editingId ? { ...emptyModel(), ...clone(draft.model) } : emptyModel();
      }
      render();
    },
    hide() {},
    refresh() {
      if (root.querySelector('form.recipe-form')) {
        readForm();
        render();
      }
    },
  };
}

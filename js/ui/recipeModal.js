import { esc, plural } from '../utils/dom.js';
import { formatQty, formatKcal, formatMinutes, formatHours } from '../utils/format.js';
import { copyText, mailtoUrl } from '../utils/clipboard.js';
import { GROUPS, scaleIngredients, thumbColor } from '../core/library.js';
import {
  libraryStore, favoritesStore, menuStore, userRecipesStore,
  toggleFavorite, setMenuServings, removeFromMenu,
} from '../core/stores.js';
import { icons } from './icons.js';
import { thumbContent } from './recipeCard.js';
import { toast } from './toast.js';

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 24;

/**
 * Fiche recette dans un <dialog>.
 * @param {HTMLDialogElement} dialog
 * @param {{ onClose: () => void, onEdit: (id: string) => void }} hooks
 */
export function createRecipeModal(dialog, { onClose, onEdit }) {
  const scroller = dialog.querySelector('.modal__scroll');
  let recipe = null;
  let servings = 2;
  let checked = new Set();
  let confirmDelete = false;

  const ingredientsText = () => {
    const lines = scaleIngredients(recipe, servings)
      .map((i) => `- ${i.name}${i.qty !== null ? ` : ${formatQty(i.qty, i.unit)}` : ''}`);
    return `${recipe.title} (${servings} pers.)\n\n${lines.join('\n')}`;
  };

  function ingredientsHtml() {
    const scaled = scaleIngredients(recipe, servings);
    return GROUPS.map((group) => {
      const items = scaled
        .map((ing, index) => ({ ing, index }))
        .filter(({ ing }) => ing.group === group.id);
      if (!items.length) return '';
      return `
        <p class="ingredients__group">${esc(group.label)}</p>
        <ul class="ingredients">
          ${items.map(({ ing, index }) => `
            <li>
              <label class="ingredient">
                <input type="checkbox" data-ing="${index}" ${checked.has(index) ? 'checked' : ''}>
                <span class="ingredient__qty">${esc(formatQty(ing.qty, ing.unit))}</span>
                <span class="ingredient__name">${esc(ing.name)}</span>
                ${ing.kcal ? `<span class="ingredient__kcal">${formatKcal(ing.kcal)} kcal</span>` : ''}
              </label>
            </li>`).join('')}
        </ul>`;
    }).join('');
  }

  function servingsHtml() {
    const pots = servings / recipe.servings;
    const potsLabel = Number.isInteger(pots) ? pots : pots.toFixed(1).replace('.', ',');
    return `
      <div class="stepper" role="group" aria-label="Nombre de portions">
        <button type="button" class="stepper__btn" data-step="-1" aria-label="Une portion de moins" ${servings <= MIN_SERVINGS ? 'disabled' : ''}>${icons.minus}</button>
        <span class="stepper__value" aria-live="polite">${servings} pers.</span>
        <button type="button" class="stepper__btn stepper__btn--plus" data-step="1" aria-label="Une portion de plus" ${servings >= MAX_SERVINGS ? 'disabled' : ''}>${icons.plus}</button>
      </div>
      <p class="servings__hint">≈ ${potsLabel} ${plural(pots, 'pot', 'pots')} Ninja Creami · ${formatKcal(recipe.kcalPerServing * servings)} kcal au total</p>`;
  }

  function menuButtonHtml() {
    const inMenu = menuStore.get()[recipe.id];
    const label = inMenu ? (inMenu === servings ? 'Dans ton menu' : 'Mettre à jour le menu') : 'Ajouter au menu';
    return `<button type="button" class="btn btn--encre" data-action="menu">${inMenu === servings ? icons.check : icons.menu}${label} · ${servings} pers.</button>
      ${inMenu ? `<button type="button" class="btn btn--ghost" data-action="unmenu">Retirer du menu</button>` : ''}`;
  }

  function favButtonHtml() {
    const isFav = favoritesStore.get().includes(recipe.id);
    return `<button type="button" class="modal__fav" data-action="fav" aria-pressed="${isFav}" aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${isFav ? icons.heartFilled : icons.heart}</button>`;
  }

  function render() {
    const { categoriesById } = libraryStore.get();
    const category = categoriesById.get(recipe.category);
    const n = recipe.nutrition;
    const macro = (value, label) => (value === null ? '' : `<span><strong class="num">${value} g</strong> ${label}</span>`);
    const macros = [macro(n.protein, 'protéines'), macro(n.carbs, 'glucides'), macro(n.fat, 'lipides')].filter(Boolean).join('');

    scroller.innerHTML = `
      <div class="detail__hero" style="--thumb:${thumbColor(recipe, categoriesById)}">
        ${thumbContent(recipe, 'detail__emoji')}
        <div class="modal__tools">
          <span data-slot="fav">${favButtonHtml()}</span>
          <button type="button" class="modal__close" data-action="close" aria-label="Fermer">${icons.close}</button>
        </div>
      </div>
      <div class="detail__body">
        <div class="detail__eyebrow">
          ${category ? `<span class="chip chip--sm chip--static chip--encre">${esc(category.label)}</span>` : ''}
          ${recipe.tags.map((t) => `<span class="chip chip--sm chip--static">${esc(t)}</span>`).join('')}
        </div>
        <h2 class="detail__title" id="modal-title">${esc(recipe.title)}</h2>
        ${recipe.description ? `<p class="detail__desc">${esc(recipe.description)}</p>` : ''}
        <p class="detail__author">${recipe.isUser ? 'Recette perso' : 'Recette'}${recipe.author ? ` signée <strong>${esc(recipe.author)}</strong>` : ''} · ${esc(recipe.difficulty)}</p>

        <div class="stats">
          <div class="stat"><span class="stat__value">${formatMinutes(recipe.prepTime)}</span><span class="stat__label">Préparation</span></div>
          <div class="stat"><span class="stat__value">${formatHours(recipe.freezeTime)}</span><span class="stat__label">Congélation</span></div>
          <div class="stat stat--accent"><span class="stat__value">${formatKcal(recipe.kcalPerServing)}</span><span class="stat__label">kcal / portion</span></div>
          <div class="stat"><span class="stat__value">${n.protein ?? '–'}${n.protein !== null ? ' g' : ''}</span><span class="stat__label">Protéines / portion</span></div>
        </div>

        ${macros ? `<p class="macros">Par portion : ${macros}</p>` : ''}

        ${recipe.modes.length ? `
          <div class="modes">
            <span class="modes__label">Programmes Creami</span>
            <ol class="modes__list">${recipe.modes.map((m) => `<li>${esc(m)}</li>`).join('')}</ol>
          </div>` : ''}

        <div class="detail__cols">
          <section aria-labelledby="ing-title">
            <div class="section-head">
              <h3 id="ing-title">Ingrédients</h3>
            </div>
            <div class="servings">
              <span class="servings__label">Pour combien ?</span>
              <div data-slot="servings">${servingsHtml()}</div>
            </div>
            <div data-slot="ingredients">${ingredientsHtml()}</div>
          </section>
          <section aria-labelledby="steps-title">
            <div class="section-head"><h3 id="steps-title">Étapes</h3></div>
            <ol class="steps">${recipe.steps.map((s) => `<li class="step"><p>${esc(s)}</p></li>`).join('')}</ol>
            ${recipe.tip ? `<p class="detail__tip"><strong>L'astuce ·</strong> ${esc(recipe.tip)}</p>` : ''}
          </section>
        </div>

        <div class="detail__actions">
          <span class="detail__actions-main" data-slot="menu">${menuButtonHtml()}</span>
          <button type="button" class="btn btn--outline" data-action="copy">${icons.copy}Copier les ingrédients</button>
          <a class="btn btn--outline" data-slot="mail" href="${esc(mailtoUrl(`Recette : ${recipe.title}`, ingredientsText()))}">${icons.mail}Envoyer par mail</a>
        </div>

        ${recipe.isUser ? `
          <div class="detail__owner">
            <button type="button" class="btn btn--ghost" data-action="edit">${icons.pen}Modifier</button>
            <button type="button" class="btn btn--ghost btn--danger" data-action="delete">${icons.trash}<span>Supprimer</span></button>
          </div>` : ''}
      </div>`;
  }

  const slot = (name) => scroller.querySelector(`[data-slot="${name}"]`);

  function refreshServings() {
    slot('servings').innerHTML = servingsHtml();
    slot('ingredients').innerHTML = ingredientsHtml();
    slot('menu').innerHTML = menuButtonHtml();
    slot('mail').href = mailtoUrl(`Recette : ${recipe.title}`, ingredientsText());
  }

  scroller.addEventListener('click', async (e) => {
    const step = e.target.closest('[data-step]');
    if (step) {
      servings = Math.max(MIN_SERVINGS, Math.min(MAX_SERVINGS, servings + Number(step.dataset.step)));
      refreshServings();
      return;
    }
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action || !recipe) return;

    switch (action) {
      case 'close':
        dialog.close();
        break;
      case 'fav':
        toggleFavorite(recipe.id);
        slot('fav').innerHTML = favButtonHtml();
        break;
      case 'menu':
        setMenuServings(recipe.id, servings);
        slot('menu').innerHTML = menuButtonHtml();
        toast(`Au menu : ${recipe.title}, ${servings} pers.`);
        break;
      case 'unmenu':
        removeFromMenu(recipe.id);
        slot('menu').innerHTML = menuButtonHtml();
        toast('Retirée du menu.');
        break;
      case 'copy':
        toast((await copyText(ingredientsText())) ? 'Ingrédients copiés.' : 'Copie impossible, désolé.');
        break;
      case 'edit':
        onEdit(recipe.id);
        break;
      case 'delete': {
        const button = e.target.closest('[data-action="delete"]');
        if (!confirmDelete) {
          confirmDelete = true;
          button.querySelector('span').textContent = 'Sûr ? Re-clique pour supprimer';
          return;
        }
        const id = recipe.id;
        userRecipesStore.set((list) => list.filter((r) => r.id !== id));
        removeFromMenu(id);
        favoritesStore.set((favs) => favs.filter((f) => f !== id));
        toast('Recette supprimée.');
        dialog.close();
        break;
      }
      default:
    }
  });

  scroller.addEventListener('change', (e) => {
    const box = e.target.closest('[data-ing]');
    if (!box) return;
    const index = Number(box.dataset.ing);
    if (box.checked) checked.add(index);
    else checked.delete(index);
  });

  // Clic sur le fond (hors contenu) = fermeture.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    recipe = null;
    onClose();
  });

  return {
    open(id) {
      const found = libraryStore.get().byId.get(id);
      if (!found) return false;
      const sameRecipe = recipe?.id === id;
      recipe = found;
      if (!sameRecipe) {
        servings = menuStore.get()[id] || found.servings;
        checked = new Set();
        confirmDelete = false;
      }
      render();
      if (!dialog.open) {
        dialog.showModal();
        document.body.classList.add('is-locked');
      }
      if (!sameRecipe) scroller.scrollTop = 0;
      return true;
    },
    close() {
      if (dialog.open) dialog.close();
    },
    isOpen: () => dialog.open,
  };
}

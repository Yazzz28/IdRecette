import { esc, plural } from '../utils/dom.js';
import { formatKcal, currentWeekLabel } from '../utils/format.js';
import { libraryStore, menuStore, shoppingStore, setMenuServings, removeFromMenu } from '../core/stores.js';
import { menuEntries, buildShoppingList } from '../core/shopping.js';
import { thumbColor } from '../core/library.js';
import { thumbContent } from '../ui/recipeCard.js';
import { icons } from '../ui/icons.js';
import { toast } from '../ui/toast.js';

/** Vue « Mon menu » : recettes choisies, portions, total kcal. */
export function createMenuView(root) {
  let confirmClear = false;

  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const id = el.closest('[data-id]')?.dataset.id;
    const menu = menuStore.get();
    switch (el.dataset.action) {
      case 'dec': setMenuServings(id, (menu[id] || 1) - 1); break;
      case 'inc': setMenuServings(id, (menu[id] || 1) + 1); break;
      case 'remove': removeFromMenu(id); toast('Retirée du menu.'); break;
      case 'clear':
        if (!confirmClear) {
          confirmClear = true;
          el.textContent = 'Sûr ? Re-clique pour vider';
          return;
        }
        menuStore.set({});
        toast('Menu vidé.');
        break;
      default:
    }
  });

  function render() {
    confirmClear = false;
    const { byId, categoriesById, status } = libraryStore.get();
    if (status === 'loading') return;
    const entries = menuEntries(menuStore.get(), byId);
    const portions = entries.reduce((s, e) => s + e.servings, 0);
    const kcal = entries.reduce((s, e) => s + e.recipe.kcalPerServing * e.servings, 0);
    const list = buildShoppingList(menuStore.get(), byId, { ...shoppingStore.get(), pantry: true });

    const head = `
      <header class="page-head">
        <p class="page-head__eyebrow">${esc(currentWeekLabel())}</p>
        <h1 class="page-head__title">Mon menu</h1>
      </header>`;

    if (!entries.length) {
      root.innerHTML = `<div class="container page">${head}
        <div class="empty">
          <span class="empty__icon">${icons.pot}</span>
          <h2>Ton menu est vide.</h2>
          <p>Ajoute des recettes avec le bouton + sur les cartes, ou depuis une fiche recette.</p>
          <a class="btn btn--encre" href="#/">Voir les recettes</a>
        </div></div>`;
      return;
    }

    root.innerHTML = `
      <div class="container page">
        ${head}
        <div class="stats stats--3">
          <div class="stat"><span class="stat__value">${entries.length}</span><span class="stat__label">${plural(entries.length, 'Recette', 'Recettes')}</span></div>
          <div class="stat"><span class="stat__value">${portions}</span><span class="stat__label">Portions</span></div>
          <div class="stat stat--accent"><span class="stat__value">${formatKcal(kcal)}</span><span class="stat__label">kcal au total</span></div>
        </div>

        <ul class="menu-list">
          ${entries.map(({ recipe, servings }) => `
            <li class="menu-item" data-id="${esc(recipe.id)}">
              <a class="menu-item__thumb" href="#/recette/${encodeURIComponent(recipe.id)}" style="--thumb:${thumbColor(recipe, categoriesById)}" aria-label="Voir ${esc(recipe.title)}">
                ${thumbContent(recipe, 'menu-item__emoji')}
              </a>
              <div class="menu-item__body">
                <a class="menu-item__title" href="#/recette/${encodeURIComponent(recipe.id)}">${esc(recipe.title)}</a>
                <p class="menu-item__meta num">${formatKcal(recipe.kcalPerServing)} kcal / pers. · ${formatKcal(recipe.kcalPerServing * servings)} kcal</p>
              </div>
              <div class="menu-item__controls">
                <div class="stepper stepper--sm" role="group" aria-label="Portions pour ${esc(recipe.title)}">
                  <button type="button" class="stepper__btn" data-action="dec" aria-label="Une portion de moins" ${servings <= 1 ? 'disabled' : ''}>${icons.minus}</button>
                  <span class="stepper__value">${servings} pers.</span>
                  <button type="button" class="stepper__btn stepper__btn--plus" data-action="inc" aria-label="Une portion de plus">${icons.plus}</button>
                </div>
                <button type="button" class="icon-btn icon-btn--ghost" data-action="remove" aria-label="Retirer ${esc(recipe.title)} du menu">${icons.trash}</button>
              </div>
            </li>`).join('')}
        </ul>

        <p class="callout">On a tout regroupé : <strong>${list.total} ${plural(list.total, 'article', 'articles')}</strong> pour la liste de courses. Pas besoin de calculer.</p>

        <div class="page-actions">
          <a class="btn btn--tomate" href="#/courses">${icons.cart}Générer la liste de courses</a>
          <a class="btn btn--outline" href="#/">${icons.plus}Ajouter une recette</a>
          <button type="button" class="btn btn--ghost" data-action="clear">Vider le menu</button>
        </div>
      </div>`;
  }

  menuStore.subscribe(render);
  libraryStore.subscribe(render);
  render();

  return { show: render, hide() {} };
}

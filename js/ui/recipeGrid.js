import { $$ } from '../utils/dom.js';
import { favoritesStore, menuStore, toggleFavorite, setMenuServings, removeFromMenu, DEFAULT_FILTERS, filtersStore } from '../core/stores.js';
import { recipeCard, syncCardState } from './recipeCard.js';
import { icons } from './icons.js';
import { toast } from './toast.js';

const EMPTY = `
  <div class="empty">
    <span class="empty__icon">${icons.pot}</span>
    <h2>Rien trouvé.</h2>
    <p>Même la V.1 faisait mieux… non, en fait. Essaie un autre mot ou enlève un filtre.</p>
    <button type="button" class="btn btn--outline" data-action="reset">Tout réafficher</button>
  </div>`;

const SKELETON = Array.from({ length: 6 }, () => `
  <div class="card card--skeleton" aria-hidden="true">
    <div class="card__thumb"></div>
    <div class="card__body">
      <div class="skeleton-line skeleton-line--title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line skeleton-line--short"></div>
    </div>
  </div>`).join('');

/** Grille de cartes. Ne re-rend les cartes que si la liste affichée change. */
export function mountRecipeGrid(root, { getRecipe }) {
  let renderedKey = null;

  root.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    if (button.dataset.action === 'reset') {
      filtersStore.set({ ...DEFAULT_FILTERS });
      return;
    }
    const id = button.closest('[data-id]')?.dataset.id;
    const recipe = id && getRecipe(id);
    if (!recipe) return;
    e.preventDefault();
    if (button.dataset.action === 'fav') {
      toggleFavorite(id);
    } else if (button.dataset.action === 'menu') {
      if (menuStore.get()[id]) {
        removeFromMenu(id);
        toast('Retirée du menu.');
      } else {
        setMenuServings(id, recipe.servings);
        toast(`« ${recipe.title} » ajoutée au menu.`);
      }
    }
  });

  return {
    loading() {
      renderedKey = null;
      root.setAttribute('aria-busy', 'true');
      root.innerHTML = SKELETON;
    },
    render(recipes, { categoriesById }) {
      root.removeAttribute('aria-busy');
      const favs = new Set(favoritesStore.get());
      const menu = menuStore.get();
      const key = recipes.map((r) => r.id).join('|') || '∅';

      if (key === renderedKey) {
        $$('.card[data-id]', root).forEach((card) => {
          const id = card.dataset.id;
          syncCardState(card, { isFav: favs.has(id), inMenu: !!menu[id] });
        });
        return;
      }

      renderedKey = key;
      root.innerHTML = recipes.length
        ? recipes.map((r, index) => recipeCard(r, {
          categoriesById, index, isFav: favs.has(r.id), inMenu: !!menu[r.id],
        })).join('')
        : EMPTY;
    },
    invalidate() {
      renderedKey = null;
    },
  };
}

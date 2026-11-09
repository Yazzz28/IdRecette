import { $, esc, plural } from '../utils/dom.js';
import { filtersStore, favoritesStore, menuStore, libraryStore, DEFAULT_FILTERS } from '../core/stores.js';
import { filterRecipes, filterWithoutCategory, sortRecipes, collectTags, countByCategory } from '../core/filters.js';
import { mountSearchBar } from '../ui/searchBar.js';
import { mountCategoryChips } from '../ui/categoryChips.js';
import { mountTagFilters } from '../ui/tagFilters.js';
import { mountRecipeGrid } from '../ui/recipeGrid.js';

const LOAD_ERROR = (error) => `
  <div class="notice">
    <h2>Impossible de lire <code>data.json</code></h2>
    <p>${esc(error?.message || 'Erreur inconnue.')}</p>
    <p>Si tu as ouvert <code>index.html</code> en double-cliquant dessus, le navigateur bloque la lecture du fichier.
    Lance un petit serveur local : extension <strong>Live Server</strong> dans VS Code, ou <code>npx serve .</code> dans le dossier du projet.</p>
    <p>Si le serveur tourne déjà, vérifie que <code>data.json</code> est un JSON valide : <code>node scripts/validate-data.mjs</code>.</p>
  </div>`;

/** Vue catalogue : recherche, catégories, tags, tri, grille. */
export function createCatalogView(root) {
  root.innerHTML = `
    <div class="container hero">
      <p class="hero__hello">Salut 👋</p>
      <h1 class="hero__title">On se fait une <em>glace</em> ?</h1>
      <p class="hero__sub">Glaces Ninja Creami healthy : lait végétal, fruits, et des toppings qui changent tout.</p>
      <div class="hero__search" data-search></div>
    </div>
    <div class="toolbar-sentinel" aria-hidden="true"></div>
    <div class="toolbar">
      <div class="container toolbar__inner">
        <div class="toolbar__row">
          <div class="chips" data-categories role="group" aria-label="Catégories"></div>
        </div>
        <div class="toolbar__row toolbar__row--split">
          <div class="chips" data-tags role="group" aria-label="Filtres"></div>
          <label class="select">Trier <select data-sort aria-label="Trier les recettes"></select></label>
        </div>
      </div>
    </div>
    <div class="container results">
      <div data-error></div>
      <div class="results__meta">
        <p class="results__count" data-count aria-live="polite"></p>
        <button type="button" class="btn btn--ghost" data-reset hidden>Effacer les filtres</button>
      </div>
      <div class="grid" data-grid></div>
    </div>`;

  let visible = true;
  mountSearchBar($('[data-search]', root), { isActive: () => visible });
  const renderCategories = mountCategoryChips($('[data-categories]', root));
  const renderTags = mountTagFilters($('[data-tags]', root), $('[data-sort]', root));
  const grid = mountRecipeGrid($('[data-grid]', root), { getRecipe: (id) => libraryStore.get().byId.get(id) });
  const count = $('[data-count]', root);
  const reset = $('[data-reset]', root);
  const errorSlot = $('[data-error]', root);

  reset.addEventListener('click', () => filtersStore.set({ ...DEFAULT_FILTERS }));

  // Bordure sous la barre de filtres quand elle colle en haut.
  const toolbar = $('.toolbar', root);
  new IntersectionObserver(([entry]) => toolbar.classList.toggle('is-stuck', !entry.isIntersecting))
    .observe($('.toolbar-sentinel', root));

  function render() {
    const library = libraryStore.get();
    if (library.status === 'loading') {
      grid.loading();
      return;
    }
    errorSlot.innerHTML = library.status === 'error' ? LOAD_ERROR(library.error) : '';

    const filters = filtersStore.get();
    const favorites = favoritesStore.get();
    const withoutCategory = filterWithoutCategory(library.recipes, filters, favorites);
    const results = sortRecipes(filterRecipes(library.recipes, filters, favorites), filters.sort);

    renderCategories({
      categories: library.categories,
      counts: countByCategory(withoutCategory),
      total: withoutCategory.length,
      active: filters.category,
    });
    renderTags({
      tags: collectTags(library.recipes),
      filters,
      favCount: favorites.filter((id) => library.byId.has(id)).length,
    });

    const n = results.length;
    count.innerHTML = `<strong>${n}</strong> ${plural(n, 'glace', 'glaces')} ${filters.query ? `pour « ${esc(filters.query)} »` : 'dans le congélo'}`;
    const isFiltered = filters.query || filters.category !== 'all' || filters.tags.length || filters.favOnly;
    reset.hidden = !isFiltered;

    grid.render(results, library);
  }

  filtersStore.subscribe(render);
  favoritesStore.subscribe(render);
  menuStore.subscribe(render);
  libraryStore.subscribe(() => {
    grid.invalidate();
    render();
  });
  render();

  return {
    show() { visible = true; },
    hide() { visible = false; },
  };
}

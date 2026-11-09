import { createStore } from './store.js';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export const DEFAULT_FILTERS = { query: '', category: 'all', tags: [], sort: 'default', favOnly: false };

/** Filtres du catalogue (mémorisés entre deux visites). */
export const filtersStore = createStore(DEFAULT_FILTERS, {
  persist: 'filters',
  sanitize: (v) => ({ ...DEFAULT_FILTERS, ...(isObject(v) ? v : {}), tags: Array.isArray(v?.tags) ? v.tags : [] }),
});

/** Identifiants des recettes favorites. */
export const favoritesStore = createStore([], {
  persist: 'favorites',
  sanitize: (v) => (Array.isArray(v) ? v : []),
});

/** Menu : { [recipeId]: portions }. */
export const menuStore = createStore({}, {
  persist: 'menu',
  sanitize: (v) => (isObject(v) ? v : {}),
});

/** Liste de courses : cases cochées, articles ajoutés à la main, affichage du placard. */
export const shoppingStore = createStore({ checked: {}, manual: [], pantry: false }, {
  persist: 'shopping',
  sanitize: (v) => ({
    checked: isObject(v?.checked) ? v.checked : {},
    manual: Array.isArray(v?.manual) ? v.manual : [],
    pantry: !!v?.pantry,
  }),
});

/** Recettes créées dans l'app (format identique à data.json). */
export const userRecipesStore = createStore([], {
  persist: 'userRecipes',
  sanitize: (v) => (Array.isArray(v) ? v : []),
});

/** Brouillon du formulaire de création. */
export const draftStore = createStore(null, { persist: 'draft' });

/** Bibliothèque chargée (data.json + recettes perso). Non persistée. */
export const libraryStore = createStore({
  status: 'loading',
  error: null,
  categories: [],
  recipes: [],
  byId: new Map(),
});

export function toggleFavorite(id) {
  favoritesStore.set((favs) => (favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]));
}

export function setMenuServings(id, servings) {
  const n = Math.max(1, Math.min(24, Math.round(servings)));
  menuStore.set((menu) => ({ ...menu, [id]: n }));
}

export function removeFromMenu(id) {
  menuStore.set((menu) => {
    const next = { ...menu };
    delete next[id];
    return next;
  });
}

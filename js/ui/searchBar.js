import { debounce, isTyping } from '../utils/dom.js';
import { filtersStore } from '../core/stores.js';
import { icons } from './icons.js';

/** Champ de recherche plein texte (titre, ingrédients, tags…), raccourci « / ». */
export function mountSearchBar(root, { isActive }) {
  root.innerHTML = `
    <form class="search" role="search">
      <span class="search__icon">${icons.search}</span>
      <label for="search-input" class="sr-only">Rechercher une recette</label>
      <input id="search-input" class="search__input" type="search" autocomplete="off" spellcheck="false"
        placeholder="Curry, fraise, apéro, airfryer…" enterkeyhint="search">
      <kbd class="search__kbd" aria-hidden="true">/</kbd>
      <button type="button" class="search__clear">Effacer</button>
    </form>`;

  const form = root.querySelector('.search');
  const input = root.querySelector('.search__input');
  const clear = root.querySelector('.search__clear');

  const syncClass = () => form.classList.toggle('has-value', input.value.length > 0);
  const commit = debounce((value) => filtersStore.set((f) => ({ ...f, query: value })), 150);

  input.value = filtersStore.get().query;
  syncClass();

  input.addEventListener('input', () => {
    syncClass();
    commit(input.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    input.blur();
  });

  clear.addEventListener('click', () => {
    input.value = '';
    syncClass();
    filtersStore.set((f) => ({ ...f, query: '' }));
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      clear.click();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !isTyping() && isActive() && !document.querySelector('dialog[open]')) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  // Si les filtres sont réinitialisés ailleurs, on resynchronise le champ.
  filtersStore.subscribe((f) => {
    if (f.query !== input.value && document.activeElement !== input) {
      input.value = f.query;
      syncClass();
    }
  });
}

import { esc } from '../utils/dom.js';
import { filtersStore } from '../core/stores.js';
import { SORTS } from '../core/filters.js';
import { icons } from './icons.js';

/** Chips de tags cumulables + favoris + tri. */
export function mountTagFilters(chipsRoot, sortSelect) {
  sortSelect.innerHTML = SORTS.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join('');
  sortSelect.value = filtersStore.get().sort;
  sortSelect.addEventListener('change', () => filtersStore.set((f) => ({ ...f, sort: sortSelect.value })));

  chipsRoot.addEventListener('click', (e) => {
    const chip = e.target.closest('button');
    if (!chip) return;
    if (chip.dataset.fav !== undefined) {
      filtersStore.set((f) => ({ ...f, favOnly: !f.favOnly }));
      return;
    }
    const tag = chip.dataset.tag;
    filtersStore.set((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  });

  return function render({ tags, filters, favCount }) {
    sortSelect.value = filters.sort;
    const favChip = `
      <button type="button" class="chip chip--sm chip--fav" data-fav aria-pressed="${filters.favOnly}">
        ${filters.favOnly ? icons.heartFilled : icons.heart} Favoris <span class="chip__count">${favCount}</span>
      </button>`;
    chipsRoot.innerHTML = favChip + tags
      .map((t) => `<button type="button" class="chip chip--sm" data-tag="${esc(t)}" aria-pressed="${filters.tags.includes(t)}">${esc(t)}</button>`)
      .join('');
  };
}

import { esc } from '../utils/dom.js';
import { filtersStore } from '../core/stores.js';

/** Chips de catégories avec compteur. */
export function mountCategoryChips(root) {
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-category]');
    if (!chip) return;
    filtersStore.set((f) => ({ ...f, category: chip.dataset.category }));
  });

  return function render({ categories, counts, total, active }) {
    const chip = (id, label, count) => `
      <button type="button" class="chip" data-category="${esc(id)}" aria-pressed="${active === id}">
        ${esc(label)} <span class="chip__count">${count}</span>
      </button>`;
    root.innerHTML = chip('all', 'Tout', total)
      + categories.map((c) => chip(c.id, c.label, counts.get(c.id) || 0)).join('');
  };
}

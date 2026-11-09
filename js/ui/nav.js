import { $$ } from '../utils/dom.js';
import { menuStore, shoppingStore, libraryStore } from '../core/stores.js';
import { buildShoppingList } from '../core/shopping.js';
import { icons } from './icons.js';

/** Met à jour l'onglet actif et les pastilles (menu, courses restantes) des deux barres de nav. */
export function initNav() {
  $$('[data-icon]').forEach((el) => { el.innerHTML = icons[el.dataset.icon] || ''; });

  const updateBadges = () => {
    const { byId } = libraryStore.get();
    const menuCount = Object.keys(menuStore.get()).filter((id) => byId.has(id)).length;
    const list = buildShoppingList(menuStore.get(), byId, shoppingStore.get());
    setBadge('menu', menuCount);
    setBadge('courses', list.total - list.done);
  };
  [menuStore, shoppingStore, libraryStore].forEach((s) => s.subscribe(updateBadges));
  updateBadges();
}

function setBadge(route, count) {
  $$(`[data-nav="${route}"] .nav__badge`).forEach((badge) => {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.hidden = count <= 0;
  });
}

export function setActiveNav(route) {
  $$('[data-nav]').forEach((link) => {
    const active = link.dataset.nav === route;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

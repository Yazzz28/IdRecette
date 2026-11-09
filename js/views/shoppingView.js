import { esc, plural } from '../utils/dom.js';
import { capitalize } from '../utils/text.js';
import { copyText, mailtoUrl } from '../utils/clipboard.js';
import { libraryStore, menuStore, shoppingStore } from '../core/stores.js';
import { buildShoppingList, shoppingToText } from '../core/shopping.js';
import { icons } from '../ui/icons.js';
import { toast } from '../ui/toast.js';

/** Vue « Liste de courses » générée depuis le menu, avec ajouts manuels. */
export function createShoppingView(root) {
  const current = () => buildShoppingList(menuStore.get(), libraryStore.get().byId, shoppingStore.get());

  root.addEventListener('change', (e) => {
    const box = e.target.closest('[data-key]');
    if (!box) return;
    const key = box.dataset.key;
    shoppingStore.set((s) => ({ ...s, checked: { ...s.checked, [key]: box.checked } }));
  });

  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = root.querySelector('[name="item-name"]');
    const qtyInput = root.querySelector('[name="item-qty"]');
    const name = nameInput.value.trim();
    if (!name) return;
    shoppingStore.set((s) => ({
      ...s,
      manual: [...s.manual, { id: Date.now().toString(36), name: capitalize(name), qty: qtyInput.value.trim() }],
    }));
    root.querySelector('[name="item-name"]')?.focus();
  });

  root.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    switch (el.dataset.action) {
      case 'remove-manual': {
        const id = el.dataset.id;
        shoppingStore.set((s) => {
          const checked = { ...s.checked };
          delete checked[`man:${id}`];
          return { ...s, checked, manual: s.manual.filter((m) => m.id !== id) };
        });
        break;
      }
      case 'pantry':
        shoppingStore.set((s) => ({ ...s, pantry: !s.pantry }));
        break;
      case 'uncheck':
        shoppingStore.set((s) => ({ ...s, checked: {} }));
        toast('Tout est décoché.');
        break;
      case 'copy':
        toast((await copyText(shoppingToText(current()))) ? 'Liste copiée.' : 'Copie impossible, désolé.');
        break;
      default:
    }
  });

  function render() {
    if (libraryStore.get().status === 'loading') return;
    const list = current();
    const shopping = shoppingStore.get();
    const hadFocus = document.activeElement?.name === 'item-name';
    const pct = list.total ? Math.round((list.done / list.total) * 100) : 0;
    const subtitle = list.entries.length
      ? list.entries.map((e) => esc(e.recipe.title)).join(' · ')
      : 'Ton menu est vide : ajoute des recettes pour remplir la liste.';

    root.innerHTML = `
      <div class="container page page--narrow">
        <header class="page-head">
          <p class="page-head__eyebrow">${list.entries.length} ${plural(list.entries.length, 'recette', 'recettes')} au menu</p>
          <h1 class="page-head__title">Liste de courses</h1>
          <p class="page-head__sub">${subtitle}</p>
        </header>

        ${list.total ? `
          <div class="progress" aria-label="${list.done} sur ${list.total} articles cochés">
            <div class="progress__bar"><span style="width:${pct}%"></span></div>
            <span class="progress__label num">${list.done} / ${list.total}</span>
          </div>` : ''}

        ${list.groups.map((g) => `
          <section class="shop-group">
            <h2 class="shop-group__title">${esc(g.name)}</h2>
            <ul class="shop-list">
              ${g.items.map((i) => `
                <li class="shop-item">
                  <label class="shop-item__label">
                    <input type="checkbox" data-key="${esc(i.key)}" ${i.checked ? 'checked' : ''}>
                    <span class="shop-item__text">
                      <span class="shop-item__name">${esc(i.name)}</span>
                      <span class="shop-item__src">${esc(i.source)}</span>
                    </span>
                    <span class="shop-item__qty num">${esc(i.qty)}</span>
                  </label>
                  ${g.manual ? `<button type="button" class="icon-btn icon-btn--ghost" data-action="remove-manual" data-id="${esc(i.id)}" aria-label="Supprimer ${esc(i.name)}">${icons.close}</button>` : ''}
                </li>`).join('')}
            </ul>
          </section>`).join('')}

        <form class="add-item" autocomplete="off">
          <label class="sr-only" for="item-name">Article à ajouter</label>
          <input id="item-name" name="item-name" class="input" placeholder="Ajouter un article (cornets, sauce chocolat…)" required>
          <label class="sr-only" for="item-qty">Quantité</label>
          <input id="item-qty" name="item-qty" class="input input--qty" placeholder="Qté">
          <button class="btn btn--encre" type="submit">${icons.plus}<span>Ajouter</span></button>
        </form>

        <button type="button" class="btn btn--ghost" data-action="pantry">
          ${shopping.pantry ? 'Masquer le placard' : `Afficher le placard${list.hiddenPantry ? ` (${list.hiddenPantry})` : ''}`}
        </button>

        <div class="page-actions">
          <a class="btn btn--encre ${list.total ? '' : 'is-disabled'}" href="${esc(mailtoUrl(`Liste de courses · ${list.total} articles`, shoppingToText(list)))}">${icons.mail}Envoyer par mail</a>
          <button type="button" class="btn btn--outline" data-action="copy" ${list.total ? '' : 'disabled'}>${icons.copy}Copier</button>
          ${list.done ? `<button type="button" class="btn btn--ghost" data-action="uncheck">Tout décocher</button>` : ''}
        </div>
      </div>`;

    if (hadFocus) root.querySelector('[name="item-name"]')?.focus();
  }

  [menuStore, shoppingStore, libraryStore].forEach((s) => s.subscribe(render));
  render();

  return { show: render, hide() {} };
}
